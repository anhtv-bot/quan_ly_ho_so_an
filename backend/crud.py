from sqlalchemy import func
from sqlalchemy.orm import Session
from .models import Case
from .schemas import CaseCreate, CaseUpdate
from datetime import datetime

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
    
    db_case = Case(
        stt=stt,
        bien_lai_an_phi=case.bien_lai_an_phi,
        so_thu_ly=case.so_thu_ly,
        ngay_thu_ly=case.ngay_thu_ly,
        ten_duong_su=case.ten_duong_su,
        quan_he_tranh_chap=case.quan_he_tranh_chap,
        loai_an=case.loai_an,
        trang_thai=case.trang_thai,
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
        for key, value in case_update.dict(exclude_unset=True).items():
            setattr(db_case, key, value)
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
    active = [c for c in cases if not c.is_completed()]
    warning = [c for c in active if c.is_warning()]
    overdue = [c for c in active if c.is_overdue()]
    return {
        "total_active": len(active),
        "warning": len(warning),
        "overdue": len(overdue)
    }