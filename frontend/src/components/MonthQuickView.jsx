import { useMemo } from 'react'
import { Calendar } from 'lucide-react'

const MonthQuickView = ({ cases, onViewDetails }) => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]

  const monthStats = useMemo(() => {
    const stats = {}
    for (let i = 1; i <= 12; i++) {
      stats[i] = cases.filter((c) => {
        const date = new Date(c.ngay_thu_ly)
        return date.getFullYear() === currentYear && date.getMonth() + 1 === i
      }).length
    }
    return stats
  }, [cases, currentYear])

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-law-red" />
        Thống Kê Theo Tháng ({currentYear})
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {months.map((month, index) => {
          const monthNum = index + 1
          const count = monthStats[monthNum] || 0
          const isCurrentMonth = monthNum === currentMonth
          
          return (
            <button
              key={monthNum}
              onClick={() => onViewDetails(`${currentYear}-${String(monthNum).padStart(2, '0')}`)}
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                count > 0
                  ? 'border-l-4 border-l-law-red border-gray-200 bg-white hover:border-l-law-red'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-700">{month}</div>
              <div className={`text-2xl font-bold mt-1 ${
                count > 0 ? 'text-law-red' : 'text-gray-400'
              }`}>
                {count}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MonthQuickView


