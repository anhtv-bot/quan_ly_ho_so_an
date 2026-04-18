import { useState } from 'react'

const CaseTable = ({ cases, onCaseUpdate, onCaseDelete }) => {
  const [editingId, setEditingId] = useState(null)
  const [editedCase, setEditedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const getStatusColor = (caseItem) => {
    const status = caseItem.trang_thai_giai_quyet?.toString() || ''
    if (
      status.includes('Hòa giải thành') ||
      status.includes('Đình chỉ') ||
      status.includes('Nhập vụ án') ||
      status.includes('Chuyển vụ án')
    ) {
      return 'bg-green-100 text-green-800'
    }
    const now = new Date()
    const deadline = new Date(caseItem.han_giai_quyet || '')
    const daysLeft = Number.isFinite(deadline.getTime()) ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null
    if (daysLeft !== null) {
      if (daysLeft < 0) return 'bg-red-100 text-red-800'
      if (daysLeft < 15) return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-blue-100 text-blue-800'
  }

  const formatDisplayDate = (value) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('vi-VN')
    }
    return value
  }

  const statusOptions = [
    'Hòa giải thành',
    'Đình chỉ',
    'Nhập vụ án',
    'Chuyển vụ án'
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

  const totalPages = Math.max(1, Math.ceil(cases.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const visibleCases = cases.slice(startIndex, startIndex + pageSize)

  const getCaseCategory = (caseItem) => {
    const now = new Date()
    const startDate = new Date(caseItem.ngay_thu_ly)
    if (Number.isNaN(startDate.getTime())) return 'Bình thường'
    const daysSince = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    
    if (caseItem.loai_an === 'Hình sự' && daysSince < 30) return 'Khẩn cấp'
    if (caseItem.loai_an === 'KDTM' && daysSince < 15) return 'Ưu tiên'
    return 'Bình thường'
  }

  const parseDateValue = (value) => {
    if (!value) return null
    const normalized = value.trim().replace(/\./g, '-').replace(/\//g, '-')
    const parts = normalized.split('-').map((part) => part.trim())
    if (parts.length === 3) {
      const [dayPart, monthPart, yearPart] = parts
      const day = Number(dayPart)
      const month = Number(monthPart)
      const year = Number(yearPart)
      if (![day, month, year].some((n) => Number.isNaN(n))) {
        const dateOnly = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        const parsed = new Date(dateOnly)
        if (!Number.isNaN(parsed.getTime())) {
          return dateOnly
        }
      }
    }

    const fallback = new Date(value)
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.toISOString().split('T')[0]
    }

    return null
  }

  const handleEditClick = (caseItem) => {
    setEditingId(caseItem.id)
    setEditedCase({
      ...caseItem,
      ngay_thu_ly: caseItem.ngay_thu_ly ? new Date(caseItem.ngay_thu_ly).toLocaleDateString('vi-VN') : '',
      ngay_xet_xu: caseItem.ngay_xet_xu ? new Date(caseItem.ngay_xet_xu).toLocaleDateString('vi-VN') : '',
      trang_thai_giai_quyet: caseItem.trang_thai_giai_quyet || 'Hòa giải thành'
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
      ngay_thu_ly: parseDateValue(editedCase.ngay_thu_ly),
      ngay_xet_xu: parseDateValue(editedCase.ngay_xet_xu)
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
    const title = caseItem.duong_su || 'đương sự này'
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
              <th className="px-4 py-2 text-left">Số Thụ Lý</th>
              <th className="px-4 py-2 text-left">Ngày Thụ Lý</th>
              <th className="px-4 py-2 text-left">Đương Sự</th>
              <th className="px-4 py-2 text-left">Quan Hệ Pháp Luật</th>
              <th className="px-4 py-2 text-left">Ngày Xét Xử</th>
              <th className="px-4 py-2 text-left">QĐ CNSTT</th>
              <th className="px-4 py-2 text-left">Trạng Thái Giải Quyết</th>
              <th className="px-4 py-2 text-left">Ghi Chú</th>
              <th className="px-4 py-2 text-left">Đã Mã Hóa</th>
              <th className="px-4 py-2 text-left">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {visibleCases.map((caseItem, index) => (
              <tr key={caseItem.id} className="border-t group">
                <td className="px-4 py-2">{startIndex + index + 1}</td>
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
                    formatDisplayDate(caseItem.ngay_thu_ly)
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.duong_su || ''}
                      onChange={(e) => handleFieldChange('duong_su', e.target.value)}
                    />
                  ) : (
                    caseItem.duong_su || ''
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.quan_he_phap_luat || ''}
                      onChange={(e) => handleFieldChange('quan_he_phap_luat', e.target.value)}
                    />
                  ) : (
                    caseItem.quan_he_phap_luat || ''
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.ngay_xet_xu}
                      onChange={(e) => handleFieldChange('ngay_xet_xu', e.target.value)}
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    formatDisplayDate(caseItem.ngay_xet_xu)
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.qd_cnstt || ''}
                      onChange={(e) => handleFieldChange('qd_cnstt', e.target.value)}
                    />
                  ) : (
                    caseItem.qd_cnstt || ''
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.trang_thai_giai_quyet}
                      onChange={(e) => handleFieldChange('trang_thai_giai_quyet', e.target.value)}
                    >
                      <option value="Hòa giải thành">Hòa giải thành (HGT)</option>
                      <option value="Đình chỉ">Đình chỉ (ĐC)</option>
                      <option value="Nhập vụ án">Nhập vụ án (NVA)</option>
                      <option value="Chuyển vụ án">Chuyển vụ án</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(caseItem)}`}>
                      {caseItem.trang_thai_giai_quyet}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <textarea
                      className="w-full border rounded px-2 py-1"
                      value={editedCase.ghi_chu}
                      onChange={(e) => handleFieldChange('ghi_chu', e.target.value)}
                      rows="2"
                    />
                  ) : (
                    caseItem.ghi_chu
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === caseItem.id ? (
                    <input
                      type="checkbox"
                      checked={editedCase.ma_hoa}
                      onChange={(e) => handleFieldChange('ma_hoa', e.target.checked)}
                    />
                  ) : (
                    caseItem.ma_hoa ? '✓' : ''
                  )}
                </td>
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
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          Hiển thị {visibleCases.length} trên {cases.length} án
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>Số dòng mỗi trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-md p-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseTable