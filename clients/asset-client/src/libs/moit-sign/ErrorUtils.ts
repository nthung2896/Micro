import { ERROR_CODE_MAP } from './ErrorCodeMap';

export function parsePluginError(errorMessage: string) {
  if (!errorMessage) {
    return {
      code: null,
      message: 'Lỗi không xác định từ thiết bị ký',
      raw: errorMessage,
    };
  }

  const match = errorMessage.match(/\b(\d{6})\b/);

  if (!match) {
    return {
      code: null,
      message: 'Không tìm thấy mã lỗi trong phản hồi thiết bị ký',
      raw: errorMessage,
    };
  }

  const code = match[1];
  const mappedMessage =
    ERROR_CODE_MAP[code] || 'Lỗi không xác định từ thiết bị ký';

  return {
    code,
    message: mappedMessage,
    raw: errorMessage,
  };
}
