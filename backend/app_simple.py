from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime, timedelta
import json
import os
from flask_cors import CORS
from openpyxl import load_workbook

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_FILE = os.path.join(ROOT_DIR, 'cases.json')

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    return {'cases': [], 'next_id': 1, 'next_stt': 1}

def save_db(db):
    with open(DB_FILE, 'w') as f:
        json.dump(db, f, indent=2, default=str)

def calculate_deadline(ngay_thu_ly, loai_an):
    date = datetime.fromisoformat(ngay_thu_ly) if isinstance(ngay_thu_ly, str) else ngay_thu_ly
    if loai_an == "KDTM":
        return (date + timedelta(days=90)).isoformat()
    else:
        return (date + timedelta(days=180)).isoformat()

@app.get("/cases/")
def read_cases():
    db = load_db()
    return jsonify(db['cases'])

@app.get("/cases/<int:case_id>")
def read_case(case_id):
    db = load_db()
    for case in db['cases']:
        if case['id'] == case_id:
            return jsonify(case)
    return jsonify({"detail": "Case not found"}), 404

@app.post("/cases/")
def create_new_case():
    db = load_db()
    data = request.json
    
    stt = data.get('stt')
    if stt is None:
        stt = db['next_stt']
        db['next_stt'] += 1
    
    case = {
        'id': db['next_id'],
        'stt': stt,
        'bien_lai_an_phi': data.get('bien_lai_an_phi', ''),
        'so_thu_ly': data.get('so_thu_ly', ''),
        'ngay_thu_ly': data.get('ngay_thu_ly'),
        'ten_duong_su': data.get('ten_duong_su', ''),
        'quan_he_tranh_chap': data.get('quan_he_tranh_chap', ''),
        'loai_an': data.get('loai_an', ''),
        'trang_thai': data.get('trang_thai', 'Hòa giải thành'),
        'han_giai_quyet': calculate_deadline(data.get('ngay_thu_ly'), data.get('loai_an', ''))
    }
    
    db['cases'].append(case)
    db['next_id'] += 1
    save_db(db)
    
    return jsonify(case), 201

@app.put("/cases/<int:case_id>")
def update_existing_case(case_id):
    db = load_db()
    data = request.json
    
    for case in db['cases']:
        if case['id'] == case_id:
            if 'bien_lai_an_phi' in data:
                case['bien_lai_an_phi'] = data['bien_lai_an_phi']
            if 'so_thu_ly' in data:
                case['so_thu_ly'] = data['so_thu_ly']
            if 'ngay_thu_ly' in data:
                case['ngay_thu_ly'] = data['ngay_thu_ly']
            if 'ten_duong_su' in data:
                case['ten_duong_su'] = data['ten_duong_su']
            if 'quan_he_tranh_chap' in data:
                case['quan_he_tranh_chap'] = data['quan_he_tranh_chap']
            if 'loai_an' in data:
                case['loai_an'] = data['loai_an']
            if 'trang_thai' in data:
                case['trang_thai'] = data['trang_thai']

            if 'ngay_thu_ly' in data or 'loai_an' in data:
                case['han_giai_quyet'] = calculate_deadline(case['ngay_thu_ly'], case.get('loai_an', ''))

            save_db(db)
            return jsonify(case)
    
    return jsonify({"detail": "Case not found"}), 404

@app.delete("/cases/<int:case_id>")
def delete_existing_case(case_id):
    db = load_db()

    for i, case in enumerate(db['cases']):
        if case['id'] == case_id:
            db['cases'].pop(i)
            for index, remaining_case in enumerate(db['cases'], start=1):
                remaining_case['stt'] = index
            db['next_stt'] = len(db['cases']) + 1
            save_db(db)
            return jsonify({"message": "Case deleted"})
    
    return jsonify({"detail": "Case not found"}), 404

