const Statistics = ({ stats }) => {
  const statusCounts = stats.status_counts || {}

  const upperStats = [
    {
      title: 'Đang giải quyết',
      value: stats.dang_giai_quyet ?? 0,
      valueClass: 'text-blue-600',
      bgClass: 'bg-white'
    },
    {
      title: 'Còn dưới 15 ngày',
      value: stats.an_sap_het_han ?? 0,
      valueClass: 'text-yellow-600',
      bgClass: 'bg-white'
    },
    {
      title: 'Quá hạn',
      value: stats.an_qua_han ?? 0,
      valueClass: 'text-red-600',
      bgClass: 'bg-white'
    }
  ]

  const typeOrder = [
    'Dân sự',
    'Hôn nhân',
    'KDTM',
    'Lao động',
    'Hình sự',
    'Hành chính',
    'Cai nghiện'
  ]

  const order = [
    'Hòa giải thành',
    'Xét xử',
    'Đình chỉ',
    'Tạm đình chỉ',
    'Bản án'
  ]

  const categoryCounts = stats.category_counts || {}

  const categoryOrder = ['Khẩn cấp', 'Ưu tiên', 'Bình thường']

  const typeCounts = stats.type_counts || {}

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {upperStats.map((item) => (
          <div key={item.title} className={`${item.bgClass} rounded-lg shadow-sm p-4 text-center card-law`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{item.title}</h3>
            <p className={`text-2xl font-bold ${item.valueClass}`}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-4">
        {typeOrder.map((type) => (
          <div key={type} className="bg-white rounded-lg shadow-sm p-4 text-center card-law">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{type}</h3>
            <p className="text-2xl font-bold text-green-600">{typeCounts[type] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {order.map((status) => (
          <div key={status} className="bg-white rounded-lg shadow-sm p-4 text-center card-law">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{status}</h3>
            <p className="text-2xl font-bold text-blue-600">{statusCounts[status] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {categoryOrder.map((category) => (
          <div key={category} className="bg-white rounded-lg shadow-sm p-4 text-center card-law">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{category}</h3>
            <p className="text-2xl font-bold text-purple-600">{categoryCounts[category] ?? 0}</p>
          </div>
        ))}
      </div>
    </>
  )

}

export default Statistics