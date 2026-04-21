import { useState, useEffect } from 'react'
import axios from 'axios'
import CaseTable from './components/CaseTable'
import Statistics from './components/Statistics'
import AddCaseForm from './components/AddCaseForm'
import UploadFile from './components/UploadFile'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import SummaryBar from './components/SummaryBar'
import MonthQuickView from './components/MonthQuickView'
import QuickCaseList from './components/QuickCaseList'
import API_BASE from './apiConfig'

function App() {
  const [cases, setCases] = useState([])
  const [stats, setStats] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(true)
  const [backendChecked, setBackendChecked] = useState(false)
  const [activeFilter, setActiveFilter] = useState(() => localStorage.getItem('activeFilter') || null)
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'dashboard')
  const [selectedMonth, setSelectedMonth] = useState(() => localStorage.getItem('selectedMonth') || '')
  const [selectedStatus, setSelectedStatus] = useState(() => localStorage.getItem('selectedStatus') || '')

  useEffect(() => {
    fetchCases()
    fetchStats()
  }, [])

  const handleFilterClick = (filterKey) => {
    if (filterKey.startsWith('status:')) {
      const status = filterKey.replace('status:', '')
      setSelectedStatus(status)
    } else {
      setSelectedStatus('')
    }
    setActiveFilter((current) => (current === filterKey ? null : filterKey))
  }

  const clearFilter = () => {
    setActiveFilter(null)
    setSelectedStatus('')
  }

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false')
  }, [isLoggedIn])

  useEffect(() => {
    localStorage.setItem('activeView', activeView)
    localStorage.setItem('selectedMonth', selectedMonth)
    localStorage.setItem('selectedStatus', selectedStatus)
    localStorage.setItem('activeFilter', activeFilter || '')
  }, [activeView, selectedMonth, selectedStatus, activeFilter])

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

  const bulkDeleteCases = async (caseIds) => {
    if (!caseIds?.length) {
      return false
    }

    try {
      await axios.post(`${API_BASE}/cases/bulk-delete`, { case_ids: caseIds })
      fetchCases()
      fetchStats()
      return true
    } catch (error) {
      console.error('Error bulk deleting cases:', error)
      alert('Xóa hàng loạt không thành công. Vui lòng thử lại.')
      return false
    }
  }

  const exportCaseReport = async (caseId) => {
    try {
      const response = await axios.get(`${API_BASE}/cases/${caseId}/export`, {
        responseType: 'blob',
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `case_${caseId}_report.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting case report:', error)
      alert('Không thể tải báo cáo. Vui lòng thử lại.')
    }
  }

  const bulkExportCases = async (caseIds) => {
    if (!caseIds?.length) {
      return false
    }

    try {
      const response = await axios.post(`${API_BASE}/cases/bulk-export`, { case_ids: caseIds }, {
        responseType: 'blob',
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cases_bulk_report.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Error bulk exporting cases:', error)
      alert('Không thể tải báo cáo hàng loạt. Vui lòng thử lại.')
      return false
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  const handleCaseUpdated = () => {
    fetchCases()
    fetchStats()
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
    const tenDuongSu = caseItem.duong_su?.toString().toLowerCase() || ''
    const loaiAn = caseItem.loai_an?.toString().toLowerCase() || ''
    const trangThai = caseItem.trang_thai_giai_quyet?.toString().toLowerCase() || ''
    const bienLai = caseItem.bien_lai_an_phi?.toString().toLowerCase() || ''
    const ngayThuLy = caseItem.ngay_thu_ly ? new Date(caseItem.ngay_thu_ly).toLocaleDateString('vi-VN') : ''
    const ngayXetXu = caseItem.ngay_xet_xu ? new Date(caseItem.ngay_xet_xu).toLocaleDateString('vi-VN') : ''
    const qdCnstt = caseItem.quan_he_phap_luat?.toString().toLowerCase() || ''
    const ghiChu = caseItem.ghi_chu?.toString().toLowerCase() || ''
    const maHoa = caseItem.ma_hoa ? 'đã mã hóa' : 'chưa mã hóa'

    const matchesSearch = (
      tenDuongSu.includes(searchLower) ||
      loaiAn.includes(searchLower) ||
      trangThai.includes(searchLower) ||
      ngayThuLy.includes(searchLower) ||
      ngayXetXu.includes(searchLower) ||
      bienLai.includes(searchLower) ||
      qdCnstt.includes(searchLower) ||
      ghiChu.includes(searchLower) ||
      maHoa.includes(searchLower)
    )

    const matchesFilter = (() => {
      if (!activeFilter) return true
      const now = new Date()
      if (activeFilter === 'deadline:active') {
        const status = caseItem.trang_thai_giai_quyet?.toString() || ''
        const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
        return !completedStates.includes(status)
      }
      if (activeFilter === 'deadline:warning') {
        if (!caseItem.han_giai_quyet) return false
        const deadline = new Date(caseItem.han_giai_quyet)
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
        const status = caseItem.trang_thai_giai_quyet?.toString() || ''
        const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
        return !completedStates.includes(status) && daysLeft >= 0 && daysLeft < 15
      }
      if (activeFilter === 'deadline:overdue') {
        if (!caseItem.han_giai_quyet) return false
        const deadline = new Date(caseItem.han_giai_quyet)
        const status = caseItem.trang_thai_giai_quyet?.toString() || ''
        const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
        return !completedStates.includes(status) && deadline < now
      }
      if (activeFilter.startsWith('status:')) {
        const filterStatus = activeFilter.replace('status:', '')
        if (filterStatus === 'Đang giải quyết') {
          const status = caseItem.trang_thai_giai_quyet?.toString() || ''
          const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
          return !completedStates.includes(status)
        }
        return trangThai === filterStatus.toLowerCase()
      }
      return true
    })()

    return matchesSearch && matchesFilter
  })

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Bảng Điều Khiển</h2>
            
            {/* Month Quick View */}
            <MonthQuickView 
              cases={cases} 
              onViewDetails={(month) => {
                setSelectedMonth(month)
                setSelectedStatus('')
              }}
            />

            {/* Summary for selected month */}
            {selectedMonth && (
              <SummaryBar cases={cases} selectedMonth={selectedMonth} />
            )}

            {/* General Statistics */}
            <Statistics stats={stats} activeFilter={activeFilter} onFilterSelect={handleFilterClick} onClearFilter={clearFilter} />

            {/* Quick Case List - shown for month, status, or deadline filters */}
            {(selectedMonth || activeFilter) && (
              <QuickCaseList 
                cases={cases} 
                selectedMonth={selectedMonth}
                selectedStatus={selectedStatus}
                selectedFilter={activeFilter}
                onViewAll={() => setActiveView('cases')}
                onClose={() => {
                  setSelectedMonth('')
                  setSelectedStatus('')
                  clearFilter()
                }}
              />
            )}
          </div>
        )
      case 'cases':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Danh Sách Hồ Sơ</h2>
            <CaseTable
              cases={filteredCases}
              onCaseUpdate={updateCase}
              onCaseDelete={deleteCase}
              onCaseExport={exportCaseReport}
              onBulkDelete={bulkDeleteCases}
              onBulkExport={bulkExportCases}
            />
          </div>
        )
      case 'add-case':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Thêm/Tải Hồ Sơ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Tải Lên Hồ Sơ</h3>
                <UploadFile onUploadSuccess={handleCaseUpdated} backendAvailable={backendAvailable} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Thêm Hồ Sơ Mới</h3>
                <AddCaseForm onCaseAdded={handleCaseUpdated} backendAvailable={backendAvailable} />
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Cài Đặt</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700 mb-4">Cài đặt hệ thống đang được phát triển.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Thông tin hệ thống</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Phiên bản: 1.0.0</p>
                    <p className="text-sm text-gray-600">Trạng thái backend: {backendAvailable ? '✅ Hoạt động' : '❌ Ngoại tuyến'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-law-gray">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: '16rem' }}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-l-4 border-l-law-red">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-law-red">Quản Lý Hồ Sơ Án</h1>
            <div className="flex items-center space-x-4">
              {backendAvailable ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Kết nối
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  Ngoại tuyến
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {!backendAvailable && backendChecked && (
              <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
                Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...
              </div>
            )}
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App