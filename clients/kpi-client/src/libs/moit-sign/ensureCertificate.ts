// libs/moit-sign/ensureCertificate.ts
import { getSigner } from './signer-singleton';
import type { CertificateInfo } from './types';

export const ensureCertificateSelected = async (): Promise<CertificateInfo> => {
  const signer = getSigner();

  if (!signer.getSessionId()) {
    await signer.init();
  }

  const cached = signer.getCertificateData();

  if (cached?.serialNumber) {
    return cached as CertificateInfo;
  }

  return await signer.getCertificate();
};
