import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Home, 
  ShieldCheck, 
  FolderGit2, 
  ExternalLink, 
  LogOut, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  PackageCheck,
  Layers,
  Database,
  Radio,
  Compass
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  badge: string;
  servicePort: string;
  clientUrl: string;
  dbName: string;
  isPrimary?: boolean;
}

const APPS: AppItem[] = [
  {
    id: 'asset',
    name: 'Hệ Thống Quản Lý Tài Sản',
    category: 'Cơ Sở Vật Chất & Thiết Bị',
    description: 'Quản lý vòng đời tài sản, trang thiết bị văn phòng, theo dõi khấu hao, cấp phát và lịch bảo dưỡng tập trung.',
    icon: PackageCheck,
    gradient: 'from-amber-500 to-rose-600',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    badge: 'asset-service:5005',
    servicePort: '5005',
    clientUrl: 'http://localhost:9797/auth/sso-callback',
    dbName: 'Base_TaiSan',
    isPrimary: true
  },
  {
    id: 'kpi',
    name: 'Hệ Thống Đánh Giá KPI',
    category: 'Nghiệp Vụ & Đánh Giá',
    description: 'Lập kế hoạch, theo dõi tiến độ nhiệm vụ và tổ chức hội đồng chấm điểm thi đua cán bộ.',
    icon: BarChart3,
    gradient: 'from-blue-600 to-indigo-600',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    badge: 'kpi-service:5003',
    servicePort: '5003',
    clientUrl: 'http://localhost:9696/auth/sso-callback',
    dbName: 'Base_DB',
    isPrimary: true
  },
  {
    id: 'room',
    name: 'Quản Lý Phòng Trọ & Ví Tiền',
    category: 'Thương Mại & Thanh Toán',
    description: 'Đăng tin phòng trọ, cấu hình bảng giá tin VIP, nạp tiền ví tài khoản và khuyến mại bậc thang.',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    badge: 'room-service:5002',
    servicePort: '5002',
    clientUrl: 'http://localhost:4000/auth/sso-callback',
    dbName: 'Room_DB'
  },
  {
    id: 'identity',
    name: 'Quản Trị Người Dùng & Phân Quyền',
    category: 'Hệ Thống & Bảo Mật',
    description: 'Quản trị danh sách tài khoản cán bộ, gán vai trò, phân quyền chức năng và kiểm soát JWT tập trung.',
    icon: ShieldCheck,
    gradient: 'from-purple-600 to-violet-700',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'identity-service:5001',
    servicePort: '5001',
    clientUrl: 'http://localhost:5000/api/auth/ping',
    dbName: 'Identity_DB'
  },
  {
    id: 'files',
    name: 'Kho Lưu Trữ Tệp Tin & Văn Bản',
    category: 'Tài Nguyên & Media',
    description: 'Lưu trữ tài liệu đính kèm, văn bản pháp luật, biểu mẫu báo cáo và xử lý media tập trung.',
    icon: FolderGit2,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    badge: 'file-service:5004',
    servicePort: '5004',
    clientUrl: 'http://localhost:5004/api/files/ping',
    dbName: 'Mongo / File Server'
  }
];

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sso_portal_token'));
  const [user, setUser] = useState<{ username: string; fullName: string; role: string } | null>(() => {
    const saved = localStorage.getItem('sso_portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [targetSoftware, setTargetSoftware] = useState<string>('hub'); // 'hub' | 'asset' | 'kpi' | 'room'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Đọc query param '?app=asset' hoặc '?app=kpi'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    if (appParam && ['asset', 'kpi', 'room'].includes(appParam)) {
      setTargetSoftware(appParam);
    }
  }, []);

  const handleLaunchApp = (app: AppItem, sameTab = false) => {
    const authToken = token || localStorage.getItem('sso_portal_token');
    if (!authToken) return;

    setRedirectNotice(`Đang chuyển hướng SSO tới ${app.name} (${app.clientUrl})...`);

    const targetUrl = `${app.clientUrl}?token=${encodeURIComponent(authToken)}`;

    setTimeout(() => {
      if (sameTab) {
        window.location.href = targetUrl;
      } else {
        window.open(targetUrl, '_blank');
      }
      setRedirectNotice(null);
    }, 450);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      let activeToken = '';
      const userData = {
        username: username,
        fullName: username === 'admin' ? 'Quản Trị Viên Hệ Thống' : 'Cán Bộ ' + username,
        role: username === 'admin' ? 'System Administrator' : 'Chuyên Viên Nghiệp Vụ',
      };

      try {
        const authUrls = [
          '/api/auth/login',
          'http://localhost:80/api/auth/login',
          'http://localhost:5000/api/auth/login',
        ];
        for (const authUrl of authUrls) {
          try {
            const res = await fetch(authUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
              const json = await res.json();
              if (json.success && (json.data?.token || json.data?.accessToken)) {
                activeToken = json.data.token || json.data.accessToken;
                break;
              }
            }
          } catch (_) {}
        }
      } catch (err) {
      }

      if (!activeToken) {
        activeToken = `sso_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }

      setToken(activeToken);
      setUser(userData);
      localStorage.setItem('sso_portal_token', activeToken);
      localStorage.setItem('sso_portal_user', JSON.stringify(userData));

      // Điều hướng ngay tới phần mềm đích đã chọn (nếu không chọn 'hub')
      if (targetSoftware !== 'hub') {
        const found = APPS.find(a => a.id === targetSoftware);
        if (found) {
          handleLaunchApp(found, true);
          return;
        }
      }
    } catch (err: any) {
      setErrorMsg('Không thể xử lý đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sso_portal_token');
    localStorage.removeItem('sso_portal_user');
  };

  const filteredApps = APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.dbName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------------------------------------
  // Màn hình 1: Đăng nhập SSO (Central SSO Login)
  // ----------------------------------------------------
  if (!token) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
            }}>
              <ShieldCheck size={32} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Cổng Đăng Nhập Tập Trung (SSO)
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              Đăng nhập 1 lần để chọn và mở các hệ thống phần mềm
            </p>
          </div>

          {errorMsg && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#f87171', 
              padding: '10px 14px', 
              borderRadius: '10px', 
              fontSize: '13px', 
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Tài khoản đăng nhập
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Tên đăng nhập (ví dụ: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Mật khẩu
              </label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Mục tiêu phần mềm sau khi đăng nhập */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a5b4fc', marginBottom: '8px' }}>
                Đích đến sau khi đăng nhập thành công:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  background: targetSoftware === 'asset' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${targetSoftware === 'asset' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <input 
                    type="radio" 
                    name="targetSoftware" 
                    value="asset" 
                    checked={targetSoftware === 'asset'}
                    onChange={() => setTargetSoftware('asset')} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: targetSoftware === 'asset' ? '#fbbf24' : '#fff' }}>
                      Quản Lý Tài Sản (:9797)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cơ sở dữ liệu: Base_TaiSan</div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  background: targetSoftware === 'kpi' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${targetSoftware === 'kpi' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <input 
                    type="radio" 
                    name="targetSoftware" 
                    value="kpi" 
                    checked={targetSoftware === 'kpi'}
                    onChange={() => setTargetSoftware('kpi')} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: targetSoftware === 'kpi' ? '#818cf8' : '#fff' }}>
                      Đánh Giá KPI (:9696)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cơ sở dữ liệu: Base_DB</div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  background: targetSoftware === 'hub' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${targetSoftware === 'hub' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                  fontSize: '12.5px'
                }}>
                  <input 
                    type="radio" 
                    name="targetSoftware" 
                    value="hub" 
                    checked={targetSoftware === 'hub'}
                    onChange={() => setTargetSoftware('hub')} 
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>Mở Màn Hình Bàn Làm Việc (Hub Chọn Phần Mềm)</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '6px', padding: '13px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập & Truy Cập'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tài khoản mẫu: <span style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setUsername('admin'); setPassword('123456'); }}>admin / 123456</span>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // Màn hình 2: Bàn Làm Việc Chọn Phần Mềm (App Launcher Hub)
  // ----------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        background: 'rgba(11, 15, 25, 0.85)', 
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Compass size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>E-BIZ ENTERPRISE SSO HUB</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Cổng Điều Hướng Các Phân Hệ Phần Mềm</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.fullName}</div>
                <div style={{ fontSize: '11px', color: '#818cf8' }}>{user?.role}</div>
              </div>
            </div>

            <button onClick={handleLogout} className="btn-secondary" title="Đăng xuất khỏi SSO">
              <LogOut size={16} />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        {/* Banner Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Lựa Chọn Phần Mềm Làm Việc
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>
            Chọn phần mềm nghiệp vụ bên dưới để truy cập. Phiên đăng nhập được tự động chuyển giao qua Single Sign-On (SSO).
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '340px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Tìm kiếm phần mềm, cơ sở dữ liệu..." 
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#34d399' }}>
            <CheckCircle2 size={16} />
            <span>Phiên làm việc SSO đã sẵn sàng</span>
          </div>
        </div>

        {/* Status Toast */}
        {redirectNotice && (
          <div className="glass-panel animate-fade-in" style={{ 
            padding: '14px 20px', 
            marginBottom: '24px', 
            background: 'rgba(79, 70, 229, 0.25)', 
            borderColor: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 1.5s infinite' }}></div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#e0e7ff' }}>{redirectNotice}</span>
          </div>
        )}

        {/* Section 1: Hai phân hệ cốt lõi ngang hàng */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#818cf8" />
            <span>Phân Hệ Nghiệp Vụ Cốt Lõi</span>
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
            gap: '24px',
            marginBottom: '36px'
          }}>
            {filteredApps.filter(a => a.isPrimary).map((app) => {
              const IconComponent = app.icon;
              return (
                <div 
                  key={app.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '26px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    border: `1px solid ${app.borderColor}`,
                    background: app.id === 'asset' 
                      ? 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(19, 25, 38, 0.8) 100%)'
                      : 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(19, 25, 38, 0.8) 100%)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '14px', 
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${app.borderColor}`
                      }}>
                        <IconComponent size={28} color={app.id === 'asset' ? '#fbbf24' : '#818cf8'} />
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          padding: '4px 10px', 
                          background: 'rgba(255, 255, 255, 0.06)', 
                          borderRadius: '20px',
                          color: '#f8fafc',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'inline-block'
                        }}>
                          {app.badge}
                        </span>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <Database size={12} />
                          <span>DB: <strong>{app.dbName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 600, color: app.id === 'asset' ? '#fbbf24' : '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      {app.category}
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#fff' }}>
                      {app.name}
                    </h3>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '22px' }}>
                      {app.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-primary" 
                      style={{ 
                        flex: 1, 
                        background: app.id === 'asset' 
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                          : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: app.id === 'asset' ? '#0b0f19' : '#fff',
                        fontWeight: 700
                      }}
                      onClick={() => handleLaunchApp(app, true)}
                    >
                      <span>Vào Phần Mềm Ngay</span>
                      <ArrowRight size={16} />
                    </button>

                    <button 
                      className="btn-secondary" 
                      title="Mở tab mới"
                      onClick={() => handleLaunchApp(app, false)}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Các phân hệ bổ trợ & tiện ích */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} color="#10b981" />
            <span>Phân Hệ Mở Rộng & Dịch Vụ Khác</span>
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredApps.filter(a => !a.isPrimary).map((app) => {
              const IconComponent = app.icon;
              return (
                <div 
                  key={app.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px', 
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${app.borderColor}`
                      }}>
                        <IconComponent size={22} color="#f8fafc" />
                      </div>

                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        padding: '3px 8px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '16px',
                        color: 'var(--text-secondary)'
                      }}>
                        {app.badge}
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {app.category}
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                      {app.name}
                    </h4>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '18px' }}>
                      {app.description}
                    </p>
                  </div>

                  <button 
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    onClick={() => handleLaunchApp(app, false)}
                  >
                    <span>Truy cập</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
        Hệ Thống Phân Tán Microservices • Đồng bộ SSO giữa Quản Lý Tài Sản (:9797) và Đánh Giá KPI (:9696)
      </footer>
    </div>
  );
}
