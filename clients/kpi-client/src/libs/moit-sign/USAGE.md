/**
 * MOIT Signer Library Usage Example
 * 
 * This is a clean library-style API for digital signature operations
 */

import MOITSigner, { MOITSigner as MOITSignerClass } from "@/libs/moit-sign";

// Usage example:
async function exampleUsage() {
  try {
    // 1. Initialize the signer with optional configuration
    const signer = new MOITSigner({
      baseUrl: "http://localhost:14005", // Optional, defaults to this
      onSuccess: (msg) => console.log("✓", msg),
      onError: (err) => console.error("✗", err),
    });

    // 2. Initialize the plugin and get session
    console.log("Initializing plugin...");
    const sessionId = await signer.init();
    console.log("Session ID:", sessionId);

    // 3. Get certificate from smart card
    console.log("Fetching certificate...");
    const cert = await signer.getCertificate();
    console.log("Certificate info:", {
      commonName: cert.commonName,
      serialNumber: cert.serialNumber,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
    });

    // 4. Sign some data
    console.log("Signing data...");
    const dataToSign = "Hello, this is the data I want to sign";
    const signature = await signer.signData(dataToSign);
    console.log("Signature:", signature);

    // 5. Verify the signature
    console.log("Verifying signature...");
    const isValid = await signer.verifySignature(dataToSign, signature);
    console.log("Signature valid:", isValid);

    // 6. Sign a file
    console.log("Signing file...");
    const result = await signer.signFile("C:\\input.pdf", "C:\\output.pdf");
    console.log("File signed:", result);

    // 7. Sign and upload
    console.log("Signing and uploading...");
    const uploadLink = await signer.signAndUpload("C:\\document.pdf");
    console.log("Download link:", uploadLink);

    // Get stored certificate data anytime
    const storedCert = signer.getCertificateData();
    console.log("Stored certificate:", storedCert);

    // Get current signature
    const currentSig = signer.getSignature();
    console.log("Current signature:", currentSig);

    // Reset data
    signer.reset();
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * MOIT Signer API Reference:
 *
 * Constructor:
 *   new MOITSigner(config?: SignerConfig)
 *   - config.baseUrl?: string (default: "http://localhost:14005")
 *   - config.onSuccess?: (message: string) => void
 *   - config.onError?: (error: string) => void
 *
 * Methods:
 *   init(): Promise<string>
 *     Initialize plugin and get session ID
 *
 *   getCertificate(): Promise<CertificateInfo>
 *     Fetch certificate from smart card
 *     Returns: { rawData, serialNumber, commonName, distinguishedName, issuer, validFrom, validTo }
 *
 *   signData(data: string): Promise<string>
 *     Sign data and return signature
 *
 *   verifySignature(data: string, signature: string): Promise<boolean>
 *     Verify if signature matches data
 *
 *   signFile(inputFile: string, outputFile: string): Promise<string>
 *     Sign a file
 *
 *   signAndUpload(filePath: string): Promise<string>
 *     Sign file and upload, returns download link
 *
 *   getCertificateData(): Partial<CertificateInfo>
 *     Get stored certificate data
 *
 *   getSignature(): string
 *     Get last created signature
 *
 *   getSessionId(): string
 *     Get current session ID
 *
 *   isProcessing_(): boolean
 *     Check if operation is in progress
 *
 *   reset(): void
 *     Reset all data and states
 */
