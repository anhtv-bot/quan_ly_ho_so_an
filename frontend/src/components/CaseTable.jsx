import { useState } from 'react'

const CaseTable = ({ cases, onCaseUpdate, onCaseDelete }) => {
  const [editingId, setEditingId] = useState(null)
  const [editedCase, setEditedCase] = useState(null)

  const getStatusColor = (caseItem) => {
    if (
      caseItem.trang_thai.includes('Hòa giải thành') ||
      caseItem.trang_thai.includes('Xét xử') ||
      caseItem.trang_thai.includes('Đình chỉ') ||
      caseItem.trang_thai.includes('Tạm đình chỉ') ||
      caseItem.trang_thai.includes('Bản án')
    ) {
      return 'bg-green-100 text-green-800'
    }
    const now = new Date()
    const deadline = new Date(caseItem.han_giai_quyet)
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) return 'bg-red-100 text-red-800'
    if (daysLeft < 15) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const statusOptions = [
    'Hòa giải thành',
    'Xét xử',
    'Đình chỉ',
    'Tạm đình chỉ',
    'Bản án'
  ]

  const typeOptions = [
    'Dân sự',
    'Hôn nhân',
    'KDTM',
    'Lao động',
    'Hình sự',
    'Hành chính',
    'Cai nghiện'
  ]

  const getCaseCategory = (caseItem) => {
    const now = new Date()
    const startDate = new Date(caseItem.ngay_thu_ly)
    const daysSince = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    
    if (caseItem.loai_an === 'Hình sự' && daysSince < 30) return 'Khẩn cấp'
    if (caseItem.loai_an === 'KDTM' && daysSince < 15) return 'Ưu tiên'
    return 'Bình thường'
  }

  const parseDateValue = (value) => {
    if (!value) return value
    const normalized = value.trim().replace(/\./g, '-').replace(/\//g, '-')
    const parts = normalized.split('-').map((part) => part.trim())
    if (parts.length === 3) {
      const [dayPart, monthPart, yearPart] = parts
      const day = Number(dayPart)
      const month = Number(monthPart)
      const year = Number(yearPart)
      if (![day, month, year].some((n) => Number.isNaN(n))) {
        const iso = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        const parsed = new Date(iso)
        if (!Number.isNaN(parsed.getTime())) {
          return parsed.toISOString()
        }
      }
    }

    const fallback = new Date(value)
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.toISOString()
    }

    return value
  }

  const handleEditClick = (caseItem) => {
    setEditingId(caseItem.id)
    setEditedCase({
      ...caseItem,
      ngay_thu_ly: new Date(caseItem.ngay_thu_ly).toLocaleDateString('vi-VN')
    })
  }

  const handleFieldChange = (field, value) => {
    setEditedCase({
      ...editedCase,
      [field]: value
    })
  }

  const handleSave = () => {
    const payload = {
      ...editedCase,
      ngay_thu_ly: parseDateValue(editedCase.ngay_thu_ly)
    }
    onCaseUpdate(editingId, payload)
    setEditingId(null)
    setEditedCase(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedCase(null)
  }

  const handleDelete = (caseItem) => {
    const title = caseItem.ten_duong_su || 'đương sự này'
    const confirmed = window.confirm(`Xác nhận xóa án của ${title}?`)
    if (confirmed) {
      onCaseDelete(caseItem.id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 card-law">
      <h2 className="text-xl font-semibold mb-4 text-law-red">Danh Sách Án</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">STT</th>
              <th className="px-4 py-2 text-left">Biên Lai Án Phí</th>
              <th className="px-4 py-2 text-left">Số Thụ Lý</th>
              <th className="px-4 py-2 text-left">Ngày Thụ Lý</th>
              <th className="px-4 py-2 text-left">Tên Đương Sự</th>
              <th className="px-4 py-2 text-left">Quan Hệ Tranh Chấp</th>
              <th className="px-4 py-2 text-left">Loại Án</th>
              <th className="px-4 py-2 text-left">Trường Hợp</th>
              <th className="px-4 py-2 text-left">Trạng Thái</th>
              <th className="px-4 py-2 text-left">Hạn Giải Quyết</th>
              <th className="px-4 py-2 text-left">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((caseItem) => (
              <tr key={caseItem.id} className="border-t group">
                <td className="px-4 py-2">{caseItem.stt}</td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.bien_lai_an_phi}
                      onChange={(e) => handleFieldChange('bien_lai_an_phi', e.target.value)}
                    />
                  ) : (
                    caseItem.bien_lai_an_phi
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.so_thu_ly}
                      onChange={(e) => handleFieldChange('so_thu_ly', e.target.value)}
                    />
                  ) : (
                    caseItem.so_thu_ly
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.ngay_thu_ly}
                      onChange={(e) => handleFieldChange('ngay_thu_ly', e.target.value)}
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    new Date(caseItem.ngay_thu_ly).toLocaleDateString('vi-VN')
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.ten_duong_su}
                      onChange={(e) => handleFieldChange('ten_duong_su', e.target.value)}
                    />
                  ) : (
                    caseItem.ten_duong_su
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.quan_he_tranh_chap}
                      onChange={(e) => handleFieldChange('quan_he_tranh_chap', e.target.value)}
                    />
                  ) : (
                    caseItem.quan_he_tranh_chap
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.loai_an}
                      onChange={(e) => handleFieldChange('loai_an', e.target.value)}
                    >
                      <option value="">Chọn loại án</option>
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    caseItem.loai_an
                  )}
                </td>
                <td className="px-4 py-2">{getCaseCategory(caseItem)}</td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.trang_thai}
                      onChange={(e) => handleFieldChange('trang_thai', e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(caseItem)}`}>
                      {caseItem.trang_thai}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{new Date(caseItem.han_giai_quyet).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded"
                        onClick={handleSave}
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded"
                        onClick={handleCancel}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleEditClick(caseItem)}
                        title="Chỉnh sửa toàn bộ án"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.293.204l-4 1.5a1 1 0 01-1.272-1.272l1.5-4a1 1 0 01.204-.293l9.193-9.193a2 2 0 012.828 0zM15.586 5.414L14 3.828 5.586 12.242l-1 2.667 2.667-1L15.586 5.414z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(caseItem)}
                        title="Xóa án"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 9a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V9z" clipRule="evenodd" />
                          <path d="M5 4a1 1 0 011-1h8a1 1 0 011 1v1H5V4z" />
                          <path fillRule="evenodd" d="M4 7a1 1 0 011-1h10a1 1 0 011 1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm2 1v8h8V8H6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CaseTable