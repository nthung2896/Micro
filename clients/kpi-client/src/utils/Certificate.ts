export function getTaxCode(input: string): string | null {
  if (!input) return null;
  const match = input.match(/MST:([0-9\-]+)/);
  return match ? match[1] : null;
}

export function getRootTaxCode(input: string) {
  const taxCode = getTaxCode(input);
  return taxCode ? taxCode.split('-')[0] : null;
}

export function normalizeTaxCode(
  taxCode: string | null | undefined,
): string | null {
  if (!taxCode) return null;

  return taxCode.toLowerCase().replace(/-/g, '');
}

export function validateCertificateByTaxCode(
  cert: any,
  userTaxCode?: string,
  requireTaxCodeValidation: boolean = true,
  isDoanhNghiep: boolean = false,
): {
  valid: boolean;
  taxCode?: string | null;
  message?: string;
} {
  if (!cert) {
    return {
      valid: false,
      message: 'Không tìm thấy chứng thư số',
    };
  }

  const dn = cert.distinguishedName;
  if (!dn) {
    return {
      valid: false,
      message: 'Chứng thư số không hợp lệ',
    };
  }

  let taxCodeFromCert: string | null = null;
  let rootTaxCodeFromCert: string | null = null;

  // 1. Nếu là doanh nghiệp, bắt buộc chữ ký số phải chứa mã số thuế (bất kể có check trùng hay không)
  if (isDoanhNghiep) {
    taxCodeFromCert = getTaxCode(dn);
    rootTaxCodeFromCert = getRootTaxCode(dn);
    if (!taxCodeFromCert && !rootTaxCodeFromCert) {
      return {
        valid: false,
        message: 'Không tìm thấy mã số thuế trong chữ ký số',
      };
    }
  }

  // 2. Nếu có yêu cầu kiểm tra trùng khớp mã số thuế giữa tài khoản và chữ ký số
  if (userTaxCode && requireTaxCodeValidation) {
    // Lấy mã số thuế từ cert nếu ở trên chưa lấy
    if (!taxCodeFromCert && !rootTaxCodeFromCert) {
      taxCodeFromCert = getTaxCode(dn);
      rootTaxCodeFromCert = getRootTaxCode(dn);
    }

    if (!taxCodeFromCert && !rootTaxCodeFromCert) {
      return {
        valid: false,
        message: 'Không tìm thấy mã số thuế trong chữ ký số',
      };
    }

    const normalizedUserTaxCode = normalizeTaxCode(userTaxCode);
    const normalizedTaxCodeFromCert = normalizeTaxCode(taxCodeFromCert);
    const normalizedRootTaxCodeFromCert = normalizeTaxCode(rootTaxCodeFromCert);

    if (normalizedTaxCodeFromCert === normalizedUserTaxCode) {
      // OK
    } else if (normalizedRootTaxCodeFromCert === normalizedUserTaxCode) {
      taxCodeFromCert = rootTaxCodeFromCert;
    } else {
      return {
        valid: false,
        taxCode: taxCodeFromCert || rootTaxCodeFromCert,
        message: `Chữ ký số không khớp mã số thuế (MST chữ ký: ${taxCodeFromCert || rootTaxCodeFromCert})`,
      };
    }
  }

  // Optional: check hết hạn
  if (cert.validTo && new Date(cert.validTo) < new Date()) {
    return {
      valid: false,
      message: 'Chữ ký số đã hết hạn',
    };
  }

  return {
    valid: true,
    taxCode: taxCodeFromCert,
  };
}

export function validateCertificateByCommonName(
  cert: any,
  accountName?: string,
  requireMatch: boolean = true,
): {
  valid: boolean; // true luôn nếu cert hợp lệ
  matched?: boolean; // có match hay không
  warning?: string; // cảnh báo để show UI
  canContinue?: boolean; // nếu mismatch thì true (cho phép confirm)
  message?: string; // chỉ dùng khi cert lỗi thật sự
} {
  if (!cert) {
    return { valid: false, message: 'Không tìm thấy chứng thư số' };
  }

  const commonName = (cert.commonName ?? '').trim();
  if (!commonName) {
    return {
      valid: true,
      matched: false,
      warning: 'Không đọc được commonName từ chứng thư số.',
      canContinue: true,
    };
  }

  if (!requireMatch) {
    return { valid: true, matched: true };
  }

  const nCert = normalizeText(commonName);
  const nAcc = normalizeText(accountName ?? '');

  // tuỳ hệ thống bạn: so user.fullName hay user.userName
  const matched = !!nAcc && nCert === nAcc;

  if (matched) {
    return { valid: true, matched: true };
  }

  return {
    valid: true,
    matched: false,
    warning: `Tên trên chữ ký số ("${commonName}") không khớp tên tài khoản ("${accountName ?? ''}"). Bạn có muốn tiếp tục ký không?`,
    canContinue: true,
  };
}

function normalizeText(input: string) {
  return (input ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/\s+/g, ' '); // gộp khoảng trắng
}
