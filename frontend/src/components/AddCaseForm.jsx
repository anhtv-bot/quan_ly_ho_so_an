import { useState } from 'react'
import axios from 'axios'
import API_BASE from '../apiConfig'

const AddCaseForm = ({ onCaseAdded, backendAvailable = true }) => {
  const [formData, setFormData] = useState({
    bien_lai_an_phi: '',
    so_thu_ly: '',
    ngay_thu_ly: '',
    duong_su: '',
    quan_he_phap_luat: '',
    ngay_xet_xu: '',
    qd_cnstt: '',
    trang_thai_giai_quyet: 'Đang giải quyết',
    ghi_chu: '',
    ma_hoa: false
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
    if (parts.length === 3) {
      const [dayPart, monthPart, yearPart] = parts
      const day = Number(dayPart)
      const month = Number(monthPart)
      const year = Number(yearPart)
      if (![day, month, year].some((n) => Number.isNaN(n))) {
        const candidateDate = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        const parsed = new Date(candidateDate)
        if (!Number.isNaN(parsed.getTime()) && parsed.getDate() === day && parsed.getMonth() + 1 === month && parsed.getFullYear() === year) {
          return candidateDate
        }
      }
    }

    const isoTry = new Date(value)
    if (!Number.isNaN(isoTry.getTime())) {
      return isoTry.toISOString().split('T')[0]
    }

    return value
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const ngayThuLyIso = formData.ngay_thu_ly ? parseDateValue(formData.ngay_thu_ly) : null
    const ngayXetXuIso = formData.ngay_xet_xu ? parseDateValue(formData.ngay_xet_xu) : null

    try {
      await axios.post(`${API_BASE}/cases/`, {
        ...formData,
        ngay_thu_ly: ngayThuLyIso,
        ngay_xet_xu: ngayXetXuIso
      })
      setFormData({
        bien_lai_an_phi: '',
        so_thu_ly: '',
        ngay_thu_ly: '',
        duong_su: '',
        quan_he_phap_luat: '',
        ngay_xet_xu: '',
        qd_cnstt: '',
        trang_thai_giai_quyet: 'Hòa giải thành',
        ghi_chu: '',
        ma_hoa: false
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số Thụ Lý</label>
          <input
            type="text"
            name="so_thu_ly"
            value={formData.so_thu_ly}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Đương Sự</label>
          <input
            type="text"
            name="duong_su"
            value={formData.duong_su}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quan Hệ Pháp Luật</label>
          <input
            type="text"
            name="quan_he_phap_luat"
            placeholder="Ví dụ: Xin ly hôn"
            value={formData.quan_he_phap_luat}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày Xét Xử</label>
          <input
            type="text"
            name="ngay_xet_xu"
            placeholder="DD/MM/YYYY (tùy chọn)"
            value={formData.ngay_xet_xu}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">QĐ Công Nhận Sự Thỏa Thuận</label>
          <input
            type="text"
            name="qd_cnstt"
            value={formData.qd_cnstt}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng Thái Giải Quyết</label>
          <select
            name="trang_thai_giai_quyet"
            value={formData.trang_thai_giai_quyet}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          >
            <option value="Đang giải quyết">Đang giải quyết</option>
            <option value="Hòa giải thành">Hòa giải thành (HGT)</option>
            <option value="Đình chỉ">Đình chỉ (ĐC)</option>
            <option value="Tạm đình chỉ">Tạm đình chỉ (TĐC)</option>
            <option value="Nhập vụ án">Nhập vụ án (NVA)</option>
            <option value="Chuyển vụ án">Chuyển vụ án</option>
            <option value="Xét xử">Xét xử</option>
            <option value="Bản án">Bản án</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Ghi Chú</label>
          <textarea
            name="ghi_chu"
            value={formData.ghi_chu}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="ma_hoa"
              checked={formData.ma_hoa}
              onChange={(e) => setFormData({ ...formData, ma_hoa: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Đã Mã Hóa</span>
          </label>
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