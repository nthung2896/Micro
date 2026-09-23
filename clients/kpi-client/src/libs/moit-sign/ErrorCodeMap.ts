export const ERROR_CODE_MAP: Record<string, string> = {
  // --- Nhóm chung ---
  '100100': 'Lỗi chọn CTS',
  '100101': 'Lỗi Plugin / Lỗi chép file',
  '100102': 'CTS không hợp lệ / File bị mã hóa',
  '100103': 'Session không hợp lệ / Không tìm thấy CTS',
  '100104': 'CTS hết hạn / Lỗi CTS',
  '100200': 'Dữ liệu lỗi',
  '100201': 'Không tìm thấy CTS / Lỗi chép file',
  '100202': 'CTS không hợp lệ / File bị mã hóa',
  '100203': 'Lỗi xảy ra trong quá trình ký / Không tìm thấy CTS',
  '100204': 'Tràn bộ nhớ / Lỗi CTS',
  '100205': 'Session không hợp lệ / CTS không hợp lệ',

  '100300': 'Chữ ký không đúng định dạng',
  '100301': 'Lỗi phân tích CTS / Lỗi chép file',
  '100302': 'Chữ ký không hợp lệ / File bị mã hóa',
  '100303': 'Session không hợp lệ / Không tìm thấy CTS',

  '100304': 'Lỗi CTS',
  '100305': 'CTS không hợp lệ',

  '100306': 'Lỗi đọc file',
  '100307': 'Lỗi trong quá trình ký',

  '100400': 'Loại file không hỗ trợ',
  '100401': 'Loại file không hỗ trợ',
  '100402': 'Tên file quá dài',
  '100403': 'Kích thước file quá lớn',
  '100404': 'Chưa thiết lập link upload',

  '100405': 'Lỗi upload file',
  '100406': 'Lỗi upload file',
  '100407': 'Lỗi upload file',
  '100408': 'Lỗi upload file',

  '100500': 'Lỗi input file',
  '100501': 'Lỗi output file',
  '100502': 'Session không hợp lệ',

  '100600': 'Hủy chọn file',
  '100601': 'Hủy lưu file',

  '100700': 'Session không hợp lệ',
  '100701': 'Không tìm thấy CTS',

  '100800': 'Session không hợp lệ',
  '100801': 'Dữ liệu file XML không đúng định dạng',
  '100802': 'Không tìm thấy CTS',
  '100803': 'CTS lỗi',
  '100804': 'CTS không hợp lệ',
  '100805': 'Lỗi trong quá trình ký',

  '101000': 'Session không hợp lệ',
  '101001': 'Lỗi input file',
  '101002': 'Lỗi copy file',
  '101003': 'Lỗi đọc file tạm',
  '101004': 'Lỗi upload file',

  '101100': 'Session không hợp lệ',
  '101101': 'Lỗi input file',
  '101102': 'Lỗi copy file',
  '101103': 'Lỗi đọc file tạm',
  '101104': 'Lỗi upload file',

  '101200': 'Session không hợp lệ',
  '101201': 'Định dạng thời gian không đúng',

  '101300': 'Session không hợp lệ',
  '101301': 'Lỗi input file',
};
