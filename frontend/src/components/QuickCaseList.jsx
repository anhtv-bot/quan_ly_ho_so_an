import { useMemo } from 'react'
import { FileText, Calendar, User, CheckCircle2, AlertCircle, X } from 'lucide-react'

const QuickCaseList = ({ cases, selectedMonth, selectedStatus, selectedFilter, onViewAll, onClose }) => {
  const filteredCases = useMemo(() => {
    let filtered = cases

    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-')
      filtered = filtered.filter((c) => {
        const date = new Date(c.ngay_thu_ly)
        return date.getFullYear() === parseInt(year) && date.getMonth() + 1 === parseInt(month)
      })
    }

    if (selectedFilter) {
      const now = new Date()
      if (selectedFilter === 'deadline:active') {
        filtered = filtered.filter((caseItem) => {
          const status = caseItem.trang_thai_giai_quyet || ''
          const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
          return !completedStates.includes(status)
        })
      } else if (selectedFilter === 'deadline:warning') {
        filtered = filtered.filter((caseItem) => {
          if (!caseItem.han_giai_quyet) return false
          const deadline = new Date(caseItem.han_giai_quyet)
          const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
          const status = caseItem.trang_thai_giai_quyet || ''
          const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
          return !completedStates.includes(status) && daysLeft >= 0 && daysLeft < 15
        })
      } else if (selectedFilter === 'deadline:overdue') {
        filtered = filtered.filter((caseItem) => {
          if (!caseItem.han_giai_quyet) return false
          const deadline = new Date(caseItem.han_giai_quyet)
          const status = caseItem.trang_thai_giai_quyet || ''
          const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
          return !completedStates.includes(status) && deadline < now
        })
      } else if (selectedFilter.startsWith('status:')) {
        const filterStatus = selectedFilter.replace('status:', '')
        if (filterStatus === 'Đang giải quyết') {
          filtered = filtered.filter((caseItem) => {
            const status = caseItem.trang_thai_giai_quyet || ''
            const completedStates = ['Hòa giải thành', 'Đình chỉ', 'Nhập vụ án', 'Chuyển vụ án']
            return !completedStates.includes(status)
          })
        } else {
          filtered = filtered.filter((caseItem) => caseItem.trang_thai_giai_quyet === filterStatus)
        }
      }
    }

    if (!selectedFilter && selectedStatus) {
      filtered = filtered.filter((c) => c.trang_thai_giai_quyet === selectedStatus)
    }

    return filtered
  }, [cases, selectedMonth, selectedStatus, selectedFilter])

  if (!selectedMonth && !selectedStatus && !selectedFilter) {
    return null
  }

  const getStatusColor = (status) => {
    if (status?.includes('Hòa giải thành')) return 'text-green-600'
    if (status?.includes('Đình chỉ')) return 'text-orange-600'
    if (status?.includes('Xét xử')) return 'text-blue-600'
    return 'text-gray-600'
  }

  const getStatusIcon = (status) => {
    if (status?.includes('Hòa giải thành')) return CheckCircle2
    if (status?.includes('Xét xử')) return AlertCircle
    return FileText
  }

  const title = selectedMonth
    ? `Danh Sách Hồ Sơ (${filteredCases.length} vụ)`
    : selectedStatus
    ? `${selectedStatus} (${filteredCases.length} vụ)`
    : selectedFilter === 'deadline:active'
    ? `Đang giải quyết (${filteredCases.length} vụ)`
    : selectedFilter === 'deadline:warning'
    ? `Sắp đến hạn (<15 ngày) (${filteredCases.length} vụ)`
    : selectedFilter === 'deadline:overdue'
    ? `Hết thời hạn giải quyết (${filteredCases.length} vụ)`
    : selectedFilter?.startsWith('status:')
    ? `${selectedFilter.replace('status:', '')} (${filteredCases.length} vụ)`
    : ''

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-6 border-l-4 border-law-red">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-law-red" />
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onViewAll}
            className="text-sm px-3 py-1 bg-law-red hover:bg-law-red/80 text-white rounded-lg transition"
          >
            Xem tất cả →
          </button>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có hồ sơ nào
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-red-50 border-b border-law-red">
              <tr>
                <th className="px-4 py-2 text-left">STT</th>
                <th className="px-4 py-2 text-left">Số Thụ Lý</th>
                <th className="px-4 py-2 text-left">Đương Sự</th>
                <th className="px-4 py-2 text-left">Ngày Thụ Lý</th>
                <th className="px-4 py-2 text-left">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.slice(0, 10).map((caseItem, index) => {
                const StatusIcon = getStatusIcon(caseItem.trang_thai_giai_quyet)
                const statusColor = getStatusColor(caseItem.trang_thai_giai_quyet)
                const date = new Date(caseItem.ngay_thu_ly)
                const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

                return (
                  <tr key={caseItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">{caseItem.so_thu_ly}</td>
                    <td className="px-4 py-2 text-gray-700">{caseItem.duong_su}</td>
                    <td className="px-4 py-2 text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {dateStr}
                    </td>
                    <td className={`px-4 py-2 flex items-center gap-1 ${statusColor}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{caseItem.trang_thai_giai_quyet}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredCases.length > 10 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Và {filteredCases.length - 10} hồ sơ khác...
        </div>
      )}
    </div>
  )
}

export default QuickCaseList

