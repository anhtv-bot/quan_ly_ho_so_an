from sqlalchemy import func
from sqlalchemy.orm import Session
from .models import Case
from .schemas import CaseCreate, CaseUpdate
from datetime import datetime, timedelta

STATUS_CHOICES = [
    'Đang giải quyết',
    'Hòa giải thành',
    'Đình chỉ',
    'Tạm đình chỉ',
    'Nhập vụ án',
    'Chuyển vụ án',
    'Xét xử',
    'Bản án'
]

CATEGORY_CHOICES = ['Khẩn cấp', 'Ưu tiên', 'Bình thường']

def parse_date_string(date_str):
    """Parse date string to datetime object"""
    if not date_str or date_str == '':
        return None
    if isinstance(date_str, datetime):
        return date_str
    try:
        # Try ISO format first
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        # Try DD/MM/YYYY or DD-MM-YYYY format
        for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
    return None

def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Case).offset(skip).limit(limit).all()

def get_case_by_id(db: Session, case_id: int):
    return db.query(Case).filter(Case.id == case_id).first()

def create_case(db: Session, case: CaseCreate):
    # Auto-assign STT if not provided
    if case.stt is None:
        max_stt = db.query(func.max(Case.stt)).scalar()
        stt = (max_stt or 0) + 1
    else:
        stt = case.stt
    
    # Parse dates
    ngay_thu_ly_parsed = parse_date_string(case.ngay_thu_ly)
    ngay_xet_xu_parsed = parse_date_string(case.ngay_xet_xu)
    
    db_case = Case(
        stt=stt,
        bien_lai_an_phi=case.bien_lai_an_phi or "",
        so_thu_ly=case.so_thu_ly,
        ngay_thu_ly=ngay_thu_ly_parsed,
        duong_su=case.duong_su or "",
        quan_he_phap_luat=case.quan_he_phap_luat or "",
        loai_an=case.loai_an or "",
        ngay_xet_xu=ngay_xet_xu_parsed,
        qd_cnstt=case.qd_cnstt or "",
        trang_thai_giai_quyet=case.trang_thai_giai_quyet or "Hòa giải thành",
        ghi_chu=case.ghi_chu or "",
        ma_hoa=case.ma_hoa if case.ma_hoa is not None else False,
        han_giai_quyet=None  # Will be calculated
    )
    db_case.han_giai_quyet = db_case.calculate_deadline()
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

def update_case(db: Session, case_id: int, case_update: CaseUpdate):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case:
        updated_fields = case_update.dict(exclude_unset=True)
        
        # Parse dates if they are strings
        if 'ngay_thu_ly' in updated_fields:
            updated_fields['ngay_thu_ly'] = parse_date_string(updated_fields['ngay_thu_ly'])
        if 'ngay_xet_xu' in updated_fields:
            updated_fields['ngay_xet_xu'] = parse_date_string(updated_fields['ngay_xet_xu'])
        
        for key, value in updated_fields.items():
            setattr(db_case, key, value)

        if 'ngay_thu_ly' in updated_fields or 'loai_an' in updated_fields:
            db_case.han_giai_quyet = db_case.calculate_deadline()

        db.commit()
        db.refresh(db_case)
    return db_case

def delete_case(db: Session, case_id: int):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case:
        db.delete(db_case)
        db.commit()
    return db_case

def get_statistics(db: Session):
    now = datetime.now()

    # Count active cases (not completed)
    active_count = db.query(Case).filter(Case.trang_thai_giai_quyet.not_in(["Hòa giải thành", "Đình chỉ", "Nhập vụ án", "Chuyển vụ án"])).count()
    
    # Count warning cases (active and deadline within 15 days)
    warning_count = db.query(Case).filter(
        Case.trang_thai_giai_quyet.not_in(["Hòa giải thành", "Đình chỉ", "Nhập vụ án", "Chuyển vụ án"]),
        Case.han_giai_quyet != None,
        Case.han_giai_quyet >= now,
        (Case.han_giai_quyet - now) <= timedelta(days=15)
    ).count()
    
    # Count overdue cases (active and past deadline)
    overdue_count = db.query(Case).filter(
        Case.trang_thai_giai_quyet.not_in(["Hòa giải thành", "Đình chỉ", "Nhập vụ án", "Chuyển vụ án"]),
        Case.han_giai_quyet != None,
        Case.han_giai_quyet < now
    ).count()

    # Count status directly from database
    status_counts = {}
    for status in STATUS_CHOICES:
        status_counts[status] = db.query(Case).filter(Case.trang_thai_giai_quyet == status).count()
    
    # Handle cases with invalid or null status -> assign to 'Đang giải quyết'
    invalid_count = db.query(Case).filter(
        (Case.trang_thai_giai_quyet == None) | (Case.trang_thai_giai_quyet.not_in(STATUS_CHOICES))
    ).count()
    status_counts['Đang giải quyết'] += invalid_count

    # Note: type_counts and category_counts are kept for potential future use, but not used in frontend
    type_counts = {}
    category_counts = {category: 0 for category in CATEGORY_CHOICES}
    
    # For type_counts (if needed)
    cases = db.query(Case).all()
    for c in cases:
        case_type = c.loai_an or 'Khác'
        type_counts[case_type] = type_counts.get(case_type, 0) + 1

        # Category logic (kept for compatibility)
        if c.ngay_thu_ly:
            days_since = (now - c.ngay_thu_ly).days
        else:
            days_since = None

        category = 'Bình thường'
        if c.loai_an == 'Hình sự' and days_since is not None and days_since < 30:
            category = 'Khẩn cấp'
        elif c.loai_an == 'KDTM' and days_since is not None and days_since < 15:
            category = 'Ưu tiên'

        category_counts[category] = category_counts.get(category, 0) + 1

    return {
        "dang_giai_quyet": active_count,
        "an_sap_het_han": warning_count,
        "an_qua_han": overdue_count,
        "type_counts": type_counts,
        "status_counts": status_counts,
        "category_counts": category_counts
    }