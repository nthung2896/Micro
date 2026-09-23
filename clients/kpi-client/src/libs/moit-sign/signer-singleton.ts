// libs/moit-sign/signer-singleton.ts
import RealSigner from './sign';
import MockSigner from './index.mock';

const SignerClass =
  process.env.NEXT_PUBLIC_USE_SIGNER_MOCK === 'true' ? MockSigner : RealSigner;

let signerInstance: any = null;

export const getSigner = () => {
  if (!signerInstance) {
    signerInstance = new SignerClass();
  }
  return signerInstance;
};
