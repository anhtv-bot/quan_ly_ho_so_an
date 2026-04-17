import { useState, useEffect } from 'react'
import axios from 'axios'
import CaseTable from './components/CaseTable'
import Statistics from './components/Statistics'
import AddCaseForm from './components/AddCaseForm'
import UploadFile from './components/UploadFile'
import Login from './components/Login'

const API_BASE = ''

function App() {
  const [cases, setCases] = useState([])
  const [stats, setStats] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(true)
  const [backendChecked, setBackendChecked] = useState(false)

  useEffect(() => {
    fetchCases()
    fetchStats()
  }, [])

  const fetchCases = async () => {
    try {
      const response = await axios.get(`${API_BASE}/cases/`)
      setCases(response.data)
      setBackendAvailable(true)
      setBackendChecked(true)
    } catch (error) {
      console.error('Error fetching cases:', error)
      setBackendAvailable(false)
      setBackendChecked(true)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/statistics/`)
      setStats(response.data)
      setBackendAvailable(true)
      setBackendChecked(true)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setBackendAvailable(false)
      setBackendChecked(true)
    }
  }

  const updateCase = async (caseId, updatedCase) => {
    try {
      await axios.put(`${API_BASE}/cases/${caseId}`, updatedCase)
      fetchCases()
      fetchStats()
      setBackendAvailable(true)
    } catch (error) {
      console.error('Error updating case:', error)
      setBackendAvailable(false)
    }
  }

  const deleteCase = async (caseId) => {
    try {
      await axios.delete(`${API_BASE}/cases/${caseId}`)
      fetchCases()
      fetchStats()
    } catch (error) {
      console.error('Error deleting case:', error)
      alert('Xóa án không thành công. Vui lòng thử lại.')
    }
  }

  const getCaseCategory = (caseItem) => {
    const now = new Date()
    const startDate = new Date(caseItem.ngay_thu_ly)
    const daysSince = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    
    if (caseItem.loai_an === 'Hình sự' && daysSince < 30) return 'Khẩn cấp'
    if (caseItem.loai_an === 'KDTM' && daysSince < 15) return 'Ưu tiên'
    return 'Bình thường'
  }

  const categoryCounts = cases.reduce((acc, caseItem) => {
    const cat = getCaseCategory(caseItem)
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const filteredCases = cases.filter(caseItem => {
    const searchLower = searchTerm.toLowerCase()
    const tenDuongSu = caseItem.ten_duong_su?.toString().toLowerCase() || ''
    const loaiAn = caseItem.loai_an?.toString().toLowerCase() || ''
    const trangThai = caseItem.trang_thai?.toString().toLowerCase() || ''
    const bienLai = caseItem.bien_lai_an_phi?.toString().toLowerCase() || ''
    const ngayThuLy = caseItem.ngay_thu_ly ? new Date(caseItem.ngay_thu_ly).toLocaleDateString('vi-VN') : ''

    return (
      tenDuongSu.includes(searchLower) ||
      loaiAn.includes(searchLower) ||
      trangThai.includes(searchLower) ||
      ngayThuLy.includes(searchTerm) ||
      bienLai.includes(searchLower)
    )
  })

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-law-gray">
      <header className="bg-law-red shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-law-white">Quản Lý Hồ Sơ Án</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-full hover:bg-[#7a0000] text-law-white">
                <svg className="w-5 h-5 text-law-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {showSearch && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, loại án, trạng thái, ngày, biên lai..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  />
                </div>
              )}
            </div>
            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-[#7a0000] text-law-white">
                <svg className="w-5 h-5 text-law-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Đăng xuất</button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto p-4">
        {!backendAvailable && backendChecked && (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
            Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...
          </div>
        )}

        <Statistics stats={{...stats, category_counts: categoryCounts}} />
        
        <UploadFile onUploadSuccess={() => { fetchCases(); fetchStats(); }} backendAvailable={backendAvailable} />
        
        <AddCaseForm onCaseAdded={fetchCases} backendAvailable={backendAvailable} />
        
        <CaseTable cases={filteredCases} onCaseUpdate={updateCase} onCaseDelete={deleteCase} />
      </div>
    </div>
  )
}

export default App