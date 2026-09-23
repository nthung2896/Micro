import { CertificateInfo } from './types';

export default class MOITSignerMock {
  private hSession: string = 'mock-session-id';
  private certificateData: CertificateInfo | null = null;
  private signatureData: string = '';

  constructor(config?: any) {
    // giữ nguyên để không lỗi khi truyền config từ component
    config?.onSuccess?.('MOITSignerMock initialized');
  }

  async init(): Promise<string> {
    await this.delay(500);
    return this.hSession;
  }

  async getCertificate(): Promise<CertificateInfo> {
    await this.delay(500);

    const cert: CertificateInfo = {
      rawData: 'FAKE_RAW_DATA_BASE64',
      serialNumber: '5401010907cee9a5415f81d2db039f7a',
      commonName:
        'CÔNG TY CỔ PHẦN CÔNG NGHỆ HINET VIỆT NAM - CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH',
      distinguishedName:
        'DN OID.0.9.2342.19200300.100.1.1=MST:0106489944-001, CN=CÔNG TY CỔ PHẦN CÔNG NGHỆ HINET VIỆT NAM - CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH, O=CÔNG TY CỔ PHẦN CÔNG NGHỆ HINET VIỆT NAM - CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH, S=Hồ Chí Minh, C=VN',
      issuer: 'NEWTEL-CA SHA-256 v2',
      validFrom: '2024-01-01',
      validTo: '2030-01-01',
    };

    this.certificateData = cert;
    return cert;
  }

  async signData(data: string): Promise<string> {
    await this.delay(500);

    const fakeSig = btoa('FAKE_SIGNATURE_' + data);
    this.signatureData = fakeSig;
    return fakeSig;
  }

  async verifySignature(
    data: string,
    signature: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    await this.delay(300);
    return { success: true };
  }

  getCertificateData() {
    return this.certificateData;
  }

  getSignature() {
    return this.signatureData;
  }

  getSessionId(): string {
    return this.hSession;
  }

  reset(): void {
    this.certificateData = null;
    this.signatureData = '';
    this.hSession = 'mock-session-id';
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
