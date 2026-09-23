'use client';
import {
  BookOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  LoadingOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Modal,
  Progress,
  Space,
  Spin,
  Timeline,
  message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';



import { useSelector } from '@/store/hooks';

import { useRouter } from 'next/navigation';

import styles from './DigitalSignature.module.css';



import { ApiResponse } from '@/types/general';
import { CertificateInfo } from '@/libs/moit-sign';
import { getSigner } from '@/libs/moit-sign/signer-singleton';
import { ensureCertificateSelected } from '@/libs/moit-sign/ensureCertificate';
import { SignResultItem } from '@/libs/moit-sign/types';
import { validateCertificateByCommonName, validateCertificateByTaxCode } from '@/utils/Certificate';
import { DuyetAuthenticationContractRequestType } from '@/types/authenticationContract/request';
import duLieuDanhMucService from '@/services/duLieuDanhMuc/duLieuDanhMuc.service';
const { confirm } = Modal;

interface DigitalSignatureModalProps {
  ids: string[];
  fileName?: string;
  buttonText?: string;
  buttonType?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  onSignSuccess?: (
    SignResults: SignResultItem[],
    certificate: CertificateInfo,
  ) => void;
  modalTitle?: string;
  disabled?: boolean;
  size?: 'large' | 'middle' | 'small';
  open?: boolean;
  onCancel?: () => void;
  signerService: {
    getListRawData: (payload: any) => Promise<ApiResponse<any[]>>;
  };
}

type SignProgressState = {
  total: number;
  current: number;
  currentId?: string;
  status?: 'active' | 'success' | 'exception' | 'normal';
  phase?: 'fetch' | 'sign';
  phaseText?: string;
};

const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  ids,
  fileName = 'Document',
  buttonText = 'Ký số điện tử',
  buttonType = 'primary',
  onSignSuccess,
  modalTitle = 'Ký số điện tử',
  disabled = false,
  size = 'middle',
  open,
  onCancel,
  signerService,
}) => {
  const user = useSelector((state) => state.auth.User);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const isOpen = open !== undefined ? open : visible;
  const isDoanhNghiep = !!user?.listRole?.some((r: string) => r.toUpperCase() === 'DOANHNGHIEP');
  const isChuyenVien = !!user?.listRole?.some((r: string) => r.toUpperCase() === 'CHUYENVIENCUC' || r.toUpperCase() === 'CHUYENVIEN');
  const isLanhDao = !!user?.listRole?.some((r: string) => r.toUpperCase() === 'LANHDAOCUC' || r.toUpperCase() === 'LANHDAO');

  // STATES
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPluginReady, setIsPluginReady] = useState(false);
  // const [isUSBConnected, setIsUSBConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>('');
  const total = ids?.length || 0;
  const [progressVisible, setProgressVisible] = useState(false);
  const [signProgress, setSignProgress] = useState<SignProgressState>({
    total,
    current: 0,
    currentId: undefined,
    status: 'normal',
  });
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [isCheckMST, setIsCheckMST] = useState(false);

  const getIsCheckMST = async () => {
    try {
      const res = await duLieuDanhMucService.getAllByGroupCode(
        "CAUHINH_SIGN_NENTANG"
      );

      if (res.status && res.data?.length) {
        const checkMST = res.data.find(
          (item: any) => item.code === "CHECK_MST"
        );

        const checked = checkMST?.priority === 1;
        setIsCheckMST(checked);
        return checked;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  //Chỉ để đếm thời gian
  useEffect(() => {
    if (!progressVisible) {
      setElapsedMs(0);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 250);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [progressVisible]);

  const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (open) {
      handleOpen();
    }
  }, [open]);

  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    initializeSigner();
    getIsCheckMST();
  }, []);

  /** INITIALIZE USB SIGNER */
  const initializeSigner = async () => {
    try {
      setIsLoading(true);
      const signer = getSigner();

      if (!signer.getSessionId()) {
        await signer.init();
      }

      setIsInitialized(true);
      setIsPluginReady(true);
    } catch (e: any) {
      setErrorMessage(e.message || 'Lỗi khởi tạo thiết bị ký số');
    } finally {
      setIsLoading(false);
    }
  };

  /** KIỂM TRA CHỨNG CHỈ + KÝ */
  const signWithCertificate = async (cert?: CertificateInfo) => {
    setIsLoading(true);

    // RESET progress state nhưng CHƯA show progress modal
    setSignProgress({
      total: ids?.length || 0,
      current: 0,
      currentId: undefined,
      status: 'active',
      phase: undefined,
      phaseText: undefined,
    });

    const confirmContinue = (content: string) =>
      new Promise<boolean>((resolve) => {
        confirm({
          title: 'Cảnh báo chữ ký số',
          content,
          okText: 'Tiếp tục ký',
          cancelText: 'Huỷ',
          okButtonProps: { danger: true },
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

    try {
      const signer = getSigner();
      if (!signer.getSessionId()) {
        await signer.init();
      }

      const certificateSelected =
        cert ?? certificate ?? (await ensureCertificateSelected());

      const currentCheckMST = await getIsCheckMST();

      // 1) CHECK MST (hard fail)
      const { valid, message: msg } = validateCertificateByTaxCode(
        certificateSelected,
        user?.userName,
        currentCheckMST,
        isDoanhNghiep,
      );

      if (!valid) {
        const error = msg || 'Chứng thư số không hợp lệ';
        setErrorMessage(error);
        setSignProgress((p) => ({ ...p, status: 'exception' }));
        throw new Error(error);
      }

      // 2) CHECK TÊN (soft confirm)
      const isChuyenVien = user?.listRole?.includes('CHUYENVIEN');
      const isLanhDao = user?.listRole?.includes('LANHDAO');
      const requireNameCheck = !!(isChuyenVien || isLanhDao);

      if (requireNameCheck) {
        const accountName = user?.name ?? user?.userName;

        const nameCheck = validateCertificateByCommonName(
          certificateSelected,
          accountName,
          true,
        );

        if (!nameCheck.valid) {
          const error = nameCheck.message || 'Chứng thư số không hợp lệ';
          setErrorMessage(error);
          setSignProgress((p) => ({ ...p, status: 'exception' }));
          throw new Error(error);
        }

        if (nameCheck.warning && nameCheck.canContinue) {
          // Set warning để show Alert trong modal chính
          setErrorMessage(nameCheck.warning);

          const ok = await confirmContinue(nameCheck.warning);
          if (!ok) {
            setSignProgress((p) => ({ ...p, status: 'normal' }));
            throw new Error('Đã huỷ ký do chữ ký số không khớp tên tài khoản');
          }

          setErrorMessage(null);
        }
      }

      // HIỆN progress modal
      setProgressVisible(true);

      // set phase fetch
      setSignProgress((p) => ({
        ...p,
        status: 'active',
        phase: 'fetch',
        phaseText: 'Đang tải dữ liệu hồ sơ...',
      }));

      setCertificate(certificateSelected);

      const result = await signMultipleFiles();

      onSignSuccess?.(result, certificateSelected);

      setSignProgress((p) => ({
        ...p,
        currentId: undefined,
        current: p.total,
        status: 'success',
      }));

      return true;
    } catch (e: any) {
      setSignProgress((p) => ({ ...p, status: 'exception' }));
      throw e;
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgressVisible(false), 500);
    }
  };

  /** KIỂM TRA CHỨNG CHỈ */
  const handleCheckCertificate = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const signer = getSigner();
      signer.reset();

      const cert = certificate ?? (await ensureCertificateSelected());

      const currentCheckMST = await getIsCheckMST();

      const { valid, message: msg } = validateCertificateByTaxCode(
        cert,
        user?.userName,
        currentCheckMST,
        isDoanhNghiep,
      );

      if (!valid) {
        if (msg) {
          // message.warning(msg);
          setErrorMessage(msg);
        }
        return;
      }

      setCertificate(cert);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Không thể lấy chứng chỉ số');
      // message.error('Kiểm tra chữ ký số thất bại');
      //
    } finally {
      setIsLoading(false);
    }
  };

  /** KÝ SỐ NEW */
  const handleSign = async () => {
    try {
      await signWithCertificate();
      setTimeout(() => handleClose(), 300);
    } catch (e: any) {
      console.log('Lỗi ký số:', e);
      setErrorMessage(e.message || 'Lỗi ký số');
    }
  };

  const signMultipleFiles = async () => {
    const signer = getSigner();
    const result: SignResultItem[] = [];

    const payload: DuyetAuthenticationContractRequestType = {
      listIdHoSo: ids || [],
      lyDo: 'Ký số hồ sơ',
      trangThaiDuyet: 1,
    };

    setProgressVisible(true);
    setSignProgress((p) => ({
      ...p,
      total: ids?.length || 0,
      current: 0,
      currentId: undefined,
      status: 'active',
      phase: 'fetch',
      phaseText: 'Đang tải dữ liệu hồ sơ...',
    }));

    const res = await signerService.getListRawData(payload);
    if (!res?.status || !res.data) return [];

    if (!res?.status || !res.data) {
      setSignProgress((p) => ({
        ...p,
        status: 'exception',
        phaseText: 'Không lấy được dữ liệu hồ sơ',
      }));
      return [];
    }

    // Chuyển sang phase ký
    setSignProgress((p) => ({
      ...p,
      phase: 'sign',
      phaseText: 'Đang ký số hồ sơ...',
    }));

    const listRawData = res.data;

    const rawDataMap = new Map<string, any>();
    for (const item of listRawData) {
      rawDataMap.set(item.hoSoId, item.rawData);
    }

    let done = 0;
    for (const id of ids || []) {
      const rawData = rawDataMap.get(id);
      // await sleep(10000);
      setSignProgress((p) => ({ ...p, currentId: id, status: 'active' }));

      if (!rawData) {
        continue;
      }

      const signature = await signer.signData(rawData);

      result.push({
        id,
        rawData,
        signature,
      });

      done += 1;

      setSignProgress((p) => ({
        ...p,
        current: done,
      }));
    }

    return result;
  };

  /** ĐÓNG MODAL */
  const handleClose = () => {
    setVisible(false);
    resetState();
    onCancel?.();
  };

  const handleOpen = async () => {
    if (!ids || ids.length === 0) {
      message.warning('Chưa có hồ sơ để ký');
      return;
    }

    try {
      setIsLoading(true);

      const signer = getSigner();
      if (!signer.getSessionId()) {
        await signer.init();
      }

      const cert = await ensureCertificateSelected();

      const currentCheckMST = await getIsCheckMST();

      const { valid, message: msg } = validateCertificateByTaxCode(
        cert,
        user?.userName,
        currentCheckMST,
        isDoanhNghiep,
      );

      if (valid) {
        setCertificate(cert);
      } else {
        const error = msg || 'Chứng thư số không hợp lệ';
        setErrorMessage(error);
      }
      setVisible(true);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Không thể kiểm tra chứng thư số');
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  /** RESET STATE */
  const resetState = () => {
    setCertificate(null);
    setSignature('');
    setErrorMessage('');
    // reset progress too
    setSignProgress({
      total: ids?.length || 0,
      current: 0,
      currentId: undefined,
      status: 'normal',
    });
  };

  const percent =
    signProgress.total > 0
      ? Math.round((signProgress.current / signProgress.total) * 100)
      : 0;

  return (
    <>
      {open === undefined && (
        <Button
          type={buttonType}
          icon={<LockOutlined />}
          onClick={handleOpen}
          disabled={disabled}
          size={size}
        >
          {buttonText}
        </Button>
      )}

      <Modal
        title={modalTitle}
        open={isOpen}
        width={800}
        onCancel={handleClose}
        destroyOnClose
        style={{ top: 20 }}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>
              Đóng
            </Button>

            <Button
              type="primary"
              icon={<SafetyOutlined />}
              onClick={handleCheckCertificate}
              loading={isLoading}
              disabled={!isInitialized}
            >
              Kiểm tra chứng chỉ
            </Button>

            <Button
              type="primary"
              danger
              icon={<LockOutlined />}
              onClick={handleSign}
              loading={isLoading}
              disabled={!isInitialized || !!errorMessage || isLoading}
            >
              Ký số
            </Button>
          </Space>
        }
      >
        {/* spin */}
        <Spin spinning={isLoading} tip="Đang xử lý...">
          <div className={styles.container}>
            {errorMessage ? (
              <Alert message={errorMessage} type="error" showIcon />
            ) : isPluginReady ? (
              <Alert
                message="MOIT SignPlugin ký số đã sẵn sàng"
                type="success"
                showIcon
              />
            ) : (
              <Alert
                message="MOIT SignPlugin chưa sẵn sàng. Vui lòng mở plugin hoặc kiểm tra kết nối."
                type="warning"
                showIcon
              />
            )}

            {certificate && (
              <Card
                title={
                  <span>
                    <SafetyCertificateOutlined style={{ marginRight: 8 }} />
                    Thông tin USB ký số
                  </span>
                }
                className={styles.certCard}
                size="small"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Chủ sở hữu">
                    {certificate.commonName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nhà phát hành">
                    {certificate.issuer}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số seri">
                    {certificate.serialNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hiệu lực từ">
                    {certificate.validFrom}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hiệu lực đến">
                    {certificate.validTo}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card
              title={
                <span>
                  <BookOutlined style={{ marginRight: 8 }} />
                  Hướng dẫn sử dụng
                </span>
              }
              className={styles.instructionCard}
              size="small"
            >
              <ol className="list-decimal pl-4">
                <li>
                  Vui lòng cài đặt phần mềm <strong>MOITSignPlugin</strong> để hệ
                  thống nhận USB Token và thực hiện ký số. <br /> Nếu chưa có, hãy{' '}
                  <a href="/uploads/MOITSignPlugin_20210628.rar">
                    <DownloadOutlined /> Tải xuống
                  </a>
                  .
                </li>

                <li>
                  Cắm USB Token vào máy và chờ hệ thống nhận thiết bị. Nếu không
                  nhận, hãy rút ra cắm lại hoặc kiểm tra driver.
                </li>

                <li>
                  Nhấn <strong>“Kiểm tra chứng chỉ”</strong> để lấy thông tin
                  chứng thư số. Nếu không hiển thị, kiểm tra lại thiết bị hoặc
                  phần mềm ký số.
                </li>

                <li>
                  Khi chứng thư hợp lệ, nhấn <strong>“Ký số”</strong> để tiến hành
                  ký hồ sơ. Hệ thống sẽ yêu cầu bạn xác nhận trước khi ký.
                </li>

                <li>
                  Nếu gặp lỗi, hãy kiểm tra lại:
                  <Timeline
                    className="pl-2 mt-2"
                    items={[
                      {
                        color: '#1890ff',
                        className: 'pb-0',
                        children: 'USB Token đã kết nối đúng.',
                      },
                      {
                        color: '#1890ff',
                        className: 'pb-0',
                        children: (
                          <>
                            Phần mềm <strong>MOITSignPlugin</strong> đang chạy.
                          </>
                        ),
                      },
                      {
                        color: '#1890ff',
                        className: 'pb-0',
                        children: (
                          <>
                            Thử nhấn lại <strong>“Kiểm tra chứng chỉ”</strong>.
                          </>
                        ),
                      },
                    ]}
                  />
                </li>
              </ol>
            </Card>
          </div>
        </Spin>
      </Modal>

      <Modal
        open={progressVisible}
        footer={null}
        closable={false}
        maskClosable={false}
        width={600}
        zIndex={2000}
        centered
        className="flex  justify-center items-center"
      >
        <div className="w-full px-6 py-4">
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            {/* Progress bar */}
            <Progress
              type="line"
              size={[0, 20]}
              percent={percent}
              percentPosition={{ align: 'center', type: 'outer' }}
              status={signProgress.status}
              format={() => `${signProgress.current}/${signProgress.total}`}
              style={{ width: '100%' }}
            />

            {/* Phase text */}
            <div className="flex items-center justify-center gap-2 text-base font-medium text-gray-700">
              <LoadingOutlined className="animate-spin text-blue-500" />
              <span>{signProgress.phaseText ?? 'Đang xử lý...'}</span>
            </div>

            {/* Elapsed time */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ClockCircleOutlined />
              <span>
                Đã xử lý:{' '}
                <strong className="text-gray-700">
                  {formatElapsed(elapsedMs)}
                </strong>
              </span>
            </div>

            {/* Current signing item */}
            {signProgress.currentId && signProgress.phase === 'sign' && (
              <div className="mt-2 rounded-md bg-blue-50 px-4 py-2 text-center text-sm text-blue-700">
                Đang ký số hồ sơ:{' '}
                <span className="font-semibold">#{signProgress.currentId}</span>
              </div>
            )}
          </Space>
        </div>
      </Modal>
    </>
  );
};

export default DigitalSignatureModal;
