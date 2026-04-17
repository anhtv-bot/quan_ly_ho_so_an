import { useState } from 'react'
import axios from 'axios'

const API_BASE = ''

const UploadFile = ({ onUploadSuccess, backendAvailable = true }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post(`${API_BASE}/upload-excel/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('Upload thành công!')
      onUploadSuccess()
    } catch (error) {
      console.error('Error uploading file:', error)
      if (!error.response) {
        alert('Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...')
      } else {
        alert('Upload thất bại!')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 card-law">
      <h2 className="text-xl font-semibold mb-4 text-law-red">Tải Lên Danh Sách (.xlsx, .docx)</h2>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept=".xlsx,.docx"
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
      {!backendAvailable && (
        <div className="text-sm text-orange-700 mt-2">Máy chủ dữ liệu chưa sẵn sàng. Vui lòng chờ backend khởi động.</div>
      )}
    </div>
  )
}

export default UploadFile