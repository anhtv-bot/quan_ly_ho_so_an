import os
import sqlite3
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./data/cases.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

EXPECTED_CASE_COLUMNS = {
    'id',
    'stt',
    'bien_lai_an_phi',
    'so_thu_ly',
    'ngay_thu_ly',
    'duong_su',
    'quan_he_phap_luat',
    'loai_an',
    'ngay_xet_xu',
    'qd_cnstt',
    'trang_thai_giai_quyet',
    'ghi_chu',
    'ma_hoa',
    'han_giai_quyet'
}


def _get_db_path():
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
        return os.path.abspath(SQLALCHEMY_DATABASE_URL.replace("sqlite:///", ""))
    raise RuntimeError("Unsupported database URL")


def initialize_database():
    db_path = _get_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        try:
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cases';")
            if cur.fetchone():
                cur.execute("PRAGMA table_info('cases');")
                existing = {row[1] for row in cur.fetchall()}
                if not EXPECTED_CASE_COLUMNS.issubset(existing):
                    backup_path = f"{db_path}.bak.{datetime.now():%Y%m%d%H%M%S}"
                    conn.close()
                    os.rename(db_path, backup_path)
                    print(f"[database] Old schema detected and backed up to {backup_path}")
                    Base.metadata.create_all(bind=engine)
                    return
        finally:
            conn.close()

    Base.metadata.create_all(bind=engine)
