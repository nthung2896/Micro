// MOIT Sign Plugin Types
export type XMLHttpRequestCallback = (xmlhttp: XMLHttpRequest) => void;

export interface CertificateInfo {
  rawData: string;
  serialNumber: string;
  commonName: string;
  distinguishedName: string;
  issuer: string;
  validFrom: string;
  validTo: string;
}

export interface SignatureResult {
  signature: string;
  verified: boolean;
}

export type SignResultItem = {
  id: string;
  rawData: string;
  signature: string;
};

export interface FileSignResult {
  success: boolean;
  message: string;
  filePath?: string;
}

export interface UploadSignResult {
  link: string;
  message: string;
}

export interface SetupConfig {
  url: string;
  fileSize: string;
  timeServer: string;
}

export type Base64Type = {
  VERSION: string;
  atob: (a: string) => string;
  btoa: (b: string) => string;
  fromBase64: (a: string) => string;
  toBase64: (u: string) => string;
  utob: (u: string) => string;
  encode: (u: string, urisafe?: boolean) => string;
  encodeURI: (u: string) => string;
  btou: (b: string) => string;
  decode: (a: string) => string;
  noConflict: () => Base64Type;
  extendString?: () => void;
};

// Global declarations for browser compatibility
declare global {
  interface Window {
    ActiveXObject?: new (progId: string) => XMLHttpRequest;
    Base64: Base64Type;
    hSession: string;
    process: boolean;
  }
  var ActiveXObject: new (progId: string) => XMLHttpRequest;
}
