from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .crud import get_cases, get_case_by_id, create_case, update_case, delete_case, get_statistics
from .schemas import Case as CaseSchema, CaseCreate, CaseUpdate
from datetime import datetime
from openpyxl import load_workbook
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quản lý Hồ Sơ Án API")

static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/cases/", response_model=list[CaseSchema])
def read_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cases = get_cases(db, skip=skip, limit=limit)
    return cases

@app.get("/cases/{case_id}", response_model=CaseSchema)
def read_case(case_id: int, db: Session = Depends(get_db)):
    db_case = get_case_by_id(db, case_id)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case

@app.post("/cases/", response_model=CaseSchema)
def create_new_case(case: CaseCreate, db: Session = Depends(get_db)):
    return create_case(db, case)

@app.put("/cases/{case_id}", response_model=CaseSchema)
def update_existing_case(case_id: int, case: CaseUpdate, db: Session = Depends(get_db)):
    db_case = update_case(db, case_id, case)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case

@app.delete("/cases/{case_id}")
def delete_existing_case(case_id: int, db: Session = Depends(get_db)):
    db_case = delete_case(db, case_id)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case deleted"}

@app.post("/upload-excel/")
def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="File must be .xlsx")
    
    wb = load_workbook(file.file)
    ws = wb.active
    
    # Read header row
    headers = []
    for cell in ws[1]:
        headers.append(cell.value)
    
    # Read data rows
    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=False), start=2):
        row_data = {}
        for col_idx, cell in enumerate(row):
            if col_idx < len(headers):
                row_data[headers[col_idx]] = cell.value
        
        stt = row_data.get('STT')
        if stt is None:
            stt = None
        else:
            stt = int(stt) if stt else None
        
        case_data = CaseCreate(
            stt=stt,
            bien_lai_an_phi=str(row_data.get('Biên lai án phí', '')),
            so_thu_ly=str(row_data.get('Số thụ lý', '')),
            ngay_thu_ly=row_data.get('Ngày thụ lý'),
            ten_duong_su=str(row_data.get('Tên đương sự', '')),
            quan_he_tranh_chap=str(row_data.get('Quan hệ tranh chấp', '')),
            loai_an=str(row_data.get('Loại án', '')),
            trang_thai=str(row_data.get('Trạng thái', 'Hòa giải thành'))
        )
        create_case(db, case_data)
    return {"message": "Cases imported successfully"}

@app.get("/statistics/")
def get_stats(db: Session = Depends(get_db)):
    return get_statistics(db)


if __name__ == '__main__':
    import uvicorn

    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host='0.0.0.0', port=port)
