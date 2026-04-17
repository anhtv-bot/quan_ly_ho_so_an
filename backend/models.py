from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
from datetime import datetime, timedelta

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    stt = Column(Integer)
    bien_lai_an_phi = Column(String)
    so_thu_ly = Column(String, unique=True, index=True)
    ngay_thu_ly = Column(DateTime)
    ten_duong_su = Column(String)
    quan_he_tranh_chap = Column(String)
    loai_an = Column(String)
    trang_thai = Column(String, default="Hòa giải thành")  # Hòa giải thành, Xét xử, Đình chỉ, Tạm đình chỉ, Bản án
    han_giai_quyet = Column(DateTime)

    def calculate_deadline(self):
        if self.loai_an == "KDTM":
            return self.ngay_thu_ly + timedelta(days=90)
        else:
            return self.ngay_thu_ly + timedelta(days=180)

    def is_overdue(self):
        now = datetime.now()
        return now > self.han_giai_quyet and not self.is_completed()

    def is_warning(self):
        now = datetime.now()
        days_left = (self.han_giai_quyet - now).days
        return days_left < 15 and not self.is_completed()

    def is_completed(self):
        return self.trang_thai in ["Hòa giải thành", "Xét xử", "Đình chỉ", "Tạm đình chỉ", "Bản án"]