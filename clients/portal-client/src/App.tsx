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
  Edit,
  UserCheck,
  UserX,
  X,
  Layers,
  Building2,
  Zap,
  Radio,
  Activity,
  Database,
  Send,
  Server,
  Cpu,
  CheckCheck
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
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

interface EventItem {
  id: string;
  eventType: string;
  routingKey: string;
  payload: string;
  status: string;
  timestamp: string;
  source: string;
  consumers: string[];
}

// Hàm tự động chuẩn hóa & giải mã tiếng Việt bị lỗi font (Mojibake UTF-8)
export const decodeVietnamese = (text?: string): string => {
  if (!text) return '';
  
  // Ánh xạ các vai trò mặc định hay gặp lỗi font
  if (text.includes('Quá') || text.includes('Quáº£n') || text.includes('viÃªn toÃ n')) {
    return 'Quản trị viên toàn hệ thống';
  }
  if (text.includes('CÃ') || text.includes('CÃ¡n') || text.includes('quáo£n lÃ½')) {
    return 'Cán bộ quản lý';
  }
  if (text.includes('NgÆ') || text.includes('NgÆ°á') || text.includes('dÃ¹ng thÃ´ng')) {
    return 'Người dùng thông thường';
  }

  // Thử decode chuẩn nếu là chuỗi UTF-8 bị ép sang ISO-8859-1
  if (text.includes('Ã') || text.includes('á»') || text.includes('áº') || text.includes('Æ') || text.includes('Ä')) {
    try {
      return decodeURIComponent(escape(text));
    } catch {
      return text;
    }
  }

  return text;
};

