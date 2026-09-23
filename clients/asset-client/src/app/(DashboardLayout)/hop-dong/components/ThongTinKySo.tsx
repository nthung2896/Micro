import { getSigner } from '@/libs/moit-sign/signer-singleton';
import { ApiResponse } from '@/types/general';
import { SignatureInfoType } from '@/types/signatureInfo/dto';


import formatDate from '@/utils/formatDate';
import {
    BookOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Descriptions,
    Empty,
    message,
    Modal,
    Spin,
    Timeline,
} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import React, { useEffect, useState } from 'react';

interface ThongTinKySoProps {
    hoSoId: string;
    signerService: {
        getSignature: (id: string) => Promise<ApiResponse<SignatureInfoType[]>>;
        decodeRawData: (rawData: string) => Promise<ApiResponse<string>>;
    };
}

const ThongTinKySo = ({
    hoSoId,
    signerService,
}: ThongTinKySoProps) => {
    const [signatures, setSignatures] = useState<SignatureInfoType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<string>();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (hoSoId) {
            fetchSignatures();
        }
    }, [hoSoId]);

    const fetchSignatures = async () => {
        try {
            setLoading(true);
            const response = await signerService.getSignature(hoSoId);
            if (response.status) {
                setSignatures(response.data);
                // await verifyAllSignatures(response.data);
            } else {
                message.error('Không thể lấy dữ liệu chữ ký');
            }
        } catch (error) {
            message.error('Lỗi khi tải chữ ký số');
            console.error('Error fetching signatures:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyAllSignatures = async (list: SignatureInfoType[]) => {
        const signer = getSigner();
        const results: SignatureInfoType[] = [];

        for (const sig of list) {
            try {
                const result = await signer.verifySignature(
                    sig.originalData ?? '',
                    sig.signaturePkcs7 ?? ''
                );

                results.push({
                    ...sig,
                    signatureStatus: result.success ? 'valid' : 'invalid',
                    signatureError: result.error,
                });
            } catch (e: any) {
                results.push({
                    ...sig,
                    signatureStatus: 'invalid',
                    signatureError: e.message || 'Verification failed',
                });
            }
        }
        setSignatures(results);
    };

    const fetchDecodedData = async (rawData: string) => {
        try {
            setLoading(true);
            const response = await signerService.decodeRawData(rawData);
            if (response.status) {
                setModalData(response.data);
                setIsModalOpen(true);
            } else {
                message.error('Không thể giải mã dữ liệu');
            }
        } catch (error) {
            message.error('Lỗi khi giải mã dữ liệu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTimelineDot = (status?: string) => {
        if (status === 'valid')
            return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        if (status === 'invalid')
            return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    };

    return (
        <>
            <Spin spinning={loading}>
                {signatures.length === 0 && !loading ? (
                    <Empty description="Chưa có chữ ký số" className="mt-8" />
                ) : (
                    <Timeline
                        mode="left"
                        items={signatures.map((sig, index) => ({
                            key: index,
                            dot: getTimelineDot(sig.signatureStatus),
                            children: (
                                <>
                                    <div className="mb-2 font-semibold">
                                        {sig.signatureStatus === 'valid'
                                            ? 'Chữ ký hợp lệ – dữ liệu gốc không bị thay đổi.'
                                            : 'Chữ ký không hợp lệ – dữ liệu gốc đã thay đổi hoặc chữ ký không đúng.'}
                                        <Button
                                            icon={<BookOutlined />}
                                            type="link"
                                            onClick={() => fetchDecodedData(sig.originalData ?? '')}
                                            hidden
                                        >
                                            Xem dữ liệu
                                        </Button>
                                    </div>

                                    {sig.signatureStatus === 'invalid' && sig.signatureError && (
                                        <Alert
                                            type="error"
                                            message="Lỗi xác thực"
                                            description={sig.signatureError}
                                            showIcon
                                            className="mb-2"
                                        />
                                    )}

                                    <Descriptions size="small" column={1}>
                                        <Descriptions.Item label="Ngày ký:">
                                            {formatDate(sig.createdDate ?? '')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Chủ sở hữu">
                                            {sig.certCommonName}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Nhà phát hành">
                                            {sig.certIssuer}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </>
                            ),
                        }))}
                    />
                )}
            </Spin>
            <Modal
                title="Dữ liệu"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <pre className="bg-gray-100 p-3 rounded text-xs whitespace-pre-wrap">
                    <pre
                        style={{
                            background: '#f5f5f5',
                            padding: 12,
                            borderRadius: 4,
                            whiteSpace: 'pre-wrap',
                            maxHeight: 500,
                            overflow: 'auto',
                        }}
                    >
                        {modalData}
                    </pre>
                </pre>
            </Modal>
        </>
    );
};

export default ThongTinKySo;
