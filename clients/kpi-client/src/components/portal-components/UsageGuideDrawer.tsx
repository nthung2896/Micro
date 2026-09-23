"use client";
import { CopyOutlined } from "@ant-design/icons";
import { Alert, Card, Collapse, Drawer, Tag, Typography, message } from "antd";
import { DATA_SOURCE_DOCS } from "./dataSourceRegistry";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

type Props = {
  open: boolean;
  onClose: () => void;
};

function copy(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => message.success("Đã sao chép"))
    .catch(() => message.error("Sao chép thất bại"));
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          padding: 12,
          borderRadius: 6,
          fontSize: 12,
          overflow: "auto",
          margin: 0,
          maxHeight: 280,
        }}
      >
        {children}
      </pre>
      <CopyOutlined
        onClick={() => copy(children)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: 14,
        }}
        title="Sao chép"
      />
    </div>
  );
}

export default function UsageGuideDrawer({ open, onClose }: Props) {
  return (
    <Drawer
      title="Hướng dẫn sử dụng khối giao diện"
      width={760}
      open={open}
      onClose={onClose}
      zIndex={2000}
    >
      <Title level={5}>1. Cơ chế hoạt động</Title>
      <Paragraph>
        Mỗi khối có 1 đoạn <Text strong>JSX + Tailwind</Text> (body) và 1{" "}
        <Text code>Nguồn dữ liệu</Text> tuỳ chọn. Khi render trên Portal:
      </Paragraph>
      <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
        <li>
          Frontend gọi <Text code>GET /api/HomeBlock/GetActive/home</Text> để lấy
          các khối đang <Tag color="green">IsActive</Tag>, sắp theo{" "}
          <Text code>SortOrder</Text>.
        </li>
        <li>
          Mỗi khối nếu có <Text code>DataSource</Text> → fetch data theo nguồn đó.
        </li>
        <li>
          Engine thay biến trong body (vd <Text code>{`{{name}}`}</Text>,{" "}
          <Text code>{`{{#each items}}`}</Text>) bằng data, convert{" "}
          <Text code>className</Text> → <Text code>class</Text>, rồi render ra DOM.
        </li>
        <li>
          Portal tự load <Text strong>Tailwind v4 runtime</Text> nên mọi class
          Tailwind (kể cả class chưa từng xuất hiện trong source code) đều có CSS.
        </li>
      </ol>

      <Title level={5}>2. Cú pháp HTML/JSX + Tailwind</Title>
      <Paragraph>
        Body block hỗ trợ <Text strong>cú pháp JSX</Text> (dùng{" "}
        <Text code>className</Text>) hoặc HTML thuần (dùng <Text code>class</Text>
        ). Engine tự convert <Text code>className</Text> →{" "}
        <Text code>class</Text> trước khi render. Mọi class Tailwind đều dùng
        được vì Portal tự load Tailwind v4 runtime.
      </Paragraph>
      <CodeBlock>{`<section className="bg-blue-700 text-white py-12">
  <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-2xl font-bold">{{title}}</h2>
    <div className="grid grid-cols-4 gap-4 mt-6">
      {{#each items}}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-yellow-300 font-bold">{{value}}</div>
          <div className="text-xs">{{label}}</div>
        </div>
      {{/each}}
    </div>
  </div>
</section>`}</CodeBlock>

      <Title level={5} style={{ marginTop: 16 }}>
        3. Cú pháp biến (Mustache)
      </Title>
      <Card size="small" style={{ marginBottom: 16 }}>
        <table style={{ width: "100%", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={{ textAlign: "left", padding: 6 }}>Cú pháp</th>
              <th style={{ textAlign: "left", padding: 6 }}>Ý nghĩa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{{tenBien}}`}</Text>
              </td>
              <td style={{ padding: 6 }}>Thay biến (tự escape HTML)</td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{{{tenBien}}}`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                Thay biến không escape (HTML tin cậy)
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#each items}}...{{/each}}`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                Lặp mảng. Trong loop dùng <Text code>{`{{field}}`}</Text> trực
                tiếp.
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{{@index}}`}</Text> / <Text code>{`{{@number}}`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                Chỉ số trong loop (0-based / 1-based).
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#if isShow}}...{{/if}}`}</Text>
              </td>
              <td style={{ padding: 6 }}>Render nếu giá trị truthy.</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Title level={5}>4. Format dữ liệu API cần trả về</Title>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Mỗi nguồn dữ liệu dưới đây là 1 endpoint backend cần expose. Frontend gọi tới, parse JSON rồi truyền vào template engine."
      />

      <Paragraph>
        <Text strong>Khi chọn "Tùy chọn — gõ API tự do":</Text> dán URL (vd{" "}
        <Text code>/api/Portal/MyData</Text> hoặc{" "}
        <Text code>https://other.com/data</Text>). Hệ thống fetch JSON và{" "}
        <Text strong>giữ nguyên cấu trúc</Text> — bạn tự gõ đúng path trong
        template, không có chuyển đổi tự động.
      </Paragraph>
      <Card size="small" style={{ marginBottom: 12 }}>
        <table style={{ width: "100%", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={{ textAlign: "left", padding: 6 }}>API trả về</th>
              <th style={{ textAlign: "left", padding: 6 }}>Template viết</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{ items: [...] }`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#each items}}`}</Text>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{ data: [...] }`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#each data}}`}</Text>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{ data: { items, totalCount } }`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#each data.items}}`}</Text> +{" "}
                <Text code>{`{{data.totalCount}}`}</Text>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`{ result: { list: [...] } }`}</Text>
              </td>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#each result.list}}`}</Text>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 6 }}>
                <Text code>{`[...]`}</Text>{" "}
                <Text type="secondary">(mảng thuần)</Text>
              </td>
              <td style={{ padding: 6 }}>
                <Text code>{`{{#each items}}`}</Text>{" "}
                <Text type="secondary">
                  (trường hợp duy nhất bị wrap vì context root phải là object)
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Collapse accordion>
        {DATA_SOURCE_DOCS.filter((d) => d.code).map((d) => (
          <Panel
            key={d.code}
            header={
              <span>
                <Tag color="blue">{d.code}</Tag> <Text strong>{d.label}</Text>
              </span>
            }
          >
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              {d.description}
            </Paragraph>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Đường dẫn API gợi ý:</Text>{" "}
              <Text code copyable>
                {d.apiPath}
              </Text>
            </div>

            <div style={{ marginBottom: 8 }}>
              <Text strong>JSON trả về (shape):</Text>
              <CodeBlock>
                {JSON.stringify(d.sampleResponse, null, 2)}
              </CodeBlock>
            </div>

            <div>
              <Text strong>Ví dụ template:</Text>
              <CodeBlock>{d.templateExample}</CodeBlock>
            </div>
          </Panel>
        ))}
      </Collapse>

      <Title level={5} style={{ marginTop: 24 }}>
        5. Lưu ý
      </Title>
      <ul style={{ paddingLeft: 20 }}>
        <li>
          Mã khối (<Text code>Code</Text>) phải duy nhất, viết HOA, dùng dấu
          gạch dưới. VD: <Text code>HOME_HERO</Text>.
        </li>
        <li>
          Thứ tự (<Text code>SortOrder</Text>) nhỏ hiện trên, lớn hiện dưới. Để
          chừa khoảng cho block xen giữa (10, 20, 30...).
        </li>
        <li>
          Có thể paste trực tiếp đoạn JSX copy từ React component (giữ nguyên{" "}
          <Text code>className</Text>) — engine tự convert sang HTML hợp lệ.
        </li>
        <li>
          Body được render bằng <Text code>dangerouslySetInnerHTML</Text> — chỉ
          dán code đã review, tránh <Text code>&lt;script&gt;</Text> không tin
          cậy. Biến <Text code>{`{{var}}`}</Text> đã được auto-escape HTML.
        </li>
        <li>
          Self-closing tag không hợp lệ trong HTML (<Text code>&lt;div/&gt;</Text>
          ) được engine tự sửa thành <Text code>&lt;div&gt;&lt;/div&gt;</Text>.
        </li>
        <li>
          Nếu API tạm chưa có, hệ thống dùng mock từ{" "}
          <Text code>dataSourceRegistry</Text>; khi backend xong chỉ cần đổi
          function tương ứng.
        </li>
      </ul>
    </Drawer>
  );
}
