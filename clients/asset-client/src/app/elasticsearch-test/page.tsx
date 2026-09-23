'use client';

import React, { useState } from 'react';

export default function ElasticsearchTestPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Thay đổi port này nếu API của bạn chạy ở port khác
  const API_BASE_URL = 'http://localhost:5111/api/ElasticsearchTest';

  const handleInsertSample = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/insert-sample`, {
        method: 'POST',
      });
      const data = await res.json();
      setMessage(`Insert result: ${JSON.stringify(data)}`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query) {
      setMessage('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    setLoading(true);
    setMessage('');
    setResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Elasticsearch Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>1. Insert Sample Data</h3>
        <p>Nhấn nút bên dưới để chèn một dữ liệu mẫu vào Elasticsearch.</p>
        <button 
          onClick={handleInsertSample}
          disabled={loading}
          style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Đang xử lý...' : 'Thêm dữ liệu mẫu'}
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>2. Search Data</h3>
        <p>Tìm kiếm dữ liệu trong Elasticsearch (tìm theo Title hoặc Content).</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khóa (ví dụ: Test)..."
            style={{ padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {results && (
        <div style={{ marginTop: '20px' }}>
          <h3>Kết quả tìm kiếm:</h3>
          {results.length === 0 ? (
            <p>Không tìm thấy kết quả nào.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {results.map((item: any, index: number) => (
                <li key={index} style={{ padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px' }}>
                  <strong>ID:</strong> {item.id} <br/>
                  <strong>Title:</strong> {item.title} <br/>
                  <strong>Content:</strong> {item.content} <br/>
                  <strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
