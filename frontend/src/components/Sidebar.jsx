import { Menu, LayoutDashboard, FileText, Plus, Settings, LogOut, ChevronLeft } from 'lucide-react'
import { useState } from 'react'

const Sidebar = ({ activeView, onViewChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Bảng điều khiển',
      icon: LayoutDashboard
    },
    {
      id: 'cases',
      label: 'Danh sách hồ sơ',
      icon: FileText
    },
    {
      id: 'add-case',
      label: 'Thêm/Tải hồ sơ',
      icon: Plus
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings
    }
  ]

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-law-red to-law-red-dark text-white transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-law-red/50">
        {!isCollapsed && <h1 className="text-lg font-bold truncate text-law-white">QUẢN LÝ HỒ SƠ</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-8 space-y-2 px-3">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-law-red-dark text-white font-semibold shadow-lg shadow-law-red/20'
                  : 'hover:bg-white/15 text-white/90 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0 text-white" />
              {!isCollapsed && <span className="truncate text-white">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all"
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