@app.post('/upload-excel/')
def upload_excel():
    if 'file' not in request.files:
        return jsonify({"detail": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.xlsx'):
        return jsonify({"detail": "File must be .xlsx"}), 400

    workbook = load_workbook(file, data_only=True)
    sheet = workbook.active
    headers = [cell.value for cell in sheet[1]]

    db = load_db()
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not any(cell is not None for cell in row):
            continue

        row_data = {headers[i]: row[i] for i in range(min(len(headers), len(row)))}
        stt = row_data.get('STT')
        try:
            stt = int(stt) if stt not in (None, '') else None
        except (TypeError, ValueError):
            stt = None

        ngay_thu_ly_value = row_data.get('Ngày thụ lý')
        ngay_thu_ly = None
        if isinstance(ngay_thu_ly_value, datetime):
            ngay_thu_ly = ngay_thu_ly_value.date().isoformat()
        elif ngay_thu_ly_value is not None:
            ngay_thu_ly_text = str(ngay_thu_ly_value).strip()
            try:
                ngay_thu_ly = datetime.fromisoformat(ngay_thu_ly_text).date().isoformat()
            except ValueError:
                parts = ngay_thu_ly_text.replace('/', '-').split('-')
                if len(parts) == 3:
                    try:
                        day, month, year = [int(p) for p in parts]
                        ngay_thu_ly = datetime(year, month, day).date().isoformat()
                    except ValueError:
                        ngay_thu_ly = None

        if not ngay_thu_ly:
            continue

        case = {
            'id': db['next_id'],
            'stt': stt if stt is not None else db['next_stt'],
            'bien_lai_an_phi': str(row_data.get('Biên lai án phí', '') or ''),
            'so_thu_ly': str(row_data.get('Số thụ lý', '') or ''),
            'ngay_thu_ly': ngay_thu_ly,
            'ten_duong_su': str(row_data.get('Tên đương sự', '') or ''),
            'quan_he_tranh_chap': str(row_data.get('Quan hệ tranh chấp', '') or ''),
            'loai_an': str(row_data.get('Loại án', '') or ''),
            'trang_thai': str(row_data.get('Trạng thái', 'Hòa giải thành') or 'Hòa giải thành'),
            'han_giai_quyet': '',
        }
        case['han_giai_quyet'] = calculate_deadline(case['ngay_thu_ly'], case.get('loai_an', ''))

        if stt is None:
            db['next_stt'] += 1

        db['next_id'] += 1
        db['cases'].append(case)

    save_db(db)
    return jsonify({'message': 'Cases imported successfully'})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    if path != '' and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.get("/statistics/")
def get_stats():
    db = load_db()
    cases = db['cases']

    status_counts = {}
    overdue = 0
    warning = 0
    now = datetime.now()

    final_statuses = ["Hòa giải thành", "Xét xử", "Đình chỉ", "Tạm đình chỉ", "Bản án", "Kết thúc"]
    case_types = ["Dân sự", "Hôn nhân", "KDTM", "Lao động", "Hình sự", "Hành chính", "Cai nghiện"]
    type_counts = {}

    for case in cases:
        status = case.get('trang_thai', 'Chưa cập nhật') or 'Chưa cập nhật'
        status_counts[status] = status_counts.get(status, 0) + 1

        case_type = case.get('loai_an', 'Khác') or 'Khác'
        type_counts[case_type] = type_counts.get(case_type, 0) + 1

        if status not in final_statuses:
            han_date = datetime.fromisoformat(case['han_giai_quyet'])
            if now > han_date:
                overdue += 1
            elif (han_date - now).days < 15:
                warning += 1

    for status in final_statuses:
        if status not in status_counts:
            status_counts[status] = 0

    for case_type in case_types:
        if case_type not in type_counts:
            type_counts[case_type] = 0

    completed = sum(status_counts.get(s, 0) for s in final_statuses)
    ongoing = len(cases) - completed

    return jsonify({
        "status_counts": status_counts,
        "type_counts": type_counts,
        "dang_giai_quyet": ongoing,
        "an_sap_het_han": warning,
        "an_qua_han": overdue
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
