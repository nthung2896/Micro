export interface SignatureInfoType {
    hSoId: string;
    signaturePkcs7: string;
    originalData: string;
    createdDate: Date;
    certCommonName: string;
    certIssuer: string;
    signatureStatus?: string;
    signatureError?: string;
}