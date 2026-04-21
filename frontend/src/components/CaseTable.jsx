import { useState } from 'react'

const CaseTable = ({ cases, onCaseUpdate, onCaseDelete, onCaseExport, onBulkDelete, onBulkExport }) => {
  const [editingId, setEditingId] = useState(null)
  const [editedCase, setEditedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedCaseIds, setSelectedCaseIds] = useState([])

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
    if (!value) return '-'
    try {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) {
        const day = String(parsed.getDate()).padStart(2, '0')
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const year = parsed.getFullYear()
        return `${day}/${month}/${year}`
      }
    } catch (e) {
      // ignore
    }
    return '-'
  }

  const statusOptions = [
    'Đang giải quyết',
    'Hòa giải thành',
    'Đình chỉ',
    'Tạm đình chỉ',
    'Nhập vụ án',
    'Chuyển vụ án',
    'Xét xử',
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
      ngay_thu_ly: caseItem.ngay_thu_ly ? formatDisplayDate(caseItem.ngay_thu_ly) : '',
      ngay_xet_xu: caseItem.ngay_xet_xu ? formatDisplayDate(caseItem.ngay_xet_xu) : '',
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

  const allVisibleSelected = visibleCases.length > 0 && visibleCases.every((caseItem) => selectedCaseIds.includes(caseItem.id))

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedCaseIds((prev) => prev.filter((id) => !visibleCases.some((caseItem) => caseItem.id === id)))
    } else {
      setSelectedCaseIds((prev) => [...new Set([...prev, ...visibleCases.map((caseItem) => caseItem.id)])])
    }
  }

  const toggleCaseSelection = (caseId) => {
    setSelectedCaseIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    )
  }

  const handleBulkDelete = async () => {
    if (!selectedCaseIds.length) return
    const confirmed = window.confirm(`Xác nhận xóa ${selectedCaseIds.length} hồ sơ đã chọn?`)
    if (!confirmed) return

    const success = await onBulkDelete(selectedCaseIds)
    if (success) {
      setSelectedCaseIds([])
    }
  }

  const handleBulkExport = async () => {
    if (!selectedCaseIds.length) return
    const success = await onBulkExport(selectedCaseIds)
    if (success) {
      setSelectedCaseIds([])
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 card-law">
      <h2 className="text-lg font-semibold mb-3 text-law-red">Danh Sách Án</h2>
      {selectedCaseIds.length > 0 && (
        <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-700">
            ✓ Đã chọn {selectedCaseIds.length} hồ sơ
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
              onClick={handleBulkDelete}
            >
              Xóa ({selectedCaseIds.length})
            </button>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
              onClick={handleBulkExport}
            >
              Tải báo cáo
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-xs" style={{fontSize: '13px'}}>
          <thead className="bg-gray-100 sticky top-0">
            <tr className="bg-gray-50 text-gray-700">
              <th className="px-2 py-1.5 text-left w-8">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                  className="w-4 h-4"
                />
              </th>
              <th className="px-2 py-1.5 text-left w-12">STT</th>
              <th className="px-2 py-1.5 text-left w-24">Số Thụ Lý</th>
              <th className="px-2 py-1.5 text-left w-20">Ngày Thụ Lý</th>
              <th className="px-2 py-1.5 text-left min-w-32">Đương Sự</th>
              <th className="px-2 py-1.5 text-left min-w-40">Quan Hệ Pháp Luật</th>
              <th className="px-2 py-1.5 text-left w-20">Ngày Xét Xử</th>
              <th className="px-2 py-1.5 text-left w-20">QĐ CNSTT</th>
              <th className="px-2 py-1.5 text-left w-28">Trạng Thái</th>
              <th className="px-2 py-1.5 text-left min-w-32">Ghi Chú</th>
              <th className="px-2 py-1.5 text-left w-24">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {visibleCases.map((caseItem, index) => (
              <tr key={caseItem.id} className={`border-t group h-12 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={selectedCaseIds.includes(caseItem.id)}
                    onChange={() => toggleCaseSelection(caseItem.id)}
                    aria-label={`Chọn hồ sơ ${startIndex + index + 1}`}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">{startIndex + index + 1}</td>
                <td className="px-2 py-1.5 truncate max-w-xs">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.so_thu_ly}
                      onChange={(e) => handleFieldChange('so_thu_ly', e.target.value)}
                    />
                  ) : (
                    <span title={caseItem.so_thu_ly}>{caseItem.so_thu_ly || '-'}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.ngay_thu_ly}
                      onChange={(e) => handleFieldChange('ngay_thu_ly', e.target.value)}
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <span title={formatDisplayDate(caseItem.ngay_thu_ly)}>{formatDisplayDate(caseItem.ngay_thu_ly)}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 line-clamp-1">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.duong_su || ''}
                      onChange={(e) => handleFieldChange('duong_su', e.target.value)}
                    />
                  ) : (
                    <span title={caseItem.duong_su || '-'}>{caseItem.duong_su || '-'}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 line-clamp-1">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.quan_he_phap_luat || ''}
                      onChange={(e) => handleFieldChange('quan_he_phap_luat', e.target.value)}
                    />
                  ) : (
                    <span title={caseItem.quan_he_phap_luat || '-'}>{caseItem.quan_he_phap_luat || '-'}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.ngay_xet_xu}
                      onChange={(e) => handleFieldChange('ngay_xet_xu', e.target.value)}
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <span title={formatDisplayDate(caseItem.ngay_xet_xu)}>{formatDisplayDate(caseItem.ngay_xet_xu)}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 truncate max-w-xs">
                  {editingId === caseItem.id ? (
                    <input
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.qd_cnstt || ''}
                      onChange={(e) => handleFieldChange('qd_cnstt', e.target.value)}
                    />
                  ) : (
                    <span title={caseItem.qd_cnstt || '-'}>{caseItem.qd_cnstt || '-'}</span>
                  )}
                </td>
                <td className="px-2 py-1.5">
                  {editingId === caseItem.id ? (
                    <select
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.trang_thai_giai_quyet}
                      onChange={(e) => handleFieldChange('trang_thai_giai_quyet', e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold line-clamp-1 ${getStatusColor(caseItem)}`}>
                      {caseItem.trang_thai_giai_quyet || '-'}
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 line-clamp-1">
                  {editingId === caseItem.id ? (
                    <textarea
                      className="w-full border rounded px-1 py-0.5 text-xs"
                      value={editedCase.ghi_chu}
                      onChange={(e) => handleFieldChange('ghi_chu', e.target.value)}
                      rows="1"
                    />
                  ) : (
                    <span title={caseItem.ghi_chu || '-'}>{caseItem.ghi_chu || '-'}</span>
                  )}
                </td>
                <td className="px-2 py-1.5">
                  {editingId === caseItem.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded text-xs"
                        onClick={handleSave}
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-2 py-0.5 rounded text-xs"
                        onClick={handleCancel}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => handleEditClick(caseItem)}
                        title="Chỉnh sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.293.204l-4 1.5a1 1 0 01-1.272-1.272l1.5-4a1 1 0 01.204-.293l9.193-9.193a2 2 0 012.828 0zM15.586 5.414L14 3.828 5.586 12.242l-1 2.667 2.667-1L15.586 5.414z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-600 p-1"
                        onClick={() => onCaseExport && onCaseExport(caseItem.id)}
                        title="Tải xuống"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600 p-1"
                        onClick={() => handleDelete(caseItem)}
                        title="Xóa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
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
      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs">
        <div className="text-gray-600">
          Hiển thị {visibleCases.length} / {cases.length} án
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label className="flex items-center gap-1 text-gray-700">
            <span>Dòng/trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded px-2 py-0.5 text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <div className="flex items-center gap-1 text-gray-700">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 rounded border border-gray-300 bg-white disabled:opacity-50 text-xs"
            >
              ← Trước
            </button>
            <span className="text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 rounded border border-gray-300 bg-white disabled:opacity-50 text-xs"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseTable