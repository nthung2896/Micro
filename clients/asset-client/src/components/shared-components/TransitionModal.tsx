"use client";

import { Modal, Form, Collapse, FormInstance } from "antd";
import { FolderOpenOutlined, FileTextOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import React from "react";
import "react-quill-new/dist/quill.snow.css";

const QuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
  },
  {
    ssr: false,
  },
);

interface TransitionModalProps {
  open: boolean;
  title: string;
  form: FormInstance;
  onCancel: () => void;
  onFinish: (values: { note: string }) => void;
  groupedTemplates: Array<{
    type: string;
    typeName?: string;
    templates: Array<{
      id: string;
      name: string;
      content: string;
    }>;
  }>;
}

const TransitionModal: React.FC<TransitionModalProps> = ({
  open,
  title,
  form,
  onCancel,
  onFinish,
  groupedTemplates,
}) => {
  const editorRef = React.useRef<any>(null);

  const handleApplyTemplate = (content: string) => {
    let cleanContent = (content || "").trim();
    // Loại bỏ các đoạn văn hoặc ngắt dòng trống ở đầu/cuối của mẫu (bao gồm khoảng trắng/newline)
    cleanContent = cleanContent.replace(/^(\s|<p><br><\/p>|<p><br\/><\/p>|<p>&nbsp;<\/p>|<br\/?>)+/i, "");
    cleanContent = cleanContent.replace(/(\s|<p><br><\/p>|<p><br\/><\/p>|<p>&nbsp;<\/p>|<br\/?>)+$/i, "");

    const currentNote = form.getFieldValue("note") || "";
    const cleanText = currentNote.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim();
    const isNoteEmpty = cleanText === "";

    const quill = editorRef.current?.getEditor ? editorRef.current.getEditor() : null;

    if (quill) {
      if (isNoteEmpty) {
        // Ghi trực tiếp vào innerHTML để thay thế hoàn toàn thẻ <p><br></p> mặc định
        quill.root.innerHTML = cleanContent;
        form.setFieldsValue({ note: cleanContent });
      } else {
        // Nối tiếp mẫu. Loại bỏ triệt để thẻ ngắt dòng/đoạn văn trống ở cuối nội dung hiện tại
        let baseNote = quill.root.innerHTML || "";
        baseNote = baseNote.replace(/(\s|<p><br><\/p>|<p><br\/><\/p>|<p>&nbsp;<\/p>|<br\/?>)+$/i, "");

        quill.root.innerHTML = baseNote + cleanContent;
        form.setFieldsValue({ note: quill.root.innerHTML });
      }
    } else {
      // Fallback khi chưa mount xong editor
      if (isNoteEmpty) {
        form.setFieldsValue({ note: cleanContent });
      } else {
        let baseNote = currentNote;
        baseNote = baseNote.replace(/(\s|<p><br><\/p>|<p><br\/><\/p>|<p>&nbsp;<\/p>|<br\/?>)+$/i, "");
        form.setFieldsValue({ note: baseNote + cleanContent });
      }
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Xác nhận"
      cancelText="Hủy"
      destroyOnClose
      width={1200}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px", alignItems: "start" }}>
          {/* Cột trái: Quill Editor để soạn thảo ý kiến */}
          <div>
            <Form.Item
              name="note"
              label="Ý kiến phê duyệt / Nội dung phản hồi"
              rules={[{ required: true, message: "Vui lòng nhập ý kiến hoặc nội dung phản hồi!" }]}
            >
              <QuillEditor
                {...{ ref: editorRef }}
                theme="snow"
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ color: [] }, { background: [] }],
                    ["clean"]
                  ]
                }}
                placeholder="Nhập ghi chú phản hồi cho doanh nghiệp hoặc cấp trên..."
              />
            </Form.Item>
            <div style={{ height: 10 }}></div>
          </div>

          {/* Cột phải: Chọn nhanh mẫu ý kiến theo loại hồ sơ (cuộn khi quá dài) */}
          <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 max-h-[350px] flex flex-col shadow-sm">
            <div className="font-semibold text-xs text-slate-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              💡 Chọn nhanh mẫu ý kiến
            </div>
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
              {groupedTemplates.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">Không tìm thấy mẫu trả lời sẵn.</div>
              ) : (
                <Collapse ghost size="small" accordion expandIconPosition="end">
                  {groupedTemplates.map((group) => (
                    <Collapse.Panel
                      header={
                        <span className="flex items-center gap-2 font-semibold text-slate-700 text-[13px] hover:text-blue-600 transition-colors duration-150 py-0.5">
                          <FolderOpenOutlined className="text-slate-400 text-sm" />
                          {group.typeName || group.type}
                        </span>
                      }
                      key={group.type}
                    >
                      <div className="flex flex-col gap-2 py-1.5 pl-1">
                        {group.templates.map((temp: any) => (
                          <div
                            key={temp.id}
                            className="group flex items-start gap-2.5 px-3 py-2 bg-white hover:bg-blue-50/30 border border-slate-200/60 hover:border-blue-300 rounded-md cursor-pointer transition-all duration-150 text-slate-600 hover:text-blue-600 shadow-sm hover:shadow"
                            onClick={() => handleApplyTemplate(temp.content)}
                          >
                            <FileTextOutlined className="text-slate-400 group-hover:text-blue-500 text-xs mt-0.5 flex-shrink-0 transition-colors duration-150" />
                            <span className="text-[12px] font-medium leading-relaxed truncate">{temp.name}</span>
                          </div>
                        ))}
                      </div>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              )}
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default TransitionModal;
