import { parsePluginError } from './ErrorUtils';
import type { CertificateInfo } from './types';

interface SignerConfig {
  baseUrl?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

class MOITSigner {
  private hSession: string = '';
  private isProcessing: boolean = false;
  private baseUrl: string = 'http://localhost:14005';
  private onError?: (error: string) => void;
  private onSuccess?: (message: string) => void;
  private certificateData: Partial<CertificateInfo> = {};
  private signatureData: string = '';
  private hasCertificate = false;

  constructor(config?: SignerConfig) {
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    if (config?.onError) {
      this.onError = config.onError;
    }
    if (config?.onSuccess) {
      this.onSuccess = config.onSuccess;
    }
  }

  /**
   * Initialize plugin and get session
   */
  async init(): Promise<string> {
    return new Promise((resolve, reject) => {
      const xmlhttp = this.createXHR();
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState !== 4) return;

        if (xmlhttp.status === 200 && xmlhttp.responseText) {
          this.hSession = xmlhttp.responseText;

          //Không set được thì bỏ qua
          this.setTimeVerify(undefined, 1).catch(() => {});

          this.onSuccess?.('Plugin initialized successfully');
          console.log('this.hSession', this.hSession);
          resolve(this.hSession);
          return;
        }

        const error = 'Failed to initialize plugin';
        this.onError?.(error);
        reject(new Error(error));
      };

      xmlhttp.open('POST', `${this.baseUrl}/getSession`, true);
      xmlhttp.send();
    });
  }

  /**
   * Get certificate information from the smart card
   */
  async getCertificate(): Promise<CertificateInfo> {
    if (this.hasCertificate && this.certificateData.serialNumber) {
      return this.certificateData as CertificateInfo;
    }

    if (this.isProcessing) {
      throw new Error('Another operation is in progress');
    }

    this.isProcessing = true;
    return new Promise(async (resolve, reject) => {
      try {
        const xmlhttp = this.createXHR();
        xmlhttp.onreadystatechange = async () => {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const rawData = xmlhttp.responseText;
            if (!rawData) {
              const error = await this.getLastError();
              this.isProcessing = false;
              this.onError?.(error);
              reject(new Error(error));
              return;
            }

            this.certificateData.rawData = rawData;

            try {
              // Fetch all certificate fields in parallel
              const [snb, cn, dn, issuer, validFrom, validTo] =
                await Promise.all([
                  this.fetchCertField('/getCertSNB'),
                  this.fetchCertField('/getCertCN'),
                  this.fetchCertField('/getCertDN'),
                  this.fetchCertField('/getCertIssuer'),
                  this.fetchCertField('/getCertValidDate'),
                  this.fetchCertField('/getCertExpireDate'),
                ]);

              this.certificateData = {
                rawData,
                serialNumber: snb,
                commonName: cn,
                distinguishedName: dn,
                issuer,
                validFrom,
                validTo,
              };

              this.hasCertificate = true;
              this.isProcessing = false;
              this.onSuccess?.('Certificate fetched successfully');
              resolve(this.certificateData as CertificateInfo);
            } catch (error) {
              this.isProcessing = false;
              reject(error);
            }
          }
        };

        xmlhttp.open('POST', `${this.baseUrl}/getCertificate`, true);
        xmlhttp.setRequestHeader(
          'Content-type',
          'application/x-www-form-urlencoded',
        );
        xmlhttp.send('sessionID=' + this.hSession);
      } catch (error) {
        this.isProcessing = false;
        reject(error);
      }
    });
  }

  /**
   * Sign data with the certificate
   */
  async signData(data: string): Promise<string> {
    if (this.isProcessing) {
      throw new Error('Another operation is in progress');
    }

    if (!data) {
      throw new Error('Data to sign cannot be empty');
    }

    this.isProcessing = true;
    return new Promise((resolve, reject) => {
      const xmlhttp = this.createXHR();
      xmlhttp.onreadystatechange = async () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          const signature = xmlhttp.responseText;
          if (!signature) {
            const error = await this.getLastError();
            this.isProcessing = false;
            this.onError?.(error);
            reject(new Error(error));
            return;
          }

          this.signatureData = signature;
          this.isProcessing = false;
          this.onSuccess?.('Data signed successfully');
          resolve(signature);
        }
      };

      xmlhttp.open('POST', `${this.baseUrl}/Sign`, true);
      xmlhttp.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded',
      );
      xmlhttp.send('sessionID=' + this.hSession + '&inData=' + data);
    });
  }

  /**
   * Verify signature
   */
  async verifySignature(
    data: string,
    signature: string,
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (this.isProcessing) {
      return { success: false, error: 'Another operation is in progress' };
    }

    if (!signature) {
      return { success: false, error: 'Signature cannot be empty' };
    }

    this.isProcessing = true;

    return new Promise((resolve) => {
      const xhr = this.createXHR();

      xhr.onreadystatechange = async () => {
        if (xhr.readyState !== 4) return;

        this.isProcessing = false;

        if (xhr.status !== 200) {
          return resolve({
            success: false,
            error: 'Verify request failed',
          });
        }

        const response = xhr.responseText?.trim();

        if (!response) {
          // Lỗi → lấy lỗi plugin
          const pluginError = await this.getLastError();
          return resolve({
            success: false,
            error: pluginError || 'Unknown plugin error',
          });
        }

        // Response không rỗng = success
        return resolve({ success: true });
      };

      xhr.open('POST', `${this.baseUrl}/Verify`, true);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(
        `sessionID=${this.hSession}&signature=${signature}&inData=${data}`,
      );
    });
  }

  /**
   * Sign a file
   */
  async signFile(inputFile: string, outputFile: string): Promise<string> {
    if (this.isProcessing) {
      throw new Error('Another operation is in progress');
    }

    if (!inputFile || !outputFile) {
      throw new Error('Input and output file paths are required');
    }

    this.isProcessing = true;
    return new Promise(async (resolve, reject) => {
      try {
        const xmlhttp = this.createXHR();
        xmlhttp.onreadystatechange = async () => {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const result = xmlhttp.responseText;
            if (!result) {
              const error = await this.getLastError();
              this.isProcessing = false;
              this.onError?.(error);
              reject(new Error(error));
              return;
            }

            this.isProcessing = false;
            this.onSuccess?.(`File signed successfully: ${result}`);
            resolve(result);
          }
        };

        xmlhttp.open('POST', `${this.baseUrl}/fileSign`, true);
        xmlhttp.setRequestHeader(
          'Content-type',
          'application/x-www-form-urlencoded',
        );
        xmlhttp.send(
          'sessionID=' +
            this.hSession +
            '&inputFile=' +
            encodeURIComponent(inputFile) +
            '&outputFile=' +
            encodeURIComponent(outputFile) +
            '&xmlSignType=0&tagXMLData=data',
        );
      } catch (error) {
        this.isProcessing = false;
        reject(error);
      }
    });
  }

  /**
   * Sign file and upload to server
   */
  async signAndUpload(filePath: string): Promise<string> {
    if (this.isProcessing) {
      throw new Error('Another operation is in progress');
    }

    if (!filePath) {
      throw new Error('File path is required');
    }

    this.isProcessing = true;
    return new Promise(async (resolve, reject) => {
      try {
        const xmlhttp = this.createXHR();
        xmlhttp.onreadystatechange = async () => {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const result = xmlhttp.responseText;
            if (!result) {
              const error = await this.getLastError();
              this.isProcessing = false;
              this.onError?.(error);
              reject(new Error(error));
              return;
            }

            // Extract download link from response
            const linkMatch = result.match(/"link":"([^"]+)"/);
            const downloadLink = linkMatch ? linkMatch[1] : result;

            this.isProcessing = false;
            this.onSuccess?.('File signed and uploaded successfully');
            resolve(downloadLink);
          }
        };

        xmlhttp.open('POST', `${this.baseUrl}/signAndUpload`, true);
        xmlhttp.setRequestHeader(
          'Content-type',
          'application/x-www-form-urlencoded',
        );
        xmlhttp.send(
          'sessionID=' +
            this.hSession +
            '&filePath=' +
            encodeURIComponent(filePath),
        );
      } catch (error) {
        this.isProcessing = false;
        reject(error);
      }
    });
  }

  /**
   * Get the last error from the plugin
   */
  private async getLastError(): Promise<string> {
    return new Promise((resolve) => {
      const xmlhttp = this.createXHR();
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          const raw = 'Error code = ' + (xmlhttp.responseText?.trim() || '');
          const parsed = parsePluginError(raw);
          resolve(`${parsed.raw}: ${parsed.message}`);
        }
      };
      xmlhttp.open('POST', `${this.baseUrl}/getLastErr`, true);
      xmlhttp.send();
    });
  }

  /**
   * Fetch a single certificate field
   */
  private fetchCertField(endpoint: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xmlhttp = this.createXHR();
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            resolve(xmlhttp.responseText);
          } else {
            reject(
              new Error(`Failed to fetch certificate field from ${endpoint}`),
            );
          }
        }
      };
      xmlhttp.open('POST', `${this.baseUrl}${endpoint}`, true);
      xmlhttp.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded',
      );
      xmlhttp.send('sessionID=' + this.hSession);
    });
  }

  /**
   * Create XMLHttpRequest with fallback for IE
   */
  private createXHR(): XMLHttpRequest {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else {
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
  }

  private formatYYYYMMDDHHmmss(date: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }

  /**
   * Get current certificate data
   */
  getCertificateData(): Partial<CertificateInfo> {
    return { ...this.certificateData };
  }

  /**
   * Get current signature
   */
  getSignature(): string {
    return this.signatureData;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.hSession;
  }

  /**
   * Ensure Certificate
   */
  async ensureCertificate(): Promise<CertificateInfo> {
    if (this.isProcessing) {
      throw new Error('Signer is busy');
    }

    if (!this.getSessionId()) {
      await this.init();
    }

    const cached = this.getCertificateData();
    if (cached?.serialNumber) {
      return cached as CertificateInfo;
    }

    return await this.getCertificate();
  }

  async setTimeVerify(timeServer?: string, daysFromNow = 1): Promise<boolean> {
    if (!this.getSessionId()) {
      throw new Error('Missing sessionID. Call init() first.');
    }

    const ts =
      timeServer ??
      this.formatYYYYMMDDHHmmss(new Date(Date.now() + daysFromNow * 86400000));

    return new Promise((resolve, reject) => {
      const xhr = this.createXHR();
      xhr.onreadystatechange = async () => {
        if (xhr.readyState !== 4) return;

        if (xhr.status !== 200) {
          return reject(new Error('setTimeVerify failed'));
        }

        const ret = xhr.responseText?.trim();
        if (ret === '0') return resolve(true);

        const error = await this.getLastError();
        reject(new Error(error));
      };

      xhr.open('POST', `${this.baseUrl}/setTimeVerify`, true);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(
        `sessionID=${this.hSession}&timeServer=${encodeURIComponent(ts)}`,
      );
    });
  }

  /**
   * Check if an operation is in progress
   */
  isProcessing_(): boolean {
    return this.isProcessing;
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.certificateData = {};
    this.signatureData = '';
    this.isProcessing = false;
    this.hasCertificate = false;
  }
}

export default MOITSigner;
export { MOITSigner };
