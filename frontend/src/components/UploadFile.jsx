import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8001'

const UploadFile = ({ onUploadSuccess, backendAvailable = true }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [resultMessage, setResultMessage] = useState('')
  const [resultDetails, setResultDetails] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResultMessage('')
    setResultDetails(null)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResultMessage('Đang tải file...')
    setResultDetails(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_BASE}/upload-excel/`, formData, {
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
      const data = response?.data || {}
      const message = data.message || 'Upload thành công!'
      setResultMessage(message)
      setResultDetails(data)
      onUploadSuccess && onUploadSuccess(data)
    } catch (error) {
      console.error('Error uploading file:', error)
      if (!error.response) {
        setResultMessage('Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...')
      } else {
        const detail = error.response?.data?.detail || 'Upload thất bại!'
        setResultMessage(`Upload thất bại: ${detail}`)
      }
    } finally {
      setUploading(false)
      setUploadProgress(100)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 card-law">
      <h2 className="text-xl font-semibold mb-4 text-law-red">Tải Lên Danh Sách (.xlsx, .xls)</h2>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-md shadow-sm p-2"
        />
        <button
          onClick={handleUpload}
          disabled={!backendAvailable || !file || uploading}
          className="btn-law-red font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {uploading ? 'Đang tải...' : 'Tải Lên'}
        </button>
      </div>
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="bg-law-red h-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      {resultMessage && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
          <div className="font-semibold mb-2">Kết quả import</div>
          <div>{resultMessage}</div>
          {resultDetails && (
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <div>Đã xử lý: {resultDetails.processed ?? 0} dòng</div>
              <div>Đã nhập: {resultDetails.imported ?? 0} hồ sơ</div>
              <div>Bỏ qua: {resultDetails.skipped ?? 0} dòng</div>
              {resultDetails.errors && resultDetails.errors.length > 0 && (
                <div>Lỗi: {resultDetails.errors.length} dòng</div>
              )}
            </div>
          )}
        </div>
      )}
      {!backendAvailable && (
        <div className="text-sm text-orange-700 mt-2">Máy chủ dữ liệu chưa sẵn sàng. Vui lòng chờ backend khởi động.</div>
      )}
    </div>
  )
}

export default UploadFile