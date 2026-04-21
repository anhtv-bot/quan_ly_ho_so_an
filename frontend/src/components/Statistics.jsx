import { Clock, AlertTriangle, AlertCircle, CheckCircle, XCircle, PauseCircle, FileText, ArrowRight, Gavel, FileCheck } from 'lucide-react'

const Statistics = ({ stats, activeFilter, onFilterSelect, onClearFilter }) => {
  const statusCounts = stats.status_counts || {}

  const upperStats = [
    {
      title: 'Đang giải quyết',
      value: stats.dang_giai_quyet ?? 0,
      valueClass: 'text-law-navy-dark',
      bgClass: 'bg-white',
      icon: Clock,
      filterKey: 'deadline:active'
    },
    {
      title: 'Sắp đến hạn (<15 ngày)',
      value: stats.an_sap_het_han ?? 0,
      valueClass: (stats.an_sap_het_han ?? 0) > 0 ? 'text-law-gold-dark' : 'text-gray-600',
      bgClass: 'bg-white',
      icon: AlertTriangle,
      filterKey: 'deadline:warning'
    },
    {
      title: 'Hết thời hạn giải quyết',
      value: stats.an_qua_han ?? 0,
      valueClass: (stats.an_qua_han ?? 0) > 0 ? 'text-law-red' : 'text-gray-600',
      bgClass: 'bg-white',
      icon: AlertCircle,
      filterKey: 'deadline:overdue'
    }
  ]

  const statusIcons = {
    'Đang giải quyết': Clock,
    'Hòa giải thành': CheckCircle,
    'Đình chỉ': XCircle,
    'Tạm đình chỉ': PauseCircle,
    'Nhập vụ án': FileText,
    'Chuyển vụ án': ArrowRight,
    'Xét xử': Gavel,
    'Bản án': FileCheck
  }

  const order = [
    'Đang giải quyết',
    'Hòa giải thành',
    'Đình chỉ',
    'Tạm đình chỉ',
    'Nhập vụ án',
    'Chuyển vụ án',
    'Xét xử',
    'Bản án'
  ]

  return (
    <>
      <div onClick={onClearFilter} className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {upperStats.map((item) => {
            const IconComponent = item.icon
            return (
              <div
                key={item.title}
                className={`w-full ${item.bgClass} rounded-lg shadow-sm p-3 text-center card-law transition border cursor-default`}
              >
                <div className="flex items-center justify-center mb-1">
                  <IconComponent className="w-5 h-5 text-law-gold mr-1" />
                  <h3 className="text-xs font-semibold text-law-red">{item.title}</h3>
                </div>
                <p className={`text-2xl font-bold ${item.valueClass}`}>{item.value}</p>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
          {order.map((status) => {
            const IconComponent = statusIcons[status]
            return (
              <div
                key={status}
                className={`w-full bg-white rounded-lg shadow-sm p-3 text-center card-law transition border cursor-default`}
              >
                <div className="flex items-center justify-center mb-1">
                  <IconComponent className="w-4 h-4 text-law-gold mr-0.5" />
                  <h3 className="text-xs font-semibold text-law-red line-clamp-1">{status}</h3>
                </div>
                <p className="text-xl font-bold text-blue-600">{statusCounts[status] ?? 0}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

}

export default Statistics