import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import CaseTable from './components/CaseTable'
import Statistics from './components/Statistics'
import AddCaseForm from './components/AddCaseForm'
import Login from './components/Login'
import API_BASE from './apiConfig'

function App() {
  const [cases, setCases] = useState([])
  const [stats, setStats] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [backendAvailable, setBackendAvailable] = useState(true)
  const [backendChecked, setBackendChecked] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)

  useEffect(() => {
    fetchCases()
    fetchStats()
  }, [])

  const handleFilterClick = (filterKey) => {
    setActiveFilter((current) => (current === filterKey ? null : filterKey))
  }

  const clearFilter = () => {
    setActiveFilter(null)
  }

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false')
  }, [isLoggedIn])

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

  const monthOptions = [
    { value: '', label: 'Tất cả tháng' },
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' }
  ]

  const yearOptions = Array.from(
    new Set(
      cases
        .map((caseItem) => {
          const date = new Date(caseItem.ngay_thu_ly)
          return !Number.isNaN(date.getFullYear()) ? date.getFullYear().toString() : null
        })
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a))

  const parseDateParts = (value) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return { month: date.getMonth() + 1, year: date.getFullYear() }
  }

  const filteredCases = cases.filter((caseItem) => {
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

    const monthYear = parseDateParts(caseItem.ngay_thu_ly)
    const matchesMonth = !selectedMonth || (monthYear && monthYear.month === Number(selectedMonth))
    const matchesYear = !selectedYear || (monthYear && monthYear.year === Number(selectedYear))

    const matchesFilter = (() => {
      if (!activeFilter || activeFilter === 'all') return true
      
      if (activeFilter === 'hoa-giai-thanh') {
        return caseItem.trang_thai_giai_quyet === 'Hòa giải thành'
      }
      if (activeFilter === 'xet-xu') {
        return caseItem.trang_thai_giai_quyet === 'Xét xử'
      }
      if (activeFilter === 'dinh-chi') {
        return caseItem.trang_thai_giai_quyet === 'Đình chỉ'
      }
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

    return matchesSearch && matchesFilter && matchesMonth && matchesYear
  })

  const summaryCounts = {
    totalResolved: filteredCases.filter(caseItem => {
      const status = caseItem.trang_thai_giai_quyet?.toString() || ''
      const completedStates = ['Xét xử', 'QĐ CNSTT', 'Hòa giải thành', 'Đình chỉ', 'Tạm đình chỉ']
      return completedStates.some(state => status.includes(state))
    }).length,
    hoaGiaiThanh: filteredCases.filter(caseItem => {
      const status = caseItem.trang_thai_giai_quyet?.toString() || ''
      return status.includes('QĐ CNSTT') || status.includes('Hòa giải thành')
    }).length,
    xetXu: filteredCases.filter((caseItem) => caseItem.trang_thai_giai_quyet === 'Xét xử').length,
    dinhChi: filteredCases.filter(caseItem => {
      const status = caseItem.trang_thai_giai_quyet?.toString() || ''
      return status.includes('Đình chỉ') || status.includes('Tạm đình chỉ')
    }).length
  }

  const categoryCounts = cases.reduce((acc, caseItem) => {
    const cat = getCaseCategory(caseItem)
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const renderSummaryBar = () => (
    <div className="grid gap-3 lg:grid-cols-4 mb-4">
      <button
        type="button"
        onClick={() => handleFilterClick('all')}
        className={`rounded-lg p-4 shadow-sm border transition hover:shadow-md focus:outline-none cursor-pointer ${activeFilter === 'all' ? 'bg-red-50 border-red-300 ring-2 ring-law-red' : 'bg-white border-gray-200'}`}
      >
        <p className="text-xs text-gray-500 font-medium">Tổng giải quyết</p>
        <p className={`mt-2 text-2xl font-bold ${activeFilter === 'all' ? 'text-law-red' : 'text-law-red'}`}>{summaryCounts.totalResolved}</p>
      </button>
      <button
        type="button"
        onClick={() => handleFilterClick('hoa-giai-thanh')}
        className={`rounded-lg p-4 shadow-sm border transition hover:shadow-md focus:outline-none cursor-pointer ${activeFilter === 'hoa-giai-thanh' ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-600' : 'bg-emerald-50 border-emerald-200'}`}
      >
        <p className={`text-xs font-medium ${activeFilter === 'hoa-giai-thanh' ? 'text-emerald-700' : 'text-emerald-600'}`}>Hòa giải thành</p>
        <p className="mt-2 text-2xl font-bold text-emerald-900">{summaryCounts.hoaGiaiThanh}</p>
      </button>
      <button
        type="button"
        onClick={() => handleFilterClick('xet-xu')}
        className={`rounded-lg p-4 shadow-sm border transition hover:shadow-md focus:outline-none cursor-pointer ${activeFilter === 'xet-xu' ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-600' : 'bg-sky-50 border-sky-200'}`}
      >
        <p className={`text-xs font-medium ${activeFilter === 'xet-xu' ? 'text-sky-700' : 'text-sky-600'}`}>Xét xử</p>
        <p className="mt-2 text-2xl font-bold text-sky-900">{summaryCounts.xetXu}</p>
      </button>
      <button
        type="button"
        onClick={() => handleFilterClick('dinh-chi')}
        className={`rounded-lg p-4 shadow-sm border transition hover:shadow-md focus:outline-none cursor-pointer ${activeFilter === 'dinh-chi' ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-600' : 'bg-orange-50 border-orange-200'}`}
      >
        <p className={`text-xs font-medium ${activeFilter === 'dinh-chi' ? 'text-orange-700' : 'text-orange-600'}`}>Đình chỉ</p>
        <p className="mt-2 text-2xl font-bold text-orange-900">{summaryCounts.dinhChi}</p>
      </button>
    </div>
  )

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-law-gray">
      <header className="bg-law-red shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-law-white">Quản Lý Hồ Sơ Án</h1>
            <p className="text-sm font-semibold text-white">Hệ thống quản lý hồ sơ án chuyên nghiệp</p>
          </div>
          <button onClick={handleLogout} className="btn-law-red px-4 py-2 rounded-lg">Đăng xuất</button>
        </div>
      </header>

      <div className="container mx-auto grid gap-6 lg:grid-cols-[200px_1fr] px-4 py-6">
        <aside>
          <Sidebar selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        </aside>

        <main className="space-y-6">
          {!backendAvailable && backendChecked && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
              Đang kết nối máy chủ dữ liệu, vui lòng đợi giây lát...
            </div>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-law-red">
                  {selectedTab === 'dashboard' && 'Tổng quan'}
                  {selectedTab === 'list' && 'Danh sách hồ sơ'}
                  {selectedTab === 'add' && 'Thêm án mới'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">Chọn mục bên trái để quản lý và lọc hồ sơ nhanh.</p>
              </div>
              {selectedTab !== 'add' && (
                <div className="grid gap-3 sm:grid-cols-3 w-full lg:w-auto">
                  <input
                    type="text"
                    placeholder="Tìm theo tên đương sự hoặc số thụ lý"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-law-red focus:ring-law-red/20"
                  />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-law-red focus:ring-law-red/20"
                  >
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-law-red focus:ring-law-red/20"
                  >
                    <option value="">Tất cả năm</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {selectedTab === 'dashboard' && (
            <>
              {renderSummaryBar()}
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
                <Statistics stats={stats} activeFilter={activeFilter} onFilterSelect={handleFilterClick} onClearFilter={clearFilter} />
              </div>
            </>
          )}

          {selectedTab === 'list' && (
            <>
              {renderSummaryBar()}
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
                <CaseTable
                  cases={filteredCases}
                  onCaseUpdate={updateCase}
                  onCaseDelete={deleteCase}
                  onCaseExport={exportCaseReport}
                  onBulkDelete={bulkDeleteCases}
                  onBulkExport={bulkExportCases}
                />
              </div>
            </>
          )}

          {selectedTab === 'add' && (
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
              <AddCaseForm onCaseAdded={handleCaseUpdated} backendAvailable={backendAvailable} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App