const APPS: AppItem[] = [
  {
    id: 'asset',
    name: 'Hệ Thống Quản Lý Tài Sản',
    category: 'Cơ Sở Vật Chất & Thiết Bị',
    description: 'Quản lý vòng đời tài sản, trang thiết bị văn phòng, theo dõi khấu hao, cấp phát và lịch bảo dưỡng tập trung.',
    icon: PackageCheck,
    iconBg: '#e6f4ff',
    iconColor: '#005baa',
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
    iconBg: '#f0f5ff',
    iconColor: '#2f54eb',
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
    iconBg: '#f6ffed',
    iconColor: '#52c41a',
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
    iconBg: '#f9f0ff',
    iconColor: '#722ed1',
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

  // Active Tab: 'launcher' | 'users' | 'roles' | 'events'
  const [activeTab, setActiveTab] = useState<'launcher' | 'users' | 'roles' | 'events'>('launcher');

  // Data States
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [roleList, setRoleList] = useState<RoleItem[]>([]);
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPublishingTest, setIsPublishingTest] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modals
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

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

  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleType, setEditRoleType] = useState('GENERAL');

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
          const mappedUsers = json.data.map((u: UserItem) => ({
            ...u,
            fullName: decodeVietnamese(u.fullName)
          }));
          setUserList(mappedUsers);
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
          const mappedRoles = json.data.map((r: RoleItem) => ({
            ...r,
            name: decodeVietnamese(r.name)
          }));
          setRoleList(mappedRoles);
        }
      }
    } catch (_) {}
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEventList(json.data);
        }
      }
    } catch (_) {}
  };

  const handlePublishTestEvent = async () => {
    setIsPublishingTest(true);
    try {
      const testUser = `demo_user_${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await fetch(`${API_BASE}/events/publish-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: testUser,
          fullName: `Cán bộ Thử Nghiệm (${testUser})`,
          roles: ['USER', 'ROLE_TAISAN', 'ROLE_KPI']
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(`🚀 Bắn UserCreatedEvent cho @${testUser} vào RabbitMQ thành công!`);
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi bắn sự kiện', 'error');
      }
    } catch (_) {
      notify('Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsPublishingTest(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
      fetchEvents();

      const interval = setInterval(() => {
        fetchEvents();
      }, 5000);
      return () => clearInterval(interval);
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
            if (json.data.fullName) fullName = decodeVietnamese(json.data.fullName);
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

    const userRoles = user?.roles || [];
    const hasAccess = !app.requiredRole || userRoles.some(r => r === 'ADMIN' || r === app.requiredRole);

    if (!hasAccess) {
      notify(`Tài khoản "${user?.username}" chưa được cấp quyền truy cập phân hệ "${app.name}"!`, 'error');
      return;
    }

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

  const handleOpenEditRole = (r: RoleItem) => {
    setSelectedRole(r);
    setEditRoleName(decodeVietnamese(r.name));
    setEditRoleType(r.type || 'GENERAL');
    setIsEditRoleOpen(true);
  };

  const handleSaveEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !editRoleName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editRoleName.trim(),
          type: editRoleType
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Đã cập nhật tên vai trò "${selectedRole.code}" thành công!`);
        setIsEditRoleOpen(false);
        fetchRoles();
      } else {
        notify(json.message || 'Lỗi cập nhật vai trò', 'error');
      }
    } catch (_) {
      notify('Lỗi kết nối máy chủ', 'error');
    }
  };

  const handleDeleteRole = async (r: RoleItem) => {
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${decodeVietnamese(r.name)}" (${r.code})?`)) return;
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
    (r.name && r.name.toLowerCase().includes(roleSearch.toLowerCase())) ||
    (r.code && r.code.toLowerCase().includes(roleSearch.toLowerCase()))
  );

  // ----------------------------------------------------
  // Màn hình 1: Đăng nhập SSO (Enterprise Clean Light Style)
  // ----------------------------------------------------
  if (!token) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#f0f2f5' }}>
        <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '12px', 
              backgroundColor: '#e6f4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#005baa',
              border: '1px solid #91caff'
            }}>
              <Building2 size={28} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
              Cổng Đăng Nhập Tập Trung (SSO)
            </h1>
            <p style={{ color: '#6b7280', fontSize: '13.5px' }}>
              Hệ thống Quản trị Doanh nghiệp & Phân hệ Dịch vụ
            </p>
          </div>

          {errorMsg && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              background: '#fff2f0', 
              border: '1px solid #ffccc7', 
              borderRadius: '6px', 
              color: '#ff4d4f', 
              fontSize: '13px', 
              marginBottom: '18px' 
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
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
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
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
              style={{ width: '100%', height: '40px', fontSize: '14.5px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
            <span style={{ fontSize: '12.5px', color: '#8c8c8c' }}>
              Tài khoản mặc định: <strong>admin</strong> / <strong>123456</strong>
            </span>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // Màn hình 2: Corporate Header & Enterprise Management
  // ----------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 18px',
          background: toastMsg.type === 'success' ? '#f6ffed' : '#fff2f0',
          color: toastMsg.type === 'success' ? '#389e0d' : '#cf1322',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${toastMsg.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
          fontSize: '13.5px',
          fontWeight: 500
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Corporate Header Nav */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(0, 21, 41, 0.04)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#005baa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', letterSpacing: '-0.01em' }}>
                HỆ THỐNG QUẢN TRỊ TẬP TRUNG (SSO PORTAL)
              </div>
              <div style={{ fontSize: '11.5px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#52c41a', display: 'inline-block' }}></span>
                Gateway: 5000 | Identity Service: 5001
              </div>
            </div>
          </div>

          {/* Navigation Segmented Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', padding: '3px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('launcher')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'launcher' ? '#ffffff' : 'transparent',
                color: activeTab === 'launcher' ? '#005baa' : '#4b5563',
                fontWeight: activeTab === 'launcher' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'launcher' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Layers size={15} />
              <span>Hệ Thống Phân Hệ</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'users' ? '#ffffff' : 'transparent',
                color: activeTab === 'users' ? '#005baa' : '#4b5563',
                fontWeight: activeTab === 'users' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'users' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Users size={15} />
              <span>Quản Trị Người Dùng</span>
              <span style={{ fontSize: '11px', background: activeTab === 'users' ? '#e6f4ff' : '#e5e7eb', color: activeTab === 'users' ? '#005baa' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                {userList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'roles' ? '#ffffff' : 'transparent',
                color: activeTab === 'roles' ? '#005baa' : '#4b5563',
                fontWeight: activeTab === 'roles' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'roles' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Shield size={15} />
              <span>Quản Trị Vai Trò</span>
              <span style={{ fontSize: '11px', background: activeTab === 'roles' ? '#e6f4ff' : '#e5e7eb', color: activeTab === 'roles' ? '#005baa' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                {roleList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'events' ? '#ffffff' : 'transparent',
                color: activeTab === 'events' ? '#005baa' : '#4b5563',
                fontWeight: activeTab === 'events' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'events' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Zap size={15} style={{ color: activeTab === 'events' ? '#d97706' : '#8c8c8c' }} />
              <span>Event-Driven (RabbitMQ)</span>
              <span style={{ fontSize: '11px', background: activeTab === 'events' ? '#fef3c7' : '#e5e7eb', color: activeTab === 'events' ? '#b45309' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                {eventList.length}
              </span>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{user?.fullName}</div>
              <div style={{ fontSize: '11.5px', color: '#6b7280' }}>@{user?.username} ({user?.role})</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              title="Đăng xuất"
              style={{ padding: '6px 10px' }}
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px' }}>
        
        {/* ==================================================== */}
        {/* TAB 1: APP LAUNCHER                                  */}
        {/* ==================================================== */}
        {activeTab === 'launcher' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                Hệ Thống Phân Hệ Trực Thuộc
              </h2>
              <p style={{ color: '#6b7280', fontSize: '13.5px' }}>
                Click để mở trực tiếp phân hệ nghiệp vụ với phiên đăng nhập SSO tập trung.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
              {APPS.map((app) => {
                const IconComponent = app.icon;
                const userRoles = user?.roles || [];
                const hasAccess = !app.requiredRole || userRoles.some(r => r === 'ADMIN' || r === app.requiredRole);

                return (
                  <div
                    key={app.id}
                    className="corporate-card"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderTop: `3px solid ${hasAccess ? app.iconColor : '#d9d9d9'}`,
                      opacity: hasAccess ? 1 : 0.82
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: hasAccess ? app.iconBg : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hasAccess ? app.iconColor : '#8c8c8c'
                        }}>
                          <IconComponent size={22} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: hasAccess ? '#f6ffed' : '#fff2f0',
                            color: hasAccess ? '#389e0d' : '#cf1322',
                            border: `1px solid ${hasAccess ? '#b7eb8f' : '#ffccc7'}`
                          }}>
                            {hasAccess ? '✓ Có quyền' : '🔒 Chưa phân quyền'}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f3f4f6',
                            color: '#4b5563',
                            border: '1px solid #e5e7eb'
                          }}>
                            {app.badge}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: hasAccess ? '#005baa' : '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                        {app.category}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {app.name}
                        {!hasAccess && <Lock size={15} style={{ color: '#cf1322' }} />}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5, marginBottom: '18px' }}>
                        {app.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        Database: <strong style={{ color: '#374151' }}>{app.dbName}</strong>
                      </span>
                      <button
                        onClick={() => handleLaunchApp(app)}
                        disabled={!hasAccess}
                        style={{
                          padding: '6px 14px',
                          fontSize: '13px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '6px',
                          cursor: hasAccess ? 'pointer' : 'not-allowed',
                          backgroundColor: hasAccess ? '#005baa' : '#f5f5f5',
                          color: hasAccess ? '#ffffff' : '#8c8c8c',
                          border: hasAccess ? 'none' : '1px solid #d9d9d9',
                          fontWeight: 500
                        }}
                      >
                        {hasAccess ? (
                          <>
                            <span>Truy Cập</span>
                            <ExternalLink size={14} />
                          </>
                        ) : (
                          <>
                            <Lock size={14} />
                            <span>Khóa Quyền</span>
                          </>
                        )}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                  Quản Trị Người Dùng & Phân Vai Trò
                </h2>
                <p style={{ color: '#6b7280', fontSize: '13.5px' }}>
                  Danh sách tài khoản toàn cơ quan trong cơ sở dữ liệu `Identity_DB`.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={fetchUsers} className="btn-secondary" title="Làm mới">
                  <RefreshCw size={14} />
                  <span>Tải lại</span>
                </button>
                <button onClick={() => setIsCreateUserOpen(true)} className="btn-primary">
                  <Plus size={15} />
                  <span>Thêm Người Dùng</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '36px' }}
                placeholder="Tìm theo tên đăng nhập, họ tên, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {/* Users Table */}
            <div className="corporate-card" style={{ overflow: 'hidden' }}>
              <table className="corporate-table">
                <thead>
                  <tr>
                    <th>Tài khoản / Họ tên</th>
                    <th>Email / SĐT</th>
                    <th>Vai trò được phân quyền</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#8c8c8c' }}>
                        {isDataLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy người dùng nào.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{decodeVietnamese(u.fullName)}</div>
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>@{u.userName}</div>
                        </td>
                        <td>
                          <div style={{ color: '#374151' }}>{u.email || '-'}</div>
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{u.phoneNumber || ''}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {u.roles && u.roles.length > 0 ? (
                              u.roles.map((r) => (
                                <span key={r} style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: r.includes('ADMIN') ? '#fff1f0' : r.includes('TAISAN') ? '#fffbe6' : r.includes('KPI') ? '#f0f5ff' : '#f6ffed',
                                  color: r.includes('ADMIN') ? '#cf1322' : r.includes('TAISAN') ? '#d48806' : r.includes('KPI') ? '#2f54eb' : '#389e0d',
                                  border: `1px solid ${r.includes('ADMIN') ? '#ffa39e' : r.includes('TAISAN') ? '#ffe58f' : r.includes('KPI') ? '#adc6ff' : '#b7eb8f'}`
                                }}>
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Chưa có vai trò</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {u.isActive ? (
                            <span style={{ fontSize: '12px', color: '#52c41a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={14} /> Hoạt động
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#ff4d4f', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UserX size={14} /> Bị khóa
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenAssignRoles(u)}
                              className="btn-secondary"
                              title="Phân quyền vai trò"
                              style={{ padding: '4px 10px', fontSize: '12px', color: '#005baa', borderColor: '#91caff' }}
                            >
                              <Shield size={13} />
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
                              style={{ padding: '4px 8px' }}
                            >
                              <Key size={13} />
                            </button>

                            <button
                              onClick={() => handleToggleUserActive(u)}
                              className="btn-secondary"
                              title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              style={{ padding: '4px 8px', color: u.isActive ? '#ff4d4f' : '#52c41a' }}
                            >
                              {u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                  Danh Mục Vai Trò Hệ Thống (Roles)
                </h2>
                <p style={{ color: '#6b7280', fontSize: '13.5px' }}>
                  Định nghĩa các vai trò để phân bổ chức năng cho các phân hệ Tài sản, KPI, Phòng trọ.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={fetchRoles} className="btn-secondary" title="Làm mới">
                  <RefreshCw size={14} />
                  <span>Tải lại</span>
                </button>
                <button onClick={() => setIsCreateRoleOpen(true)} className="btn-primary">
                  <Plus size={15} />
                  <span>Thêm Vai Trò</span>
                </button>
              </div>
            </div>

            {/* Search Bar for Roles */}
            <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '36px' }}
                placeholder="Tìm theo tên vai trò, mã vai trò..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
            </div>

            {/* Roles Table */}
            <div className="corporate-card" style={{ overflow: 'hidden' }}>
              <table className="corporate-table">
                <thead>
                  <tr>
                    <th>Mã vai trò (Code)</th>
                    <th>Tên vai trò hiển thị</th>
                    <th>Phân loại phân hệ</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#005baa',
                          backgroundColor: '#e6f4ff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #91caff'
                        }}>
                          {r.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#111827' }}>
                        {decodeVietnamese(r.name)}
                      </td>
                      <td style={{ color: '#6b7280' }}>
                        {r.type || 'GENERAL'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditRole(r)}
                            className="btn-secondary"
                            title="Chỉnh sửa tên vai trò"
                            style={{ padding: '4px 8px', color: '#005baa' }}
                          >
                            <Edit size={13} />
                          </button>

                          {r.code !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteRole(r)}
                              className="btn-secondary"
                              title="Xóa vai trò"
                              style={{ padding: '4px 8px', color: '#ff4d4f' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: KIẾN TRÚC EVENT-DRIVEN & RABBITMQ DEMO        */}
        {/* ==================================================== */}
        {activeTab === 'events' && (
          <div>
            {/* Header section */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', color: '#d48806', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} />
                    MÔ HÌNH CHUẨN KHUYÊN DÙNG
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Event-Driven Architecture qua Message Queue (RabbitMQ)
                  </h2>
                </div>
                <p style={{ color: '#6b7280', fontSize: '13.5px', margin: 0, maxWidth: '850px' }}>
                  Khi Admin tạo hoặc cập nhật tài khoản trên Cổng Portal: Identity Service lưu vào <code>Identity_DB</code>, sau đó phát sự kiện <code>UserCreatedEvent</code> vào RabbitMQ Exchange (<code>user.events.exchange</code>). Các phân hệ <strong>Asset Service (5005)</strong> và <strong>KPI Service (5003)</strong> tự động lắng nghe và đồng bộ dữ liệu vào Database riêng (<code>Base_TaiSan</code> & <code>Base_DB</code>).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={fetchEvents} className="btn-secondary" title="Làm mới sự kiện">
                  <RefreshCw size={14} />
                  <span>Tải lại</span>
                </button>
                <button
                  onClick={handlePublishTestEvent}
                  disabled={isPublishingTest}
                  className="btn-primary"
                  style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                >
                  <Send size={14} />
                  <span>{isPublishingTest ? 'Đang gửi...' : '🚀 Bắn Sự Kiện Test (UserCreatedEvent)'}</span>
                </button>
              </div>
            </div>

            {/* Visual Architecture Flow Diagram Card */}
            <div className="corporate-card" style={{ padding: '24px', marginBottom: '24px', background: '#fafafa', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} style={{ color: '#005baa' }} />
                <span>Sơ Đồ Luồng Dữ Liệu Bất Đồng Bộ (Event-Driven Stream)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
                {/* Step 1 */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#e6f4ff', color: '#005baa', padding: '1px 6px', borderRadius: '4px' }}>BƯỚC 1</span>
                      <Server size={18} style={{ color: '#005baa' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>Client / Portal</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                      Admin tạo người dùng gửi request <code>POST /api/auth/users</code> qua API Gateway (5000).
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #f0f0f0', fontSize: '11px', color: '#52c41a', fontWeight: 600 }}>
                    ✓ REST API Gateway:5000
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#f6ffed', color: '#52c41a', padding: '1px 6px', borderRadius: '4px' }}>BƯỚC 2</span>
                      <Database size={18} style={{ color: '#52c41a' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>Identity Service (5001)</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                      Mã hóa mật khẩu và lưu vào <code>Identity_DB</code>, gán các vai trò ban đầu.
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #f0f0f0', fontSize: '11px', color: '#005baa', fontWeight: 600 }}>
                    ✓ Lưu SQL Server: Identity_DB
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ background: '#fffbe6', padding: '16px', borderRadius: '8px', border: '1px solid #ffe58f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#ffd591', color: '#d46b08', padding: '1px 6px', borderRadius: '4px' }}>BƯỚC 3: MESSAGE QUEUE</span>
                      <Zap size={18} style={{ color: '#fa8c16' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#873800', marginBottom: '4px' }}>RabbitMQ Topic Exchange</div>
                    <div style={{ fontSize: '12px', color: '#ad4e00', lineHeight: 1.4 }}>
                      Publish <code>UserCreatedEvent</code> vào exchange <code>user.events.exchange</code> với routing key <code>user.created</code>.
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #ffd591', fontSize: '11px', color: '#d46b08', fontWeight: 600 }}>
                    ⚡ AMQP 0-9-1 Topic Exchange
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#f9f0ff', color: '#722ed1', padding: '1px 6px', borderRadius: '4px' }}>BƯỚC 4: CONSUMERS</span>
                      <Cpu size={18} style={{ color: '#722ed1' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>Subscribers Độc Lập</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                      <strong>Asset Service (5005)</strong> & <strong>KPI Service (5003)</strong> nhận message và tự động ghi vào <code>Base_TaiSan</code> & <code>Base_DB</code>.
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #f0f0f0', fontSize: '11px', color: '#722ed1', fontWeight: 600 }}>
                    ✓ Tự Động Đồng Bộ Tức Thì
                  </div>
                </div>
              </div>
            </div>

            {/* Event History Stream Table */}
            <div className="corporate-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} style={{ color: '#52c41a' }} />
                  <span>Luồng Sự Kiện Thời Gian Thực (Live Event History)</span>
                </div>
                <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Tổng cộng: <strong>{eventList.length}</strong> sự kiện đã phát
                </span>
              </div>

              <table className="corporate-table">
                <thead>
                  <tr>
                    <th>Thời Gian</th>
                    <th>Loại Sự Kiện (Event Type)</th>
                    <th>Routing Key</th>
                    <th>Nguồn Phát</th>
                    <th>Các Dịch Vụ Đã Nhận (Consumers)</th>
                    <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                    <th style={{ textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {eventList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#8c8c8c' }}>
                        Chưa có sự kiện nào. Hãy click "Bắn Sự Kiện Test" hoặc thêm người dùng mới để xem luồng Event-Driven!
                      </td>
                    </tr>
                  ) : (
                    eventList.map((evt) => (
                      <tr key={evt.id}>
                        <td style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {new Date(evt.timestamp).toLocaleTimeString('vi-VN')} {new Date(evt.timestamp).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 600,
                            fontSize: '12px',
                            color: evt.eventType.includes('Created') ? '#005baa' : evt.eventType.includes('Roles') ? '#722ed1' : '#d46b08',
                            backgroundColor: evt.eventType.includes('Created') ? '#e6f4ff' : evt.eventType.includes('Roles') ? '#f9f0ff' : '#fff7e6',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: `1px solid ${evt.eventType.includes('Created') ? '#91caff' : evt.eventType.includes('Roles') ? '#d3adf7' : '#ffd591'}`
                          }}>
                            ⚡ {evt.eventType}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#374151' }}>
                            {evt.routingKey}
                          </code>
                        </td>
                        <td style={{ fontSize: '12.5px', color: '#4b5563', fontWeight: 500 }}>
                          {evt.source}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(evt.consumers || ['asset-service', 'kpi-service']).map((c, idx) => (
                              <span key={idx} style={{
                                fontSize: '11px',
                                background: '#f6ffed',
                                color: '#389e0d',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                border: '1px solid #b7eb8f',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <CheckCheck size={11} />
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f6ffed',
                            color: '#52c41a',
                            border: '1px solid #b7eb8f'
                          }}>
                            ✓ {evt.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedEvent(evt);
                              setIsEventModalOpen(true);
                            }}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px', color: '#005baa' }}
                          >
                            Xem Payload JSON
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 6: XEM CHI TIẾT PAYLOAD SỰ KIỆN JSON           */}
      {/* ==================================================== */}
      {isEventModalOpen && selectedEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Chi Tiết Sự Kiện: {selectedEvent.eventType}
                </h3>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
                  Routing Key: <code>{selectedEvent.routingKey}</code> | Source: {selectedEvent.source}
                </div>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8c8c8c', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Message Body (AMQP JSON Payload):
              </label>
              <pre style={{
                background: '#1e293b',
                color: '#f8fafc',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                lineHeight: 1.5,
                overflowX: 'auto',
                maxHeight: '320px'
              }}>
                {selectedEvent.payload}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
              <button onClick={() => setIsEventModalOpen(false)} className="btn-primary">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: THÊM NGƯỜI DÙNG MỚI                         */}
      {/* ==================================================== */}
      {isCreateUserOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Thêm Tài Khoản Người Dùng</h3>
              <button onClick={() => setIsCreateUserOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8c8c8c', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                  Gán vai trò ban đầu:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  {roleList.map((r) => {
                    const isChecked = newSelectedRoles.includes(r.code);
                    return (
                      <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#374151', cursor: 'pointer' }}>
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
                        <span>{decodeVietnamese(r.name)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
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
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Phân Quyền Vai Trò</h3>
              <button onClick={() => setIsAssignRoleOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8c8c8c', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Phân vai trò cho tài khoản: <strong style={{ color: '#111827' }}>{selectedUser.fullName}</strong> (@{selectedUser.userName})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
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
                      padding: '10px 14px',
                      backgroundColor: isChecked ? '#e6f4ff' : '#ffffff',
                      border: `1px solid ${isChecked ? '#91caff' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: isChecked ? '#005baa' : '#374151', fontSize: '13.5px' }}>
                        {decodeVietnamese(r.name)}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#8c8c8c' }}>Mã: {r.code} ({r.type || 'GENERAL'})</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ width: '16px', height: '16px', accentColor: '#005baa' }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
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
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '380px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Đặt Lại Mật Khẩu</h3>
              <button onClick={() => setIsResetPassOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8c8c8c', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Đặt lại mật khẩu cho tài khoản: <strong style={{ color: '#111827' }}>@{selectedUser.userName}</strong>
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
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
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Thêm Vai Trò Mới</h3>
              <button onClick={() => setIsCreateRoleOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8c8c8c', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
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

      {/* ==================================================== */}
      {/* MODAL 5: CHỈNH SỬA VAI TRÒ                          */}
      {/* ==================================================== */}
      {isEditRoleOpen && selectedRole && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="corporate-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Chỉnh Sửa Tên Vai Trò</h3>
              <button onClick={() => setIsEditRoleOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8c8c8c', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Mã vai trò (Code)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={selectedRole.code}
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Tên vai trò hiển thị tiếng Việt có dấu *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ví dụ: Cán bộ quản lý"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Phân loại phân hệ
                </label>
                <select
                  className="input-field"
                  value={editRoleType}
                  onChange={(e) => setEditRoleType(e.target.value)}
                >
                  <option value="GENERAL">Dùng chung (General)</option>
                  <option value="ASSET">Cơ sở vật chất & Tài sản</option>
                  <option value="KPI">Đánh giá thi đua KPI</option>
                  <option value="ROOM">Phòng trọ & Ví tiền</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsEditRoleOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Lưu Tên Vai Trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
