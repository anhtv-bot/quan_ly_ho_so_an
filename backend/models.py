from sqlalchemy import Column, Integer, String, DateTime, Boolean
from .database import Base
from datetime import datetime, timedelta

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    stt = Column(Integer, nullable=True)
    bien_lai_an_phi = Column(String, nullable=True)
    so_thu_ly = Column(String, index=True, nullable=True)
    ngay_thu_ly = Column(DateTime, nullable=True)
    duong_su = Column(String, nullable=True)  # Tên các đương sự
    quan_he_phap_luat = Column(String, nullable=True)  # Ví dụ: Xin ly hôn
    loai_an = Column(String, nullable=True)
    ngay_xet_xu = Column(DateTime, nullable=True)  # Ngày xét xử
    qd_cnstt = Column(String, nullable=True)  # Quyết định công nhận sự thỏa thuận
    trang_thai_giai_quyet = Column(String, default="Hòa giải thành", nullable=True)  # Hòa giải thành (HGT), Đình chỉ (ĐC), Nhập vụ án (NVA), Chuyển vụ án
    ghi_chu = Column(String, nullable=True)  # Ghi chú bổ sung
    ma_hoa = Column(Boolean, default=False, nullable=False)  # Đã mã hóa
    han_giai_quyet = Column(DateTime, nullable=True)

    def calculate_deadline(self):
        if not self.ngay_thu_ly:
            return None
        if getattr(self, 'loai_an', '') == "KDTM":
            return self.ngay_thu_ly + timedelta(days=90)
        return self.ngay_thu_ly + timedelta(days=180)

    def is_overdue(self):
        now = datetime.now()
        return now > self.han_giai_quyet and not self.is_completed()

    def is_warning(self):
        now = datetime.now()
        days_left = (self.han_giai_quyet - now).days
        return days_left < 15 and not self.is_completed()

    def is_completed(self):
        return self.trang_thai_giai_quyet in ["Hòa giải thành", "Đình chỉ", "Nhập vụ án", "Chuyển vụ án"]