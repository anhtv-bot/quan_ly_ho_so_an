from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CaseBase(BaseModel):
    stt: Optional[int] = None
    bien_lai_an_phi: str
    so_thu_ly: str
    ngay_thu_ly: datetime
    ten_duong_su: str
    quan_he_tranh_chap: str
    loai_an: str
    trang_thai: str

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    trang_thai: Optional[str] = None

class Case(CaseBase):
    id: int
    han_giai_quyet: datetime

    class Config:
        from_attributes = True