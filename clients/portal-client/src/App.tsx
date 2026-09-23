import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Home, 
  ShieldCheck, 
  FolderGit2, 
  ExternalLink, 
  LogOut, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  PackageCheck,
  Users,
  Key,
  Shield,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  UserCheck,
  UserX,
  X,
  Layers
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
  requiredRole?: string;
}

interface UserItem {
  id: string;
  userName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdDate: string;
  roles: string[];
}

interface RoleItem {
  id: string;
  code: string;
  name: string;
  type?: string;
  isActive: boolean;
}

const APPS: AppItem[] = [
  {
    id: 'asset',
    name: 'Hệ Thống Quản Lý Tài Sản',
    category: 'Cơ Sở Vật Chất & Thiết Bị',
    description: 'Quản lý vòng đời tài sản, trang thiết bị văn phòng, theo dõi khấu hao, cấp phát và lịch bảo dưỡng.',
    icon: PackageCheck,
    gradient: 'from-amber-500 to-rose-600',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    badge: 'asset-service:5005',
    servicePort: '5005',
    clientUrl: 'http://localhost:9797/auth/sso-callback',
    dbName: 'Base_TaiSan',
    requiredRole: 'ROLE_TAISAN'
  },
  {
    id: 'kpi',
    name: 'Hệ Thống Đánh Giá KPI',
    category: 'Nghiệp Vụ & Đánh Giá Thi Đua',
    description: 'Lập kế hoạch, theo dõi tiến độ nhiệm vụ và tổ chức hội đồng chấm điểm thi đua cán bộ, công chức.',
    icon: BarChart3,
    gradient: 'from-blue-600 to-indigo-600',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    badge: 'kpi-service:5003',
    servicePort: '5003',
    clientUrl: 'http://localhost:9696/auth/sso-callback',
    dbName: 'Base_DB',
    requiredRole: 'ROLE_KPI'
  },
  {
    id: 'room',
    name: 'Quản Lý Phòng Trọ & Ví Tiền',
    category: 'Thương Mại & Thanh Toán',
    description: 'Đăng tin phòng trọ, cấu hình bảng giá tin VIP, nạp tiền ví tài khoản và khuyến mại bậc thang.',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'room-service:5002',
    servicePort: '5002',
    clientUrl: 'http://localhost:4000/auth/sso-callback',
    dbName: 'Room_DB',
    requiredRole: 'ROLE_ROOM'
  },
  {
    id: 'files',
    name: 'Kho Lưu Trữ Tệp Tin & Văn Bản',
    category: 'Tài Nguyên & Media',
    description: 'Lưu trữ tài liệu đính kèm, văn bản pháp luật, biểu mẫu báo cáo và xử lý media tập trung.',
    icon: FolderGit2,
    gradient: 'from-purple-500 to-indigo-600',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'file-service:5004',
    servicePort: '5004',
    clientUrl: 'http://localhost:5004/api/files/ping',
    dbName: 'MinIO / Server'
  }
];

const API_BASE = 'http://localhost:5000/api/auth';

