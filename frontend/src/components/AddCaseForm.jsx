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
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0])
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
    setSuccessMessage('')

    const ngayThuLyIso = formData.ngay_thu_ly ? parseDateValue(formData.ngay_thu_ly) : null
    const ngayXetXuIso = formData.ngay_xet_xu ? parseDateValue(formData.ngay_xet_xu) : null

    try {
      await axios.post(`${API_BASE}/cases/`, {
        ...formData,
        ngay_thu_ly: ngayThuLyIso,
        ngay_xet_xu: ngayXetXuIso
      })
      setSuccessMessage('Thêm án thành công!')
      setFormData({
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
      setUploadFile(null)
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

  const handleUploadDocument = async () => {
    if (!uploadFile) {
      setErrorMessage('Vui lòng chọn file trước khi tải lên.')
      return
    }

    setUploading(true)
    setErrorMessage('')
    setSuccessMessage('')
    setUploadProgress(0)

    const formDataFile = new FormData()
    formDataFile.append('file', uploadFile)
    const isExcel = uploadFile.name.toLowerCase().endsWith('.xlsx') || uploadFile.name.toLowerCase().endsWith('.xls')
    const endpoint = isExcel ? `${API_BASE}/upload-excel/` : `${API_BASE}/upload-document/`

    try {
      const response = await axios.post(endpoint, formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      })
      setSuccessMessage(`Tải tài liệu thành công: ${uploadFile.name}`)
      setUploadFile(null)
      if (response.data) {
        onCaseAdded()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      if (!error.response) {
        setErrorMessage('Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...')
      } else {
        const detail = error.response?.data?.detail || 'Upload thất bại!'
        setErrorMessage(`Tải tài liệu thất bại: ${detail}`)
      }
    } finally {
      setUploading(false)
      setUploadProgress(100)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 card-law">
        <h2 className="text-2xl font-semibold mb-6 text-law-red">Nhập Thông Tin Án Mới</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Biên Lai Án Phí</label>
            <input
              type="text"
              name="bien_lai_an_phi"
              value={formData.bien_lai_an_phi}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số Thụ Lý</label>
            <input
              type="text"
              name="so_thu_ly"
              value={formData.so_thu_ly}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Thụ Lý *</label>
            <input
              type="text"
              name="ngay_thu_ly"
              placeholder="DD/MM/YYYY"
              value={formData.ngay_thu_ly}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đương Sự *</label>
            <input
              type="text"
              name="duong_su"
              value={formData.duong_su}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quan Hệ Pháp Luật</label>
            <input
              type="text"
              name="quan_he_phap_luat"
              placeholder="Ví dụ: Xin ly hôn"
              value={formData.quan_he_phap_luat}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Xét Xử</label>
            <input
              type="text"
              name="ngay_xet_xu"
              placeholder="DD/MM/YYYY (tùy chọn)"
              value={formData.ngay_xet_xu}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">QĐ CNSTT</label>
            <input
              type="text"
              name="qd_cnstt"
              value={formData.qd_cnstt}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng Thái Giải Quyết *</label>
            <select
              name="trang_thai_giai_quyet"
              value={formData.trang_thai_giai_quyet}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi Chú</label>
            <textarea
              name="ghi_chu"
              value={formData.ghi_chu}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-law-red focus:ring-law-red/20"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="ma_hoa"
                checked={formData.ma_hoa}
                onChange={(e) => setFormData({ ...formData, ma_hoa: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Đã Mã Hóa</span>
            </label>
          </div>
          {errorMessage && (
            <div className="md:col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="md:col-span-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{successMessage}</div>
          )}
          {!backendAvailable && (
            <div className="md:col-span-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700">Máy chủ dữ liệu chưa sẵn sàng. Vui lòng chờ backend khởi động.</div>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!backendAvailable}
              className="btn-law-red font-bold py-2.5 px-6 rounded-lg disabled:opacity-50 hover:shadow-lg transition"
            >
              ➕ Thêm Án Mới
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 card-law">
        <h2 className="text-2xl font-semibold mb-6 text-law-red">Tải Lên Tài Liệu Đính Kèm</h2>
        <p className="text-sm text-gray-600 mb-4">Hỗ trợ: .xlsx, .xls, .docx, .doc, .pdf, .txt, .csv</p>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls,.docx,.doc,.pdf,.txt,.csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5"
            />
            <button
              type="button"
              onClick={handleUploadDocument}
              disabled={!backendAvailable || !uploadFile || uploading}
              className="btn-law-red font-bold py-2.5 px-6 rounded-lg disabled:opacity-50 hover:shadow-lg transition whitespace-nowrap"
            >
              {uploading ? '⏳ Đang tải...' : '📤 Tải Lên'}
            </button>
          </div>
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-law-red h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {uploadFile && !uploading && (
            <div className="text-xs text-gray-600">📁 {uploadFile.name}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddCaseForm