import { useState, useMemo } from 'react'
import { CheckCircle2, Gavel, Pause, TrendingUp } from 'lucide-react'

const SummaryBar = ({ cases = [], selectedMonth = null }) => {
  const stats = useMemo(() => {
    let filteredCases = cases

    // Filter by month if selected
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-')
      filteredCases = cases.filter((c) => {
        const date = new Date(c.ngay_thu_ly)
        return date.getFullYear() === parseInt(year) && date.getMonth() + 1 === parseInt(month)
      })
    }

    // Calculate statistics
    const stats = {
      total: filteredCases.length,
      mediation: 0,
      trial: 0,
      suspended: 0
    }

    filteredCases.forEach((c) => {
      const status = c.trang_thai_giai_quyet || ''
      if (status.includes('Hòa giải thành')) {
        stats.mediation++
      } else if (status.includes('Xét xử') || status.includes('Bản án')) {
        stats.trial++
      } else if (status.includes('Đình chỉ')) {
        stats.suspended++
      }
    })

    return stats
  }, [cases, selectedMonth])

  const statItems = [
    {
      label: 'Tổng giải quyết',
      value: stats.total,
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Hòa giải thành',
      value: stats.mediation,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      label: 'Xét xử',
      value: stats.trial,
      icon: Gavel,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-200'
    },
    {
      label: 'Đình chỉ',
      value: stats.suspended,
      icon: Pause,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => {
        const IconComponent = item.icon
        return (
          <div
            key={item.label}
            className={`${item.bgColor} ${item.borderColor} border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className={`text-2xl font-bold ${item.textColor} mt-1`}>{item.value}</p>
              </div>
              <IconComponent className={`w-10 h-10 ${item.textColor} opacity-20`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SummaryBar