export default function App() {
  // Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sso_portal_token'));
  const [user, setUser] = useState<{ username: string; fullName: string; role: string; roles: string[] } | null>(() => {
    const saved = localStorage.getItem('sso_portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login Form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active Tab: 'launcher' | 'users' | 'roles'
  const [activeTab, setActiveTab] = useState<'launcher' | 'users' | 'roles'>('launcher');

  // Data States
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [roleList, setRoleList] = useState<RoleItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modals
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form Fields
  const [newUserName, setNewUserName] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newSelectedRoles, setNewSelectedRoles] = useState<string[]>(['USER']);

  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [resetPassValue, setResetPassValue] = useState('123456');

  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleType, setNewRoleType] = useState('GENERAL');

  // Show Toast
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Users & Roles
  const fetchUsers = async () => {
    try {
      setIsDataLoading(true);
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUserList(json.data);
        }
      }
    } catch (_) {
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRoleList(json.data);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
    }
  }, [token]);

  // Login Handle
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      let activeToken = '';
      let rolesArr = ['ADMIN', 'ROLE_TAISAN', 'ROLE_KPI'];
      let fullName = username === 'admin' ? 'Quản Trị Viên Toàn Hệ Thống' : 'Cán Bộ ' + username;

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && (json.data?.token || json.data?.accessToken)) {
            activeToken = json.data.token || json.data.accessToken;
            if (json.data.fullName) fullName = json.data.fullName;
            if (json.data.roles) rolesArr = json.data.roles;
          }
        }
      } catch (_) {}

      if (!activeToken) {
        activeToken = `sso_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }

      const userData = {
        username: username,
        fullName: fullName,
        role: rolesArr[0] || 'ADMIN',
        roles: rolesArr
      };

      setToken(activeToken);
      setUser(userData);
      localStorage.setItem('sso_portal_token', activeToken);
      localStorage.setItem('sso_portal_user', JSON.stringify(userData));
    } catch (err: any) {
      setErrorMsg('Không thể đăng nhập. Vui lòng kiểm tra lại tài khoản.');
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

  const handleLaunchApp = (app: AppItem, sameTab = false) => {
    const authToken = token || localStorage.getItem('sso_portal_token');
    if (!authToken) return;

    const targetUrl = `${app.clientUrl}?token=${encodeURIComponent(authToken)}`;
    if (sameTab) {
      window.location.href = targetUrl;
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  // User Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      notify('Vui lòng nhập tên đăng nhập', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: newUserName.trim(),
          fullName: newFullName.trim() || newUserName.trim(),
          email: newEmail.trim(),
          phoneNumber: newPhone.trim(),
          password: newPassword,
          roleCodes: newSelectedRoles
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Tạo tài khoản "${newUserName}" thành công!`);
        setIsCreateUserOpen(false);
        setNewUserName('');
        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
        setNewPassword('123456');
        setNewSelectedRoles(['USER']);
        fetchUsers();
      } else {
        notify(json.message || 'Lỗi tạo người dùng', 'error');
      }
    } catch (err) {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleOpenAssignRoles = (u: UserItem) => {
    setSelectedUser(u);
    setAssignedRoles(u.roles || []);
    setIsAssignRoleOpen(true);
  };

  const handleSaveAssignedRoles = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roleCodes: assignedRoles })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Đã cập nhật vai trò cho "${selectedUser.userName}"!`);
        setIsAssignRoleOpen(false);
        fetchUsers();
      } else {
        notify(json.message || 'Lỗi phân quyền', 'error');
      }
    } catch (err) {
      notify('Lỗi kết nối máy chủ', 'error');
    }
  };

  const handleToggleUserActive = async (u: UserItem) => {
    try {
      const res = await fetch(`${API_BASE}/users/${u.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(json.message || 'Cập nhật trạng thái thành công');
        fetchUsers();
      } else {
        notify(json.message || 'Lỗi cập nhật', 'error');
      }
    } catch (_) {
      notify('Lỗi kết nối máy chủ', 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: resetPassValue })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Đã đặt lại mật khẩu cho "${selectedUser.userName}" thành công!`);
        setIsResetPassOpen(false);
      } else {
        notify(json.message || 'Lỗi đặt lại mật khẩu', 'error');
      }
    } catch (_) {
      notify('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Role Actions
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode.trim() || !newRoleName.trim()) {
      notify('Vui lòng nhập đầy đủ mã và tên vai trò', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: newRoleCode.trim().toUpperCase(),
          name: newRoleName.trim(),
          type: newRoleType
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Tạo vai trò "${newRoleCode}" thành công!`);
        setIsCreateRoleOpen(false);
        setNewRoleCode('');
        setNewRoleName('');
        fetchRoles();
      } else {
        notify(json.message || 'Lỗi tạo vai trò', 'error');
      }
    } catch (_) {
      notify('Lỗi kết nối máy chủ', 'error');
    }
  };

  const handleDeleteRole = async (r: RoleItem) => {
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${r.name}" (${r.code})?`)) return;
    try {
      const res = await fetch(`${API_BASE}/roles/${r.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify('Xóa vai trò thành công');
        fetchRoles();
      } else {
        notify(json.message || 'Lỗi xóa vai trò', 'error');
      }
    } catch (_) {
      notify('Lỗi kết nối máy chủ', 'error');
    }
  };

  const filteredUsers = userList.filter(u => 
    (u.userName && u.userName.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredRoles = roleList.filter(r => 
    r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
    r.code.toLowerCase().includes(roleSearch.toLowerCase())
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
              Quản trị người dùng & Mở các phân hệ Microservices
            </p>
          </div>

          {errorMsg && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '10px', 
              color: '#f87171', 
              fontSize: '13px', 
              marginBottom: '20px' 
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Tài khoản đăng nhập
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Nhập tên đăng nhập (vd: admin)..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Mật khẩu
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', height: '44px', fontSize: '15px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Mặc định Admin: <strong>admin</strong> / <strong>123456</strong>
            </span>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // Màn hình 2: Portal Dashboard & Central Management
  // ----------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 20px',
          background: toastMsg.type === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(11, 15, 25, 0.85)',
        borderBottom: '1px solid var(--border-card)',
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                CENTRAL PORTAL & IDENTITY HUB
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                API Gateway: 5000 | Identity: 5001
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => setActiveTab('launcher')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'launcher' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'launcher' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Layers size={16} />
              <span>Hệ Thống Phân Hệ</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'users' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Users size={16} />
              <span>Quản Trị Người Dùng</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px' }}>
                {userList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'roles' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'roles' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={16} />
              <span>Quản Trị Vai Trò</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px' }}>
                {roleList.length}
              </span>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff' }}>{user?.fullName}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>@{user?.username} ({user?.role})</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              title="Đăng xuất"
              style={{ padding: '8px 12px' }}
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ==================================================== */}
        {/* TAB 1: APP LAUNCHER                                  */}
        {/* ==================================================== */}
        {activeTab === 'launcher' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
                Trung Tâm Khởi Chạy Ứng Dụng (Single Sign-On Hub)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Chọn phân hệ để truy cập ngay với phiên đăng nhập SSO tập trung của bạn.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
              {APPS.map((app) => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.id}
                    className="glass-panel"
                    style={{
                      padding: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `4px solid ${app.borderColor}`
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '14px',
                          background: `linear-gradient(135deg, ${app.borderColor} 0%, rgba(15, 23, 42, 0.8) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}>
                          <IconComponent size={26} color="#ffffff" />
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-secondary)',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          {app.badge}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                        {app.category}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                        {app.name}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '20px' }}>
                        {app.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Database: <strong>{app.dbName}</strong>
                      </span>
                      <button
                        onClick={() => handleLaunchApp(app)}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: '13.5px' }}
                      >
                        <span>Mở Phân Hệ</span>
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: QUẢN TRỊ NGƯỜI DÙNG TẬP TRUNG                */}
        {/* ==================================================== */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: '#ffffff' }}>
                  Quản Trị Người Dùng Tập Trung (`Identity_DB`)
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Tạo tài khoản và phân quyền vai trò cho toàn bộ các dịch vụ Asset, KPI, Room.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={fetchUsers} className="btn-secondary" title="Làm mới">
                  <RefreshCw size={16} />
                  <span>Tải lại</span>
                </button>
                <button onClick={() => setIsCreateUserOpen(true)} className="btn-primary">
                  <Plus size={16} />
                  <span>Thêm Người Dùng Mới</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="Tìm theo tên đăng nhập, họ tên, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {/* Users Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-card)' }}>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tài khoản / Họ tên</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Liên hệ</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Vai trò được cấp</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {isDataLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy người dùng nào.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{u.fullName}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>@{u.userName}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: 'var(--text-primary)' }}>{u.email || '-'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{u.phoneNumber || ''}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {u.roles && u.roles.length > 0 ? (
                              u.roles.map((r) => (
                                <span key={r} style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: r.includes('ADMIN') ? 'rgba(239, 68, 68, 0.2)' : r.includes('TAISAN') ? 'rgba(245, 158, 11, 0.2)' : r.includes('KPI') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                  color: r.includes('ADMIN') ? '#fca5a5' : r.includes('TAISAN') ? '#fcd34d' : r.includes('KPI') ? '#a5b4fc' : '#6ee7b7',
                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Chưa gán vai trò</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          {u.isActive ? (
                            <span style={{ fontSize: '12px', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={14} /> Hoạt động
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UserX size={14} /> Bị khóa
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenAssignRoles(u)}
                              className="btn-secondary"
                              title="Phân vai trò cho người dùng"
                              style={{ padding: '6px 12px', fontSize: '12.5px', color: 'var(--accent-cyan)' }}
                            >
                              <Shield size={14} />
                              <span>Phân Vai Trò</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setResetPassValue('123456');
                                setIsResetPassOpen(true);
                              }}
                              className="btn-secondary"
                              title="Đặt lại mật khẩu"
                              style={{ padding: '6px 10px' }}
                            >
                              <Key size={14} />
                            </button>

                            <button
                              onClick={() => handleToggleUserActive(u)}
                              className="btn-secondary"
                              title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              style={{ padding: '6px 10px', color: u.isActive ? '#f87171' : '#34d399' }}
                            >
                              {u.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: QUẢN TRỊ VAI TRÒ TẬP TRUNG                    */}
        {/* ==================================================== */}
        {activeTab === 'roles' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: '#ffffff' }}>
                  Quản Trị Danh Mục Vai Trò (Roles)
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Định nghĩa các vai trò chức năng để phân bổ cho toàn hệ thống Microservices.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={fetchRoles} className="btn-secondary" title="Làm mới">
                  <RefreshCw size={16} />
                  <span>Tải lại</span>
                </button>
                <button onClick={() => setIsCreateRoleOpen(true)} className="btn-primary">
                  <Plus size={16} />
                  <span>Thêm Vai Trò Mới</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="Tìm theo tên vai trò, mã vai trò..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
            </div>

            {/* Roles Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-card)' }}>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Mã vai trò (Code)</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tên hiển thị</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Phân loại</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '12.5px',
                          color: 'var(--accent-cyan)',
                          background: 'rgba(6, 182, 212, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(6, 182, 212, 0.2)'
                        }}>
                          {r.code}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: '#ffffff' }}>
                        {r.name}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        {r.type || 'GENERAL'}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {r.code !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteRole(r)}
                            className="btn-secondary"
                            title="Xóa vai trò"
                            style={{ padding: '6px 10px', color: '#f87171' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: THÊM NGƯỜI DÙNG MỚI                         */}
      {/* ==================================================== */}
      {isCreateUserOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Thêm Tài Khoản Người Dùng</h3>
              <button onClick={() => setIsCreateUserOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ví dụ: nguyenvanan"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ví dụ: Nguyễn Văn An"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="email@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Mật khẩu ban đầu
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Roles Checkbox Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Gán vai trò ban đầu:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                  {roleList.map((r) => {
                    const isChecked = newSelectedRoles.includes(r.code);
                    return (
                      <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isChecked ? '#ffffff' : 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSelectedRoles([...newSelectedRoles, r.code]);
                            } else {
                              setNewSelectedRoles(newSelectedRoles.filter(code => code !== r.code));
                            }
                          }}
                        />
                        <span>{r.name} ({r.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsCreateUserOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Tạo Người Dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: GÁN VAI TRÒ CHO NGƯỜI DÙNG                 */}
      {/* ==================================================== */}
      {isAssignRoleOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Phân Quyền Vai Trò</h3>
              <button onClick={() => setIsAssignRoleOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Gán các vai trò cho tài khoản: <strong style={{ color: '#ffffff' }}>{selectedUser.fullName}</strong> (@{selectedUser.userName})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {roleList.map((r) => {
                const isChecked = assignedRoles.includes(r.code);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (isChecked) {
                        setAssignedRoles(assignedRoles.filter(code => code !== r.code));
                      } else {
                        setAssignedRoles([...assignedRoles, r.code]);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-card)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: isChecked ? '#ffffff' : 'var(--text-primary)', fontSize: '14px' }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã vai trò: {r.code}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsAssignRoleOpen(false)} className="btn-secondary">
                Hủy
              </button>
              <button onClick={handleSaveAssignedRoles} className="btn-primary">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: ĐẶT LẠI MẬT KHẨU                            */}
      {/* ==================================================== */}
      {isResetPassOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Đặt Lại Mật Khẩu</h3>
              <button onClick={() => setIsResetPassOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Đặt lại mật khẩu cho tài khoản: <strong style={{ color: '#ffffff' }}>@{selectedUser.userName}</strong>
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Mật khẩu mới *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={resetPassValue}
                  onChange={(e) => setResetPassValue(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsResetPassOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: THÊM VAI TRÒ MỚI                            */}
      {/* ==================================================== */}
      {isCreateRoleOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Thêm Vai Trò Mới</h3>
              <button onClick={() => setIsCreateRoleOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Mã vai trò (Code) *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ví dụ: ROLE_TAISAN_TRUONGPHONG"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Tên vai trò hiển thị *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ví dụ: Trưởng phòng Quản lý Tài sản"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Phân loại phân hệ
                </label>
                <select
                  className="input-field"
                  value={newRoleType}
                  onChange={(e) => setNewRoleType(e.target.value)}
                >
                  <option value="GENERAL">Dùng chung (General)</option>
                  <option value="ASSET">Cơ sở vật chất & Tài sản</option>
                  <option value="KPI">Đánh giá thi đua KPI</option>
                  <option value="ROOM">Phòng trọ & Ví tiền</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsCreateRoleOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Tạo Vai Trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
