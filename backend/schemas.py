from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CaseBase(BaseModel):
    stt: Optional[int] = None
    bien_lai_an_phi: Optional[str] = None
    so_thu_ly: Optional[str] = None
    ngay_thu_ly: Optional[datetime] = None
    duong_su: Optional[str] = None
    quan_he_phap_luat: Optional[str] = None
    loai_an: Optional[str] = None
    ngay_xet_xu: Optional[datetime] = None
    qd_cnstt: Optional[str] = None
    trang_thai_giai_quyet: Optional[str] = None
    ghi_chu: Optional[str] = None
    ma_hoa: Optional[bool] = False

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    stt: Optional[int] = None
    bien_lai_an_phi: Optional[str] = None
    so_thu_ly: Optional[str] = None
    ngay_thu_ly: Optional[datetime] = None
    duong_su: Optional[str] = None
    quan_he_phap_luat: Optional[str] = None
    loai_an: Optional[str] = None
    ngay_xet_xu: Optional[datetime] = None
    qd_cnstt: Optional[str] = None
    trang_thai_giai_quyet: Optional[str] = None
    ghi_chu: Optional[str] = None
    ma_hoa: Optional[bool] = None

class Case(CaseBase):
    id: int
    han_giai_quyet: Optional[datetime] = None

    class Config:
        from_attributes = True