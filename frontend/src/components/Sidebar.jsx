const Sidebar = ({ selectedTab, onSelectTab }) => {
  const menuItems = [
    { key: 'dashboard', label: '📊 Tổng quan' },
    { key: 'list', label: '📋 Danh sách' },
    { key: 'add', label: '➕ Thêm án mới' }
  ]

  return (
    <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sticky top-6">
      <div className="mb-3 border-b border-gray-200 pb-2">
        <h2 className="text-sm font-semibold text-law-red">Điều hướng</h2>
      </div>
      {menuItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelectTab(item.key)}
          className={`w-full rounded-lg px-3 py-2 text-sm font-medium text-left transition ${selectedTab === item.key ? 'bg-law-red text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default Sidebar
