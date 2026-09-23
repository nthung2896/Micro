"use client";

import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TestRabbitMQPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSendMessage = async () => {
    if (!message) {
      toast.error("Vui lòng nhập nội dung tin nhắn!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/TestRabbitMQ/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "Gửi thành công!");
        setResponse(data);
        setMessage(""); // Reset input
      } else {
        toast.error("Lỗi khi gửi lên API!");
        setResponse(data);
      }
    } catch (error: any) {
      toast.error("Lỗi mạng: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto mt-10 bg-white rounded-lg shadow-md text-gray-800">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Test RabbitMQ Integration</h1>
      
      <p className="mb-4 text-sm text-gray-600">
        Nhập nội dung vào ô bên dưới, API sẽ đóng gói dữ liệu và bắn lên <b>audit_logs_queue</b> trong RabbitMQ.
        Mở Terminal của project <code>Hinet.Worker.RabbitMQ</code> để xem Consumer bắt được tin nhắn.
      </p>

      <div className="flex flex-col gap-4">
        <textarea
          className="border border-gray-300 rounded p-3 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tin nhắn test (VD: Xin chào, đây là tin nhắn số 1...)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Đang gửi..." : "Gửi lên RabbitMQ"}
        </button>

        {response && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-bold text-sm mb-2">Kết quả từ API:</h3>
            <pre className="text-xs overflow-x-auto text-green-700">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
