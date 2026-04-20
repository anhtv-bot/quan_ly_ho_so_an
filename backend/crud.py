from sqlalchemy import func
from sqlalchemy.orm import Session
from .models import Case
from .schemas import CaseCreate, CaseUpdate
from datetime import datetime

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
    cases = db.query(Case).all()
    now = datetime.now()

    active = [c for c in cases if not c.is_completed()]
    warning = [c for c in active if c.han_giai_quyet and 0 <= (c.han_giai_quyet - now).days < 15]
    overdue = [c for c in active if c.han_giai_quyet and now > c.han_giai_quyet]

    type_counts = {}
    status_counts = {}
    category_counts = {
        'Khẩn cấp': 0,
        'Ưu tiên': 0,
        'Bình thường': 0
    }

    for c in cases:
        case_type = c.loai_an or 'Khác'
        type_counts[case_type] = type_counts.get(case_type, 0) + 1

        status = c.trang_thai_giai_quyet or 'Chưa xác định'
        status_counts[status] = status_counts.get(status, 0) + 1

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
        "dang_giai_quyet": len(active),
        "an_sap_het_han": len(warning),
        "an_qua_han": len(overdue),
        "type_counts": type_counts,
        "status_counts": status_counts,
        "category_counts": category_counts
    }