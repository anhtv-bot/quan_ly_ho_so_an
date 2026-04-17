import { useState } from 'react'
import axios from 'axios'

const API_BASE = ''

const AddCaseForm = ({ onCaseAdded, backendAvailable = true }) => {
  const [formData, setFormData] = useState({
    bien_lai_an_phi: '',
    so_thu_ly: '',
    ngay_thu_ly: '',
    ten_duong_su: '',
    quan_he_tranh_chap: '',
    loai_an: '',
    trang_thai: 'Hòa giải thành'
  })
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const parseDateValue = (value) => {
    if (!value) return null
    const normalized = value.trim().replace(/\./g, '-').replace(/\//g, '-')
    const parts = normalized.split('-').map((part) => part.trim())
    if (parts.length !== 3) {
      return null
    }

    const [dayPart, monthPart, yearPart] = parts
    const day = Number(dayPart)
    const month = Number(monthPart)
    const year = Number(yearPart)
    if ([day, month, year].some((n) => Number.isNaN(n))) {
      return null
    }

    const candidateIso = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    const parsed = new Date(candidateIso)
    if (!Number.isNaN(parsed.getTime()) && parsed.getDate() === day && parsed.getMonth() + 1 === month && parsed.getFullYear() === year) {
      return parsed.toISOString()
    }

    // allow ISO input directly as fallback
    const isoTry = new Date(value)
    if (!Number.isNaN(isoTry.getTime())) {
      return isoTry.toISOString()
    }

    return null

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const isoDate = parseDateValue(formData.ngay_thu_ly)
    if (!isoDate) {
      setErrorMessage('Ngày Thụ Lý không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY hoặc DD-MM-YYYY.')
      return
    }

    try {
      await axios.post(`${API_BASE}/cases/`, {
        ...formData,
        ngay_thu_ly: isoDate
      })
      setFormData({
        bien_lai_an_phi: '',
        so_thu_ly: '',
        ngay_thu_ly: '',
        ten_duong_su: '',
        quan_he_tranh_chap: '',
        loai_an: '',
        trang_thai: 'Hòa giải thành'
      })
      onCaseAdded()
    } catch (error) {
      console.error('Error adding case:', error)
      if (!error.response) {
        setErrorMessage('Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...')
      } else {
        setErrorMessage('Không thể thêm án. Vui lòng thử lại.')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 card-law">
      <h2 className="text-xl font-semibold mb-4 text-law-red">Thêm Án Mới</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Biên Lai Án Phí</label>
          <input
            type="text"
            name="bien_lai_an_phi"
            value={formData.bien_lai_an_phi}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số Thụ Lý</label>
          <input
            type="text"
            name="so_thu_ly"
            value={formData.so_thu_ly}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày Thụ Lý</label>
          <input
            type="text"
            name="ngay_thu_ly"
            placeholder="DD/MM/YYYY"
            value={formData.ngay_thu_ly}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên Đương Sự</label>
          <input
            type="text"
            name="ten_duong_su"
            value={formData.ten_duong_su}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quan Hệ Tranh Chấp</label>
          <input
            type="text"
            name="quan_he_tranh_chap"
            value={formData.quan_he_tranh_chap}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loại Án</label>
          <select
            name="loai_an"
            value={formData.loai_an}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Chọn loại án</option>
            <option value="Dân sự">Dân sự</option>
            <option value="Hôn nhân">Hôn nhân</option>
            <option value="KDTM">KDTM</option>
            <option value="Lao động">Lao động</option>
            <option value="Hình sự">Hình sự</option>
            <option value="Cai nghiện">Cai nghiện</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
          <select
            name="trang_thai"
            value={formData.trang_thai}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="Hòa giải thành">Hòa giải thành</option>
            <option value="Xét xử">Xét xử</option>
            <option value="Đình chỉ">Đình chỉ</option>
            <option value="Tạm đình chỉ">Tạm đình chỉ</option>
            <option value="Bản án">Bản án</option>
          </select>
        </div>
        {errorMessage && (
          <div className="md:col-span-2 text-sm text-red-600">{errorMessage}</div>
        )}
        {!backendAvailable && (
          <div className="md:col-span-2 text-sm text-orange-700">Máy chủ dữ liệu chưa sẵn sàng. Vui lòng chờ backend khởi động.</div>
        )}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!backendAvailable}
            className="btn-law-red font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Thêm Án
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCaseForm