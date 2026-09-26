import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  X,
  Layers,
  Zap,
  Radio,
  Activity,
  Database,
  Send,
  Server,
  Cpu,
  CheckCheck,
  Menu,
  ChevronRight,
  Eye,
  UserPlus,
  Filter,
  RotateCcw,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Network
} from 'lucide-react';
import { DepartmentsTab } from './DepartmentsTab';

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

  if (text.includes('Quá') || text.includes('Quáº£n') || text.includes('viÃªn toÃ n')) {
    return 'Quản trị viên toàn hệ thống';
  }
  if (text.includes('CÃ') || text.includes('CÃ¡n') || text.includes('quáo£n lÃ½')) {
    return 'Cán bộ quản lý';
  }
  if (text.includes('NgÆ') || text.includes('NgÆ°á') || text.includes('dÃ¹ng thÃ´ng')) {
    return 'Người dùng thông thường';
  }

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

const API_BASE = 'http://localhost:5001/api/auth';

// Danh sách vai trò mặc định cho hệ sinh thái Microservices
const DEFAULT_SYSTEM_ROLES: RoleItem[] = [
  { id: '1', code: 'ADMIN', name: 'Quản trị viên toàn hệ thống', type: 'SYSTEM', isActive: true },
  { id: '2', code: 'ROLE_TAISAN', name: 'Cán bộ Quản lý Tài sản', type: 'ASSET', isActive: true },
  { id: '3', code: 'ROLE_KPI', name: 'Cán bộ Đánh giá KPI & Thi đua', type: 'KPI', isActive: true },
  { id: '4', code: 'ROLE_ROOM', name: 'Quản lý Phòng trọ & Ví tiền', type: 'ROOM', isActive: true },
  { id: '5', code: 'MANAGER', name: 'Quản lý bộ phận', type: 'GENERAL', isActive: true },
  { id: '6', code: 'USER', name: 'Người dùng thông thường', type: 'GENERAL', isActive: true }
];

export default function App() {
  // Auth State - Tự động xóa token giả/cũ (sso_jwt_...) hoặc khi có yêu cầu Single Sign-Out (SSO Logout)
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'logout' || params.get('logout') === 'true') {
        localStorage.removeItem('sso_portal_token');
        localStorage.removeItem('sso_portal_user');
        return null;
      }
    }
    const saved = localStorage.getItem('sso_portal_token');
    if (saved && (saved.startsWith('sso_jwt_') || saved.length < 50)) {
      localStorage.removeItem('sso_portal_token');
      localStorage.removeItem('sso_portal_user');
      return null;
    }
    return saved;
  });
  const [user, setUser] = useState<{ username: string; fullName: string; role: string; roles: string[] } | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'logout' || params.get('logout') === 'true') {
        return null;
      }
    }
    const savedToken = localStorage.getItem('sso_portal_token');
    if (!savedToken) return null;
    const saved = localStorage.getItem('sso_portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Single Sign-Out Handler từ service con
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isLogout = params.get('action') === 'logout' || params.get('logout') === 'true';
    const redirectUri = params.get('redirect_uri');

    if (isLogout) {
      localStorage.removeItem('sso_portal_token');
      localStorage.removeItem('sso_portal_user');
      setToken(null);
      setUser(null);

      if (redirectUri && !redirectUri.includes('3000')) {
        // Chuyển hướng trở lại service con sau khi đã xóa sạch SSO session
        window.location.href = redirectUri;
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
        setToastMsg({ text: 'Đã đăng xuất toàn bộ hệ thống SSO thành công', type: 'success' });
        setTimeout(() => setToastMsg(null), 4000);
      }
    }
  }, []);

  // Layout Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Login Form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active Tab: 'launcher' | 'users' | 'roles' | 'departments' | 'events'
  const [activeTab, setActiveTab] = useState<'launcher' | 'users' | 'roles' | 'departments' | 'events'>('launcher');

  // Master Data States
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [roleList, setRoleList] = useState<RoleItem[]>(DEFAULT_SYSTEM_ROLES);
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // -------------------------------------------------------------
  // USER CRUD & FILTER STATES (Theo chuẩn QLNguoiDung client con)
  // -------------------------------------------------------------
  const [isUserSearchPanelOpen, setIsUserSearchPanelOpen] = useState(false);
  const [userSearchUserName, setUserSearchUserName] = useState('');
  const [userSearchFullName, setUserSearchFullName] = useState('');
  const [userSearchEmail, setUserSearchEmail] = useState('');
  const [userSearchPhone, setUserSearchPhone] = useState('');
  const [userSearchRole, setUserSearchRole] = useState('ALL');
  const [userSearchStatus, setUserSearchStatus] = useState('ALL');

  // User Pagination
  const [userPageIndex, setUserPageIndex] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  // User Modals
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [confirmToggleUser, setConfirmToggleUser] = useState<UserItem | null>(null);

  // User Form Inputs
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [formUserName, setFormUserName] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('123456');
  const [formRoles, setFormRoles] = useState<string[]>(['USER']);
  const [formIsActive, setFormIsActive] = useState(true);

  // Quick Create Form Inputs
  const [quickUserName, setQuickUserName] = useState('');
  const [quickFullName, setQuickFullName] = useState('');
  const [quickRole, setQuickRole] = useState('ROLE_TAISAN');

  // Change Password Input
  const [newPasswordVal, setNewPasswordVal] = useState('123456');

  // Action Dropdown state
  const [openUserDropdownId, setOpenUserDropdownId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // ROLE CRUD & FILTER STATES (Theo chuẩn QLRole client con)
  // -------------------------------------------------------------
  const [isRoleSearchPanelOpen, setIsRoleSearchPanelOpen] = useState(false);
  const [roleSearchCode, setRoleSearchCode] = useState('');
  const [roleSearchName, setRoleSearchName] = useState('');
  const [roleSearchType, setRoleSearchType] = useState('ALL');
  const [roleSearchStatus, setRoleSearchStatus] = useState('ALL');

  // Role Pagination
  const [rolePageIndex, setRolePageIndex] = useState(1);
  const [rolePageSize, setRolePageSize] = useState(10);

  // Role Modals
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isRoleDetailModalOpen, setIsRoleDetailModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<RoleItem | null>(null);

  // Role Form Inputs
  const [formRoleCode, setFormRoleCode] = useState('');
  const [formRoleName, setFormRoleName] = useState('');
  const [formRoleType, setFormRoleType] = useState('GENERAL');
  const [formRoleIsActive, setFormRoleIsActive] = useState(true);

  const [openRoleDropdownId, setOpenRoleDropdownId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // EVENT-DRIVEN STATES
  // -------------------------------------------------------------
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPublishingTest, setIsPublishingTest] = useState(false);

  // Show Toast
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenUserDropdownId(null);
      setOpenRoleDropdownId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
    } catch {
      // Identity Service may not have all users
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
        const data = json.data || json.Data || (Array.isArray(json) ? json : null);
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedRoles = data.map((r: RoleItem) => ({
            ...r,
            name: decodeVietnamese(r.name)
          }));
          setRoleList(mappedRoles);
          return;
        }
      }
    } catch {
      // Error fetching roles
    }
    setRoleList(prev => prev.length > 0 ? prev : DEFAULT_SYSTEM_ROLES);
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
    } catch { }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
      fetchEvents();
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      let activeToken = '';
      let rolesArr: string[] = ['ADMIN', 'ROLE_TAISAN', 'ROLE_KPI', 'ROLE_ROOM'];
      let fullName = username === 'admin' ? 'Quản Trị Viên Toàn Hệ Thống' : username;

      try {
        const authRes = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: username, password: password })
        });

        const data = await authRes.json();
        if (authRes.ok && (data.data?.token || data.token)) {
          activeToken = data.data?.token || data.token;
          if (data.data?.user?.roles) rolesArr = data.data.user.roles;
          if (data.data?.user?.fullName) fullName = decodeVietnamese(data.data.user.fullName);
        } else {
          setErrorMsg(data.message || 'Mật khẩu không chính xác hoặc lỗi đăng nhập.');
          setIsLoading(false);
          return; // Dừng lại, không tạo token giả
        }
      } catch (_) {
        setErrorMsg('Không thể kết nối đến Identity Service.');
        setIsLoading(false);
        return;
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
    } catch {
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

  const handleLaunchApp = (app: AppItem) => {
    const authToken = token || localStorage.getItem('sso_portal_token');
    if (!authToken) return;

    const userRoles = user?.roles || [];
    const hasAccess = !app.requiredRole || userRoles.some(r => r === 'ADMIN' || r === app.requiredRole);

    if (!hasAccess) {
      notify(`Tài khoản "${user?.username}" chưa được cấp quyền truy cập phân hệ "${app.name}"!`, 'error');
      return;
    }

    const targetUrl = `${app.clientUrl}?token=${encodeURIComponent(authToken)}`;
    // Điều hướng trực tiếp trong cùng tab hiện tại
    window.location.href = targetUrl;
  };

  // -------------------------------------------------------------
  // USER CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenCreateUser = () => {
    setFormUserName('');
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('123456');
    setFormRoles(['USER']);
    setFormIsActive(true);
    setIsCreateUserModalOpen(true);
  };

  const handleOpenQuickCreate = () => {
    setQuickUserName('');
    setQuickFullName('');
    setQuickRole('ROLE_TAISAN');
    setIsQuickCreateModalOpen(true);
  };

  const handleOpenEditUser = (u: UserItem) => {
    setSelectedUser(u);
    setFormUserName(u.userName);
    setFormFullName(u.fullName || u.userName);
    setFormEmail(u.email || '');
    setFormPhone(u.phoneNumber || '');
    setFormIsActive(u.isActive);
    setIsEditUserModalOpen(true);
  };

  const handleOpenAssignRoles = (u: UserItem) => {
    setSelectedUser(u);
    setFormRoles(u.roles || []);
    setIsAssignRolesModalOpen(true);
  };

  const handleOpenChangePass = (u: UserItem) => {
    setSelectedUser(u);
    setNewPasswordVal('123456');
    setIsChangePassModalOpen(true);
  };

  const handleOpenUserDetail = (u: UserItem) => {
    setSelectedUser(u);
    setIsUserDetailModalOpen(true);
  };

  const handleSaveCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserName.trim()) {
      notify('Vui lòng nhập tên tài khoản đăng nhập', 'error');
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
          userName: formUserName.trim(),
          fullName: formFullName.trim() || formUserName.trim(),
          email: formEmail.trim(),
          phoneNumber: formPhone.trim(),
          password: formPassword,
          roleCodes: formRoles
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Tạo tài khoản "${formUserName}" & Đồng bộ RabbitMQ thành công!`);
        setIsCreateUserModalOpen(false);
        fetchUsers();
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi tạo người dùng', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleSaveQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUserName.trim()) {
      notify('Vui lòng nhập tên tài khoản', 'error');
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
          userName: quickUserName.trim(),
          fullName: quickFullName.trim() || quickUserName.trim(),
          email: `${quickUserName.trim()}@company.vn`,
          password: '123456',
          roleCodes: [quickRole]
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Tạo nhanh tài khoản "${quickUserName}" & Gán quyền "${quickRole}" thành công!`);
        setIsQuickCreateModalOpen(false);
        fetchUsers();
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi tạo tài khoản', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formFullName.trim(),
          email: formEmail.trim(),
          phoneNumber: formPhone.trim(),
          isActive: formIsActive
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Cập nhật thông tin tài khoản "${selectedUser.userName}" thành công!`);
        setIsEditUserModalOpen(false);
        fetchUsers();
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi cập nhật người dùng', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleSaveAssignRoles = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roleCodes: formRoles })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Cập nhật nhóm quyền cho "${selectedUser.userName}" & Bắn sự kiện RabbitMQ thành công!`);
        setIsAssignRolesModalOpen(false);
        fetchUsers();
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi cập nhật quyền', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleSaveChangePass = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPasswordVal })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Đổi mật khẩu cho "${selectedUser.userName}" thành công!`);
        setIsChangePassModalOpen(false);
      } else {
        notify(json.message || 'Lỗi đổi mật khẩu', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleConfirmToggleActiveUser = async () => {
    if (!confirmToggleUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/${confirmToggleUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(`${confirmToggleUser.isActive ? 'Khóa' : 'Mở khóa'} tài khoản "${confirmToggleUser.userName}" thành công!`);
        setConfirmToggleUser(null);
        fetchUsers();
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi thay đổi trạng thái', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  // -------------------------------------------------------------
  // ROLE CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenCreateRole = () => {
    setFormRoleCode('');
    setFormRoleName('');
    setFormRoleType('GENERAL');
    setFormRoleIsActive(true);
    setIsCreateRoleModalOpen(true);
  };

  const handleOpenEditRole = (r: RoleItem) => {
    setSelectedRole(r);
    setFormRoleCode(r.code);
    setFormRoleName(r.name);
    setFormRoleType(r.type || 'GENERAL');
    setFormRoleIsActive(r.isActive);
    setIsEditRoleModalOpen(true);
  };

  const handleOpenRoleDetail = (r: RoleItem) => {
    setSelectedRole(r);
    setIsRoleDetailModalOpen(true);
  };

  const handleSaveCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleCode.trim() || !formRoleName.trim()) {
      notify('Vui lòng nhập đầy đủ mã vai trò và tên vai trò', 'error');
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
          code: formRoleCode.trim().toUpperCase(),
          name: formRoleName.trim(),
          type: formRoleType
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Tạo vai trò "${formRoleCode}" thành công!`);
        setIsCreateRoleModalOpen(false);
        fetchRoles();
      } else {
        notify(json.message || 'Lỗi tạo vai trò', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleSaveEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      const res = await fetch(`${API_BASE}/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formRoleName.trim(),
          type: formRoleType,
          isActive: formRoleIsActive
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Cập nhật vai trò "${selectedRole.code}" thành công!`);
        setIsEditRoleModalOpen(false);
        fetchRoles();
      } else {
        notify(json.message || 'Lỗi cập nhật vai trò', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  const handleConfirmDeleteRole = async () => {
    if (!confirmDeleteRole) return;
    try {
      const res = await fetch(`${API_BASE}/roles/${confirmDeleteRole.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Xóa vai trò "${confirmDeleteRole.code}" thành công!`);
        setConfirmDeleteRole(null);
        fetchRoles();
      } else {
        notify(json.message || 'Không thể xóa vai trò này', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  // -------------------------------------------------------------
  // FILTER & PAGINATION CALCULATIONS
  // -------------------------------------------------------------
  // Filtered Users
  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      if (userSearchUserName && !u.userName.toLowerCase().includes(userSearchUserName.toLowerCase().trim())) return false;
      if (userSearchFullName && !u.fullName.toLowerCase().includes(userSearchFullName.toLowerCase().trim())) return false;
      if (userSearchEmail && (!u.email || !u.email.toLowerCase().includes(userSearchEmail.toLowerCase().trim()))) return false;
      if (userSearchPhone && (!u.phoneNumber || !u.phoneNumber.includes(userSearchPhone.trim()))) return false;
      if (userSearchRole !== 'ALL' && (!u.roles || !u.roles.includes(userSearchRole))) return false;
      if (userSearchStatus === 'ACTIVE' && !u.isActive) return false;
      if (userSearchStatus === 'INACTIVE' && u.isActive) return false;
      return true;
    });
  }, [userList, userSearchUserName, userSearchFullName, userSearchEmail, userSearchPhone, userSearchRole, userSearchStatus]);

  const totalUserCount = filteredUsers.length;
  const totalUserPages = Math.ceil(totalUserCount / userPageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (userPageIndex - 1) * userPageSize;
    return filteredUsers.slice(start, start + userPageSize);
  }, [filteredUsers, userPageIndex, userPageSize]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roleList.filter((r) => {
      if (roleSearchCode && !r.code.toLowerCase().includes(roleSearchCode.toLowerCase().trim())) return false;
      if (roleSearchName && !r.name.toLowerCase().includes(roleSearchName.toLowerCase().trim())) return false;
      if (roleSearchType !== 'ALL' && r.type !== roleSearchType) return false;
      if (roleSearchStatus === 'ACTIVE' && !r.isActive) return false;
      if (roleSearchStatus === 'INACTIVE' && r.isActive) return false;
      return true;
    });
  }, [roleList, roleSearchCode, roleSearchName, roleSearchType, roleSearchStatus]);

  const totalRoleCount = filteredRoles.length;
  const totalRolePages = Math.ceil(totalRoleCount / rolePageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (rolePageIndex - 1) * rolePageSize;
    return filteredRoles.slice(start, start + rolePageSize);
  }, [filteredRoles, rolePageIndex, rolePageSize]);

  // -------------------------------------------------------------
  // EVENT TEST HANDLERS
  // -------------------------------------------------------------
  const handlePublishTestEvent = async () => {
    setIsPublishingTest(true);
    try {
      const res = await fetch(`${API_BASE}/events/publish-test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify('Đã bắn sự kiện test "UserCreatedEvent" thành công vào RabbitMQ!');
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi bắn test event', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    } finally {
      setIsPublishingTest(false);
    }
  };

  const handleSyncAllUsers = async () => {
    setIsPublishingTest(true);
    try {
      const res = await fetch(`${API_BASE}/events/sync-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(json.message || 'Đã đồng bộ toàn bộ người dùng vào RabbitMQ!');
        fetchEvents();
      } else {
        notify(json.message || 'Lỗi đồng bộ', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    } finally {
      setIsPublishingTest(false);
    }
  };

  // -------------------------------------------------------------------------
  // Màn hình 1: Đăng nhập tập trung (SSO Login)
  // -------------------------------------------------------------------------
  if (!token) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '20px' }}>
        <div className="corporate-card" style={{ width: '100%', maxWidth: '420px', padding: '36px', boxShadow: '0 8px 24px rgba(0, 91, 170, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#005baa',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 91, 170, 0.3)'
            }}>
              <ShieldCheck size={32} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '6px', letterSpacing: '-0.01em' }}>
              CỔNG QUẢN TRỊ TẬP TRUNG
            </h1>
            <p style={{ color: '#6b7280', fontSize: '13px' }}>
              Hệ thống SSO & Identity Server điều phối vi dịch vụ
            </p>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '6px',
              color: '#cf1322',
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

  // -------------------------------------------------------------------------
  // Màn hình 2: Corporate Header & SideNav Layout (ĐỒNG BỘ 100% VỚI CÁC CLIENTS)
  // -------------------------------------------------------------------------
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          border: `1px solid ${toastMsg.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
          fontSize: '13.5px',
          fontWeight: 500
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. TOP HEADER NAV (ĐỒNG BỘ VỚI ASSET & KPI CLIENTS)  */}
      {/* ==================================================== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Left: Hamburger & Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4b5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              transition: 'background 0.15s'
            }}
            title="Đóng / Mở Menu bên trái"
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#005baa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(0, 91, 170, 0.25)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#005baa', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                  QUẢN TRỊ TẬP TRUNG
                </span>
                <span style={{ fontSize: '10.5px', background: '#e6f4ff', color: '#005baa', border: '1px solid #91caff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  PORTAL SSO :3000
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                Cổng Dịch Vụ SSO & Phân Quyền Toàn Cơ Quan (Identity_DB)
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick App Switchers & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Switcher Button: Asset Service (:9797) */}
          <button
            onClick={() => handleLaunchApp(APPS[0])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #f59e0b',
              backgroundColor: '#fffbeb',
              color: '#b45309',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            title="Mở Phân hệ Quản lý Cơ sở vật chất & Tài sản"
          >
            <PackageCheck size={15} />
            <span>Quản Lý Tài Sản (:9797)</span>
          </button>

          {/* Switcher Button: KPI Service (:9696) */}
          <button
            onClick={() => handleLaunchApp(APPS[1])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #2f54eb',
              backgroundColor: '#f0f5ff',
              color: '#1d39c4',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            title="Mở Phân hệ Đánh giá KPI & Thi đua"
          >
            <BarChart3 size={15} />
            <span>Đánh Giá KPI (:9696)</span>
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 4px' }}></div>

          {/* User Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#e6f4ff',
              border: '1px solid #91caff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#005baa',
              fontWeight: 700,
              fontSize: '14px'
            }}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                @{user?.username} ({user?.role})
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              title="Đăng xuất khỏi hệ thống"
              style={{ padding: '6px 10px', marginLeft: '4px' }}
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. BODY LAYOUT (SIDEBAR MENU + MAIN CONTENT)         */}
      {/* ==================================================== */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left SideNav */}
        <aside style={{
          width: isSidebarCollapsed ? '72px' : '250px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.2s ease',
          zIndex: 40
        }}>
          {/* Navigation Links */}
          <div style={{ padding: '16px 0' }}>
            {!isSidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DANH MỤC HỆ THỐNG
              </div>
            )}

            {/* Menu Item 1: Launcher */}
            <div
              onClick={() => setActiveTab('launcher')}
              className={`menu-nav-item ${activeTab === 'launcher' ? 'active' : ''}`}
              title="Hệ Thống Phân Hệ Trực Thuộc"
            >
              <Layers size={18} style={{ color: activeTab === 'launcher' ? '#005baa' : '#6b7280', flexShrink: 0 }} />
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Hệ Thống Phân Hệ</span>
                  <span style={{ fontSize: '10.5px', background: activeTab === 'launcher' ? '#bae0ff' : '#f3f4f6', color: activeTab === 'launcher' ? '#005baa' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    {APPS.length}
                  </span>
                </div>
              )}
            </div>

            {/* Menu Item 2: Users */}
            <div
              onClick={() => setActiveTab('users')}
              className={`menu-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              title="Quản Trị Người Dùng & Phân Vai Trò"
            >
              <Users size={18} style={{ color: activeTab === 'users' ? '#005baa' : '#6b7280', flexShrink: 0 }} />
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Quản Lý Người Dùng</span>
                  <span style={{ fontSize: '10.5px', background: activeTab === 'users' ? '#bae0ff' : '#f3f4f6', color: activeTab === 'users' ? '#005baa' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    {userList.length}
                  </span>
                </div>
              )}
            </div>

            {/* Menu Item 3: Roles */}
            <div
              onClick={() => setActiveTab('roles')}
              className={`menu-nav-item ${activeTab === 'roles' ? 'active' : ''}`}
              title="Danh Mục Vai Trò Hệ Thống"
            >
              <Shield size={18} style={{ color: activeTab === 'roles' ? '#005baa' : '#6b7280', flexShrink: 0 }} />
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Quản Lý Vai Trò</span>
                  <span style={{ fontSize: '10.5px', background: activeTab === 'roles' ? '#bae0ff' : '#f3f4f6', color: activeTab === 'roles' ? '#005baa' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    {roleList.length}
                  </span>
                </div>
              )}
            </div>

            {/* Menu Item 4: Departments / Organization Structure */}
            <div
              onClick={() => setActiveTab('departments')}
              className={`menu-nav-item ${activeTab === 'departments' ? 'active' : ''}`}
              title="Cơ Cấu Tổ Chức & Sơ Đồ Phòng Ban"
            >
              <Network size={18} style={{ color: activeTab === 'departments' ? '#005baa' : '#6b7280', flexShrink: 0 }} />
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Cơ Cấu Tổ Chức</span>
                  <span style={{ fontSize: '10.5px', background: activeTab === 'departments' ? '#bae0ff' : '#f3f4f6', color: activeTab === 'departments' ? '#005baa' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    Phòng ban
                  </span>
                </div>
              )}
            </div>

            {/* Menu Item 5: Events (RabbitMQ) */}
            <div
              onClick={() => setActiveTab('events')}
              className={`menu-nav-item ${activeTab === 'events' ? 'active' : ''}`}
              title="Event-Driven & RabbitMQ Message Queue"
            >
              <Zap size={18} style={{ color: activeTab === 'events' ? '#d97706' : '#6b7280', flexShrink: 0 }} />
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Event-Driven (Rabbit)</span>
                  <span style={{ fontSize: '10.5px', background: activeTab === 'events' ? '#fef3c7' : '#f3f4f6', color: activeTab === 'events' ? '#b45309' : '#6b7280', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    {eventList.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom System Status in Sidebar */}
          {!isSidebarCollapsed && (
            <div style={{ padding: '14px', margin: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11.5px', color: '#6b7280' }}>
              <div style={{ fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#52c41a' }}></span>
                <span>Hạ Tầng Kết Nối</span>
              </div>
              <div style={{ marginBottom: '2px' }}>Gateway: <strong>:5000</strong></div>
              <div style={{ marginBottom: '2px' }}>Identity: <strong>:5001</strong></div>
              <div>RabbitMQ: <strong>192.168.0.101</strong></div>
            </div>
          )}
        </aside>

        {/* Right Main Content Area (Full width) */}
        <main style={{ flex: 1, padding: '16px 20px', width: '100%', minWidth: 0, overflowX: 'hidden' }}>

          {/* ==================================================== */}
          {/* TAB 1: APP LAUNCHER                                  */}
          {/* ==================================================== */}
          {activeTab === 'launcher' && (
            <div>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '12.5px', color: '#6b7280' }}>
                <span>Trang chủ</span>
                <ChevronRight size={13} />
                <span style={{ color: '#005baa', fontWeight: 600 }}>Hệ Thống Phân Hệ Nghiệp Vụ</span>
              </div>

              <div style={{ marginBottom: '20px' }}>
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
          {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG (CHUẨN QLNguoiDung CRUD)   */}
          {/* ==================================================== */}
          {activeTab === 'users' && (
            <div>
              {/* Breadcrumb & Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <span>Trang chủ</span>
                  <ChevronRight size={14} />
                  <span style={{ color: '#005baa', fontWeight: 600 }}>Quản lý người dùng</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Button Tìm kiếm / Ẩn tìm kiếm */}
                  <button
                    onClick={() => setIsUserSearchPanelOpen(!isUserSearchPanelOpen)}
                    className="btn-primary"
                    style={{ backgroundColor: isUserSearchPanelOpen ? '#4b5563' : '#005baa', borderColor: isUserSearchPanelOpen ? '#4b5563' : '#005baa' }}
                  >
                    {isUserSearchPanelOpen ? <X size={15} /> : <Search size={15} />}
                    <span>{isUserSearchPanelOpen ? 'Ẩn tìm kiếm' : 'Tìm kiếm'}</span>
                  </button>

                  {/* Button Tạo tài khoản nhanh */}
                  <button
                    onClick={handleOpenQuickCreate}
                    className="btn-secondary"
                    style={{ borderColor: '#005baa', color: '#005baa', fontWeight: 600 }}
                  >
                    <UserPlus size={15} />
                    <span>Tạo tài khoản nhanh</span>
                  </button>

                  {/* Button Thêm mới */}
                  <button onClick={handleOpenCreateUser} className="btn-primary">
                    <Plus size={15} />
                    <span>Thêm mới</span>
                  </button>

                  {/* Button Tải lại */}
                  <button onClick={fetchUsers} className="btn-secondary" title="Tải lại dữ liệu">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Collapsible Search Filter Panel */}
              {isUserSearchPanelOpen && (
                <div className="search-filter-panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                    <Filter size={16} style={{ color: '#005baa' }} />
                    <span>Bộ lọc tìm kiếm nâng cao</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Tên tài khoản
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nhập tên đăng nhập..."
                        value={userSearchUserName}
                        onChange={(e) => { setUserSearchUserName(e.target.value); setUserPageIndex(1); }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nhập họ và tên..."
                        value={userSearchFullName}
                        onChange={(e) => { setUserSearchFullName(e.target.value); setUserPageIndex(1); }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Email
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nhập email..."
                        value={userSearchEmail}
                        onChange={(e) => { setUserSearchEmail(e.target.value); setUserPageIndex(1); }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nhập số điện thoại..."
                        value={userSearchPhone}
                        onChange={(e) => { setUserSearchPhone(e.target.value); setUserPageIndex(1); }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Nhóm quyền (Vai trò)
                      </label>
                      <select
                        className="input-field"
                        value={userSearchRole}
                        onChange={(e) => { setUserSearchRole(e.target.value); setUserPageIndex(1); }}
                      >
                        <option value="ALL">-- Tất cả nhóm quyền --</option>
                        {roleList.map((r) => (
                          <option key={r.id} value={r.code}>{r.code} - {r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Trạng thái tài khoản
                      </label>
                      <select
                        className="input-field"
                        value={userSearchStatus}
                        onChange={(e) => { setUserSearchStatus(e.target.value); setUserPageIndex(1); }}
                      >
                        <option value="ALL">-- Tất cả trạng thái --</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Đã khóa</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        setUserSearchUserName('');
                        setUserSearchFullName('');
                        setUserSearchEmail('');
                        setUserSearchPhone('');
                        setUserSearchRole('ALL');
                        setUserSearchStatus('ALL');
                        setUserPageIndex(1);
                      }}
                      className="btn-secondary"
                    >
                      <RotateCcw size={14} />
                      <span>Đặt lại</span>
                    </button>
                    <button onClick={fetchUsers} className="btn-primary">
                      <Search size={14} />
                      <span>Tìm kiếm</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Data Table Grid */}
              <div className="corporate-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="corporate-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                        <th style={{ minWidth: '130px' }}>Tài khoản</th>
                        <th style={{ minWidth: '160px' }}>Họ tên</th>
                        <th style={{ minWidth: '180px' }}>Nhóm quyền</th>
                        <th style={{ minWidth: '160px' }}>Email</th>
                        <th style={{ minWidth: '110px', textAlign: 'center' }}>Điện thoại</th>
                        <th style={{ minWidth: '110px', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isDataLoading ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6b7280' }}>
                            Đang tải danh sách người dùng từ Identity Service...
                          </td>
                        </tr>
                      ) : paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#8c8c8c' }}>
                            Không tìm thấy dữ liệu người dùng phù hợp.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u, index) => {
                          const stt = (userPageIndex - 1) * userPageSize + index + 1;
                          const isDropdownOpen = openUserDropdownId === u.id;

                          return (
                            <tr key={u.id}>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#6b7280' }}>
                                {stt}
                              </td>
                              <td>
                                <span style={{ fontWeight: 600, color: '#005baa' }}>
                                  {u.userName}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500, color: '#111827' }}>
                                {u.fullName}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {u.roles && u.roles.length > 0 ? (
                                    u.roles.map((r, rIdx) => (
                                      <span
                                        key={rIdx}
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 600,
                                          padding: '2px 7px',
                                          borderRadius: '4px',
                                          backgroundColor: r === 'ADMIN' ? '#fff1f0' : r === 'ROLE_TAISAN' ? '#e6f4ff' : r === 'ROLE_KPI' ? '#f0f5ff' : '#f6ffed',
                                          color: r === 'ADMIN' ? '#cf1322' : r === 'ROLE_TAISAN' ? '#005baa' : r === 'ROLE_KPI' ? '#1d39c4' : '#389e0d',
                                          border: `1px solid ${r === 'ADMIN' ? '#ffa39e' : r === 'ROLE_TAISAN' ? '#91caff' : r === 'ROLE_KPI' ? '#adc6ff' : '#b7eb8f'}`
                                        }}
                                      >
                                        {r}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Chưa gán</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {u.email ? (
                                  <span style={{ fontSize: '13px', color: '#4b5563' }}>{u.email}</span>
                                ) : (
                                  <span style={{ color: '#9ca3af' }}>—</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {u.phoneNumber ? (
                                  <span style={{ fontSize: '12.5px', color: '#4b5563' }}>{u.phoneNumber}</span>
                                ) : (
                                  <span style={{ color: '#9ca3af' }}>—</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  backgroundColor: u.isActive ? '#f6ffed' : '#fff1f0',
                                  color: u.isActive ? '#389e0d' : '#cf1322',
                                  border: `1px solid ${u.isActive ? '#b7eb8f' : '#ffa39e'}`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {u.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                  <span>{u.isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', position: 'relative' }}>
                                <div style={{ display: 'inline-block' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenUserDropdownId(isDropdownOpen ? null : u.id);
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '5px 9px', fontSize: '12.5px', color: '#005baa', borderColor: '#91caff' }}
                                  >
                                    <span>Thao tác</span>
                                    <MoreVertical size={13} />
                                  </button>

                                  {isDropdownOpen && (
                                    <>
                                      <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 1040 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenUserDropdownId(null);
                                        }}
                                      />
                                      <div
                                        className={`action-dropdown-menu ${index >= paginatedUsers.length - 2 ? 'drop-up' : ''}`}
                                        style={{ zIndex: 1050 }}
                                      >
                                        <button
                                          className="action-dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenUserDropdownId(null);
                                            handleOpenUserDetail(u);
                                          }}
                                        >
                                          <Eye size={14} style={{ color: '#005baa' }} />
                                          <span>Chi tiết</span>
                                        </button>
                                        <button
                                          className="action-dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenUserDropdownId(null);
                                            handleOpenEditUser(u);
                                          }}
                                        >
                                          <Edit size={14} style={{ color: '#1d39c4' }} />
                                          <span>Chỉnh sửa</span>
                                        </button>
                                        <button
                                          className="action-dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenUserDropdownId(null);
                                            handleOpenAssignRoles(u);
                                          }}
                                        >
                                          <Shield size={14} style={{ color: '#52c41a' }} />
                                          <span>Phân nhóm quyền</span>
                                        </button>
                                        <button
                                          className="action-dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenUserDropdownId(null);
                                            handleOpenChangePass(u);
                                          }}
                                        >
                                          <Lock size={14} style={{ color: '#d48806' }} />
                                          <span>Đổi mật khẩu</span>
                                        </button>
                                        <button
                                          className={`action-dropdown-item ${u.isActive ? 'danger' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenUserDropdownId(null);
                                            setConfirmToggleUser(u);
                                          }}
                                        >
                                          {u.isActive ? <Lock size={14} /> : <Unlock size={14} style={{ color: '#52c41a' }} />}
                                          <span>{u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="pagination-container">
                  <div>
                    <span>
                      {totalUserCount > 0
                        ? `${(userPageIndex - 1) * userPageSize + 1} - ${Math.min(userPageIndex * userPageSize, totalUserCount)} trong ${totalUserCount} dữ liệu`
                        : '0 dữ liệu'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      className="input-field"
                      style={{ width: '100px', padding: '4px 8px', fontSize: '12px' }}
                      value={userPageSize}
                      onChange={(e) => {
                        setUserPageSize(Number(e.target.value));
                        setUserPageIndex(1);
                      }}
                    >
                      <option value={5}>5 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                      <option value={50}>50 / trang</option>
                    </select>

                    <button
                      className="pagination-btn"
                      disabled={userPageIndex <= 1}
                      onClick={() => setUserPageIndex(1)}
                      title="Trang đầu"
                    >
                      <ChevronsLeft size={14} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={userPageIndex <= 1}
                      onClick={() => setUserPageIndex(userPageIndex - 1)}
                      title="Trang trước"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span style={{ padding: '0 8px', fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                      {userPageIndex} / {totalUserPages}
                    </span>

                    <button
                      className="pagination-btn"
                      disabled={userPageIndex >= totalUserPages}
                      onClick={() => setUserPageIndex(userPageIndex + 1)}
                      title="Trang sau"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={userPageIndex >= totalUserPages}
                      onClick={() => setUserPageIndex(totalUserPages)}
                      title="Trang cuối"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: QUẢN LÝ VAI TRÒ (CHUẨN QLRole CRUD)            */}
          {/* ==================================================== */}
          {activeTab === 'roles' && (
            <div>
              {/* Breadcrumb & Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <span>Trang chủ</span>
                  <ChevronRight size={14} />
                  <span style={{ color: '#005baa', fontWeight: 600 }}>Quản lý nhóm quyền</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Button Tìm kiếm */}
                  <button
                    onClick={() => setIsRoleSearchPanelOpen(!isRoleSearchPanelOpen)}
                    className="btn-primary"
                    style={{ backgroundColor: isRoleSearchPanelOpen ? '#4b5563' : '#005baa', borderColor: isRoleSearchPanelOpen ? '#4b5563' : '#005baa' }}
                  >
                    {isRoleSearchPanelOpen ? <X size={15} /> : <Search size={15} />}
                    <span>{isRoleSearchPanelOpen ? 'Ẩn tìm kiếm' : 'Tìm kiếm'}</span>
                  </button>

                  {/* Button Thêm mới */}
                  <button onClick={handleOpenCreateRole} className="btn-primary">
                    <Plus size={15} />
                    <span>Thêm mới</span>
                  </button>

                  {/* Button Tải lại */}
                  <button onClick={fetchRoles} className="btn-secondary" title="Tải lại">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Collapsible Search Filter Panel */}
              {isRoleSearchPanelOpen && (
                <div className="search-filter-panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                    <Filter size={16} style={{ color: '#005baa' }} />
                    <span>Tìm kiếm nhóm quyền</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Mã nhóm quyền (Code)
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nhập mã vai trò (vd: ROLE_TAISAN)..."
                        value={roleSearchCode}
                        onChange={(e) => { setRoleSearchCode(e.target.value); setRolePageIndex(1); }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Tên nhóm quyền
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nhập tên vai trò..."
                        value={roleSearchName}
                        onChange={(e) => { setRoleSearchName(e.target.value); setRolePageIndex(1); }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Phân loại phân hệ
                      </label>
                      <select
                        className="input-field"
                        value={roleSearchType}
                        onChange={(e) => { setRoleSearchType(e.target.value); setRolePageIndex(1); }}
                      >
                        <option value="ALL">-- Tất cả phân loại --</option>
                        <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                        <option value="ASSET">Tài sản (ASSET)</option>
                        <option value="KPI">Đánh giá KPI (KPI)</option>
                        <option value="ROOM">Phòng trọ (ROOM)</option>
                        <option value="GENERAL">Chung (GENERAL)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                        Hiệu lực
                      </label>
                      <select
                        className="input-field"
                        value={roleSearchStatus}
                        onChange={(e) => { setRoleSearchStatus(e.target.value); setRolePageIndex(1); }}
                      >
                        <option value="ALL">-- Tất cả --</option>
                        <option value="ACTIVE">Có hiệu lực</option>
                        <option value="INACTIVE">Hết hiệu lực</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        setRoleSearchCode('');
                        setRoleSearchName('');
                        setRoleSearchType('ALL');
                        setRoleSearchStatus('ALL');
                        setRolePageIndex(1);
                      }}
                      className="btn-secondary"
                    >
                      <RotateCcw size={14} />
                      <span>Đặt lại</span>
                    </button>
                    <button onClick={fetchRoles} className="btn-primary">
                      <Search size={14} />
                      <span>Tìm kiếm</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Data Table Grid */}
              <div className="corporate-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="corporate-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                        <th style={{ minWidth: '160px' }}>Mã nhóm quyền</th>
                        <th style={{ minWidth: '220px' }}>Tên nhóm quyền</th>
                        <th style={{ minWidth: '140px' }}>Phân loại phân hệ</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>Hiệu lực</th>
                        <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRoles.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#8c8c8c' }}>
                            Không tìm thấy vai trò nào.
                          </td>
                        </tr>
                      ) : (
                        paginatedRoles.map((r, index) => {
                          const stt = (rolePageIndex - 1) * rolePageSize + index + 1;
                          const isDropdownOpen = openRoleDropdownId === r.id;

                          return (
                            <tr key={r.id}>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#6b7280' }}>
                                {stt}
                              </td>
                              <td>
                                <span style={{
                                  fontWeight: 700,
                                  fontSize: '12.5px',
                                  color: '#005baa',
                                  backgroundColor: '#e6f4ff',
                                  padding: '3px 9px',
                                  borderRadius: '4px',
                                  border: '1px solid #91caff'
                                }}>
                                  {r.code}
                                </span>
                              </td>
                              <td style={{ fontWeight: 600, color: '#111827' }}>
                                {r.name}
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '11.5px',
                                  fontWeight: 500,
                                  color: '#4b5563',
                                  background: '#f3f4f6',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  {r.type || 'GENERAL'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {r.isActive ? (
                                  <CheckCircle size={20} style={{ color: '#52c41a' }} />
                                ) : (
                                  <XCircle size={20} style={{ color: '#ff4d4f' }} />
                                )}
                              </td>
                              <td style={{ textAlign: 'center', position: 'relative' }}>
                                <div style={{ display: 'inline-block' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenRoleDropdownId(isDropdownOpen ? null : r.id);
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '5px 9px', fontSize: '12.5px', color: '#005baa', borderColor: '#91caff' }}
                                  >
                                    <span>Thao tác</span>
                                    <MoreVertical size={13} />
                                  </button>

                                  {isDropdownOpen && (
                                    <>
                                      <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 1040 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenRoleDropdownId(null);
                                        }}
                                      />
                                      <div
                                        className={`action-dropdown-menu ${index >= paginatedRoles.length - 2 ? 'drop-up' : ''}`}
                                        style={{ zIndex: 1050 }}
                                      >
                                        <button
                                          className="action-dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenRoleDropdownId(null);
                                            handleOpenRoleDetail(r);
                                          }}
                                        >
                                          <Eye size={14} style={{ color: '#005baa' }} />
                                          <span>Chi tiết</span>
                                        </button>
                                        <button
                                          className="action-dropdown-item"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenRoleDropdownId(null);
                                            handleOpenEditRole(r);
                                          }}
                                        >
                                          <Edit size={14} style={{ color: '#1d39c4' }} />
                                          <span>Chỉnh sửa</span>
                                        </button>
                                        {r.code !== 'ADMIN' && (
                                          <button
                                            className="action-dropdown-item danger"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenRoleDropdownId(null);
                                              setConfirmDeleteRole(r);
                                            }}
                                          >
                                            <Trash2 size={14} />
                                            <span>Xóa nhóm quyền</span>
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="pagination-container">
                  <div>
                    <span>
                      {totalRoleCount > 0
                        ? `${(rolePageIndex - 1) * rolePageSize + 1} - ${Math.min(rolePageIndex * rolePageSize, totalRoleCount)} trong ${totalRoleCount} dữ liệu`
                        : '0 dữ liệu'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      className="input-field"
                      style={{ width: '100px', padding: '4px 8px', fontSize: '12px' }}
                      value={rolePageSize}
                      onChange={(e) => {
                        setRolePageSize(Number(e.target.value));
                        setRolePageIndex(1);
                      }}
                    >
                      <option value={5}>5 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                      <option value={50}>50 / trang</option>
                    </select>

                    <button
                      className="pagination-btn"
                      disabled={rolePageIndex <= 1}
                      onClick={() => setRolePageIndex(1)}
                      title="Trang đầu"
                    >
                      <ChevronsLeft size={14} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={rolePageIndex <= 1}
                      onClick={() => setRolePageIndex(rolePageIndex - 1)}
                      title="Trang trước"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span style={{ padding: '0 8px', fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                      {rolePageIndex} / {totalRolePages}
                    </span>

                    <button
                      className="pagination-btn"
                      disabled={rolePageIndex >= totalRolePages}
                      onClick={() => setRolePageIndex(rolePageIndex + 1)}
                      title="Trang sau"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={rolePageIndex >= totalRolePages}
                      onClick={() => setRolePageIndex(totalRolePages)}
                      title="Trang cuối"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: EVENT-DRIVEN & RABBITMQ DEMO                  */}
          {/* ==================================================== */}
          {activeTab === 'events' && (
            <div>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '12.5px', color: '#6b7280' }}>
                <span>Trang chủ</span>
                <ChevronRight size={13} />
                <span style={{ color: '#005baa', fontWeight: 600 }}>Kiến trúc Event-Driven (RabbitMQ)</span>
              </div>

              {/* Header section */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', color: '#d48806', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={12} />
                      MÔ HÌNH CHUẨN DOANH NGHIỆP
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                      Giám Sát Hàng Đợi Thông Điệp RabbitMQ
                    </h2>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '13.5px' }}>
                    Sự kiện phân quyền & tạo người dùng từ <strong>Identity Service</strong> được phát tán tức thời sang <strong>Asset Service</strong> & <strong>KPI Service</strong>.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handlePublishTestEvent}
                    disabled={isPublishingTest}
                    className="btn-primary"
                    style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                  >
                    <Send size={14} />
                    <span>{isPublishingTest ? 'Đang bắn...' : 'Bắn Test Sự Kiện'}</span>
                  </button>

                  <button
                    onClick={handleSyncAllUsers}
                    disabled={isPublishingTest}
                    className="btn-primary"
                  >
                    <RefreshCw size={14} />
                    <span>Đồng Bộ Hàng Loạt</span>
                  </button>
                </div>
              </div>

              {/* Architecture Topology */}
              <div className="corporate-card" style={{ padding: '20px', marginBottom: '24px', backgroundColor: '#fafbfc' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={16} style={{ color: '#005baa' }} />
                  <span>Sơ Đồ Luồng Dữ Liệu Thực Tế (RabbitMQ Broker: 192.168.0.101:5672)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #bae0ff', borderRadius: '8px', padding: '14px', boxShadow: '0 2px 6px rgba(0,91,170,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Server size={16} style={{ color: '#005baa' }} />
                      <strong style={{ fontSize: '13.5px', color: '#005baa' }}>1. Producer (Identity Service :5001)</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                      Khi Tạo/Sửa người dùng hoặc phân vai trò, Identity Service đẩy sự kiện vào Exchange <code>user.events.exchange</code> với routing key <code>user.created</code> hoặc <code>user.roles.changed</code>.
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #ffd591', borderRadius: '8px', padding: '14px', boxShadow: '0 2px 6px rgba(217,119,6,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Cpu size={16} style={{ color: '#d97706' }} />
                      <strong style={{ fontSize: '13.5px', color: '#d97706' }}>2. RabbitMQ Exchange (Topic)</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                      Định tuyến song song tới 2 hàng đợi:
                      <div style={{ marginTop: '4px', fontWeight: 600 }}>• Queue: <code>asset.service.user.sync</code></div>
                      <div style={{ fontWeight: 600 }}>• Queue: <code>kpi.service.user.sync</code></div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #b7eb8f', borderRadius: '8px', padding: '14px', boxShadow: '0 2px 6px rgba(82,196,26,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Database size={16} style={{ color: '#52c41a' }} />
                      <strong style={{ fontSize: '13.5px', color: '#389e0d' }}>3. Consumers (Asset & KPI Services)</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                      <code>UserSyncConsumerService</code> tự động nhận message và ghi trực tiếp vào bảng <code>[AspNetUsers]</code> của <strong>Base_TaiSan</strong> và <strong>Base_DB</strong> mà không cần gọi API đồng bộ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Logs Table */}
              <div className="corporate-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} style={{ color: '#005baa' }} />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Lịch Sử Bắn Thông Điệp RabbitMQ (Event Logs)</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Tổng số: <strong>{eventList.length}</strong> sự kiện
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="corporate-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                        <th style={{ minWidth: '180px' }}>Loại sự kiện</th>
                        <th style={{ minWidth: '160px' }}>Routing Key</th>
                        <th style={{ minWidth: '140px' }}>Nguồn phát</th>
                        <th style={{ minWidth: '220px' }}>Phân hệ tiêu thụ (Consumers)</th>
                        <th style={{ minWidth: '150px' }}>Thời gian</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventList.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#8c8c8c' }}>
                            Chưa có sự kiện nào được ghi nhận. Bấm nút <strong>"Bắn Test Sự Kiện"</strong> để tạo thử nghiệm!
                          </td>
                        </tr>
                      ) : (
                        eventList.map((ev, idx) => (
                          <tr key={ev.id || idx}>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#6b7280' }}>
                              {idx + 1}
                            </td>
                            <td>
                              <span style={{
                                fontWeight: 700,
                                fontSize: '12px',
                                color: ev.eventType.includes('Created') ? '#005baa' : '#d97706',
                                background: ev.eventType.includes('Created') ? '#e6f4ff' : '#fef3c7',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: `1px solid ${ev.eventType.includes('Created') ? '#91caff' : '#fde68a'}`
                              }}>
                                {ev.eventType}
                              </span>
                            </td>
                            <td>
                              <code style={{ fontSize: '12px', color: '#4b5563', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                {ev.routingKey}
                              </code>
                            </td>
                            <td style={{ fontSize: '13px', color: '#374151' }}>
                              {ev.source}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {(ev.consumers || ['asset-service', 'kpi-service']).map((c, cIdx) => (
                                  <span key={cIdx} style={{ fontSize: '11px', background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', padding: '1px 6px', borderRadius: '3px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <CheckCheck size={11} />
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(ev.timestamp).toLocaleString('vi-VN')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  setSelectedEvent(ev);
                                  setIsEventModalOpen(true);
                                }}
                                className="btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '12px', color: '#005baa' }}
                              >
                                <Eye size={13} />
                                <span>Xem</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: CƠ CẤU TỔ CHỨC & PHÒNG BAN (MASTER DATA)      */}
          {/* ==================================================== */}
          {activeTab === 'departments' && (
            <DepartmentsTab token={token} notify={notify} onRefreshEvents={fetchEvents} />
          )}

        </main>
      </div>

      {/* ==================================================== */}
      {/* 3. MODALS CHO QUẢN LÝ NGƯỜI DÙNG                     */}
      {/* ==================================================== */}

      {/* MODAL 1: Thêm mới người dùng */}
      {isCreateUserModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Thêm Mới Người Dùng Hệ Thống</h3>
              </div>
              <button onClick={() => setIsCreateUserModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCreateUser}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Tên tài khoản (UserName) <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nhập tên đăng nhập (vd: nguyenvanan)..."
                  value={formUserName}
                  onChange={(e) => setFormUserName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Họ và tên hiển thị <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nhập họ và tên đầy đủ..."
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="email@company.vn"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="0987654321"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Mật khẩu khởi tạo
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mặc định: 123456"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Phân quyền vai trò ban đầu:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  {((roleList && roleList.length > 0) ? roleList : DEFAULT_SYSTEM_ROLES).map((r) => (
                    <label key={r.id || r.code} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#374151', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formRoles.includes(r.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormRoles([...formRoles, r.code]);
                          } else {
                            setFormRoles(formRoles.filter(code => code !== r.code));
                          }
                        }}
                      />
                      <span style={{ fontWeight: 600, color: '#005baa' }}>{r.code}</span>
                      <span style={{ fontSize: '11.5px', color: '#6b7280' }}>({r.name})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsCreateUserModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Lưu & Đồng bộ RabbitMQ
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Tạo tài khoản nhanh */}
      {isQuickCreateModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Tạo Nhanh Tài Khoản Người Dùng</h3>
              </div>
              <button onClick={() => setIsQuickCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickCreate}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Tên tài khoản <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: taisan_user1, kpi_canbo..."
                  value={quickUserName}
                  onChange={(e) => setQuickUserName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: Cán bộ Quản lý Tài sản..."
                  value={quickFullName}
                  onChange={(e) => setQuickFullName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Gán vai trò phân hệ
                </label>
                <select
                  className="input-field"
                  value={quickRole}
                  onChange={(e) => setQuickRole(e.target.value)}
                >
                  <option value="ROLE_TAISAN">ROLE_TAISAN - Quản lý Tài sản (:9797)</option>
                  <option value="ROLE_KPI">ROLE_KPI - Đánh giá KPI & Thi đua (:9696)</option>
                  <option value="ROLE_ROOM">ROLE_ROOM - Quản lý Phòng trọ (:4000)</option>
                  <option value="ADMIN">ADMIN - Quản trị viên toàn hệ thống</option>
                  <option value="USER">USER - Người dùng thông thường</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsQuickCreateModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Tạo & Phát Sự Kiện
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: Chỉnh sửa người dùng */}
      {isEditUserModalOpen && selectedUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Cập Nhật Người Dùng: <code>{selectedUser.userName}</code>
                </h3>
              </div>
              <button onClick={() => setIsEditUserModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Số điện thoại
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span>Tài khoản đang hoạt động (Active)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: Phân nhóm quyền */}
      {isAssignRolesModalOpen && selectedUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Phân Nhóm Quyền: <code>{selectedUser.userName}</code>
                </h3>
              </div>
              <button onClick={() => setIsAssignRolesModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '13px', color: '#6b7280' }}>
              Chọn các vai trò để phân quyền truy cập cho tài khoản <strong>{selectedUser.fullName || selectedUser.userName}</strong>. Thay đổi sẽ tự động được gửi qua <strong>RabbitMQ</strong>.
            </div>

            {/* Quick Select Buttons */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11.5px' }}
                onClick={() => {
                  const effective = (roleList && roleList.length > 0) ? roleList : DEFAULT_SYSTEM_ROLES;
                  setFormRoles(effective.map(r => r.code));
                }}
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11.5px' }}
                onClick={() => setFormRoles([])}
              >
                Bỏ chọn hết
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11.5px', color: '#135200', borderColor: '#b7eb8f', background: '#f6ffed' }}
                onClick={() => {
                  if (!formRoles.includes('ROLE_KPI')) setFormRoles([...formRoles, 'ROLE_KPI']);
                }}
              >
                + Đánh giá KPI
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11.5px', color: '#003eb3', borderColor: '#adc6ff', background: '#f0f5ff' }}
                onClick={() => {
                  if (!formRoles.includes('ROLE_TAISAN')) setFormRoles([...formRoles, 'ROLE_TAISAN']);
                }}
              >
                + Quản lý Tài sản
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '280px', overflowY: 'auto', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              {((roleList && roleList.length > 0) ? roleList : DEFAULT_SYSTEM_ROLES).map((r) => {
                const isChecked = formRoles.includes(r.code);
                return (
                  <div
                    key={r.id || r.code}
                    onClick={() => {
                      if (isChecked) {
                        setFormRoles(formRoles.filter(code => code !== r.code));
                      } else {
                        setFormRoles([...formRoles, r.code]);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      backgroundColor: isChecked ? '#e6f4ff' : '#ffffff',
                      border: `1px solid ${isChecked ? '#91caff' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => { }} // Controlled via parent div onClick
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span style={{
                      fontWeight: 700,
                      fontSize: '11.5px',
                      color: isChecked ? '#005baa' : '#4b5563',
                      backgroundColor: isChecked ? '#ffffff' : '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${isChecked ? '#91caff' : '#d1d5db'}`
                    }}>
                      {r.code}
                    </span>
                    <span style={{ fontSize: '13px', color: isChecked ? '#003a8c' : '#374151', fontWeight: isChecked ? 500 : 400 }}>
                      {r.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              <button onClick={() => setIsAssignRolesModalOpen(false)} className="btn-secondary">
                Hủy
              </button>
              <button onClick={handleSaveAssignRoles} className="btn-primary">
                Cập Nhật & Sync RabbitMQ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 5: Đổi mật khẩu */}
      {isChangePassModalOpen && selectedUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Đổi Mật Khẩu: <code>{selectedUser.userName}</code>
                </h3>
              </div>
              <button onClick={() => setIsChangePassModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu mới..."
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              <button onClick={() => setIsChangePassModalOpen(false)} className="btn-secondary">
                Hủy
              </button>
              <button onClick={handleSaveChangePass} className="btn-primary">
                Cập Nhật Mật Khẩu
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 6: Chi tiết người dùng */}
      {isUserDetailModalOpen && selectedUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '540px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={20} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Thông Tin Chi Tiết Tài Khoản</h3>
              </div>
              <button onClick={() => setIsUserDetailModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '13px', color: '#374151', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, color: '#6b7280' }}>Tài khoản:</div>
              <div style={{ fontWeight: 700, color: '#005baa' }}>{selectedUser.userName}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Họ và tên:</div>
              <div style={{ fontWeight: 600 }}>{selectedUser.fullName}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Email:</div>
              <div>{selectedUser.email || 'Chưa cập nhật'}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Điện thoại:</div>
              <div>{selectedUser.phoneNumber || 'Chưa cập nhật'}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Trạng thái:</div>
              <div>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: selectedUser.isActive ? '#f6ffed' : '#fff1f0',
                  color: selectedUser.isActive ? '#389e0d' : '#cf1322',
                  border: `1px solid ${selectedUser.isActive ? '#b7eb8f' : '#ffa39e'}`
                }}>
                  {selectedUser.isActive ? '● Đang hoạt động' : '● Đã bị khóa'}
                </span>
              </div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Nhóm quyền:</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {selectedUser.roles && selectedUser.roles.length > 0 ? (
                  selectedUser.roles.map((r, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#e6f4ff', color: '#005baa', border: '1px solid #91caff' }}>
                      {r}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#9ca3af' }}>Chưa có vai trò</span>
                )}
              </div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Thời gian tạo:</div>
              <div>{selectedUser.createdDate ? new Date(selectedUser.createdDate).toLocaleString('vi-VN') : '—'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              <button onClick={() => setIsUserDetailModalOpen(false)} className="btn-primary">
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* POPCONFIRM: Xác nhận Khóa / Mở khóa User */}
      {confirmToggleUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertCircle size={22} style={{ color: confirmToggleUser.isActive ? '#ff4d4f' : '#52c41a' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {confirmToggleUser.isActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5, marginBottom: '20px' }}>
              Bạn có chắc chắn muốn {confirmToggleUser.isActive ? 'khóa' : 'mở khóa'} tài khoản <strong>{confirmToggleUser.userName}</strong> ({confirmToggleUser.fullName})?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConfirmToggleUser(null)} className="btn-secondary">
                Hủy
              </button>
              <button
                onClick={handleConfirmToggleActiveUser}
                className="btn-primary"
                style={{ backgroundColor: confirmToggleUser.isActive ? '#ff4d4f' : '#52c41a', borderColor: confirmToggleUser.isActive ? '#ff4d4f' : '#52c41a' }}
              >
                {confirmToggleUser.isActive ? 'Khóa ngay' : 'Mở khóa'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* 4. MODALS CHO QUẢN LÝ VAI TRÒ                        */}
      {/* ==================================================== */}

      {/* MODAL 7: Thêm mới vai trò */}
      {isCreateRoleModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Thêm Mới Nhóm Quyền</h3>
              </div>
              <button onClick={() => setIsCreateRoleModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCreateRole}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Mã vai trò (Code) <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: ROLE_TAISAN_VIEWER, ROLE_KPI_LEADER..."
                  value={formRoleCode}
                  onChange={(e) => setFormRoleCode(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Tên vai trò hiển thị <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: Cán bộ xem tài sản văn phòng..."
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Phân loại phân hệ
                </label>
                <select
                  className="input-field"
                  value={formRoleType}
                  onChange={(e) => setFormRoleType(e.target.value)}
                >
                  <option value="GENERAL">Chung (GENERAL)</option>
                  <option value="ASSET">Cơ sở vật chất & Tài sản (ASSET)</option>
                  <option value="KPI">Đánh giá KPI & Thi đua (KPI)</option>
                  <option value="ROOM">Phòng trọ (ROOM)</option>
                  <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsCreateRoleModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Tạo Nhóm Quyền
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 8: Chỉnh sửa vai trò */}
      {isEditRoleModalOpen && selectedRole && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Chỉnh Sửa: <code>{selectedRole.code}</code>
                </h3>
              </div>
              <button onClick={() => setIsEditRoleModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Tên vai trò hiển thị
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Phân loại phân hệ
                </label>
                <select
                  className="input-field"
                  value={formRoleType}
                  onChange={(e) => setFormRoleType(e.target.value)}
                >
                  <option value="GENERAL">Chung (GENERAL)</option>
                  <option value="ASSET">Cơ sở vật chất & Tài sản (ASSET)</option>
                  <option value="KPI">Đánh giá KPI & Thi đua (KPI)</option>
                  <option value="ROOM">Phòng trọ (ROOM)</option>
                  <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formRoleIsActive}
                    onChange={(e) => setFormRoleIsActive(e.target.checked)}
                  />
                  <span>Có hiệu lực sử dụng (Active)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsEditRoleModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 9: Chi tiết vai trò */}
      {isRoleDetailModalOpen && selectedRole && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={20} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Chi Tiết Nhóm Quyền</h3>
              </div>
              <button onClick={() => setIsRoleDetailModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '13px', color: '#374151', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, color: '#6b7280' }}>Mã vai trò:</div>
              <div style={{ fontWeight: 700, color: '#005baa' }}>{selectedRole.code}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Tên vai trò:</div>
              <div style={{ fontWeight: 600 }}>{selectedRole.name}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Phân loại:</div>
              <div>{selectedRole.type || 'GENERAL'}</div>

              <div style={{ fontWeight: 600, color: '#6b7280' }}>Hiệu lực:</div>
              <div>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: selectedRole.isActive ? '#f6ffed' : '#fff1f0',
                  color: selectedRole.isActive ? '#389e0d' : '#cf1322',
                  border: `1px solid ${selectedRole.isActive ? '#b7eb8f' : '#ffa39e'}`
                }}>
                  {selectedRole.isActive ? '● Có hiệu lực' : '● Đã bị khóa'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              <button onClick={() => setIsRoleDetailModalOpen(false)} className="btn-primary">
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* POPCONFIRM: Xác nhận Xóa vai trò */}
      {confirmDeleteRole && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertCircle size={22} style={{ color: '#ff4d4f' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Xác nhận xóa nhóm quyền
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5, marginBottom: '20px' }}>
              Bạn có chắc chắn muốn xóa nhóm quyền <strong>{confirmDeleteRole.code}</strong> ({confirmDeleteRole.name}) không?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConfirmDeleteRole(null)} className="btn-secondary">
                Hủy
              </button>
              <button
                onClick={handleConfirmDeleteRole}
                className="btn-primary"
                style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 10: Chi tiết Event RabbitMQ */}
      {isEventModalOpen && selectedEvent && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: '#d97706' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Chi Tiết Sự Kiện: <code>{selectedEvent.eventType}</code>
                </h3>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '13px' }}>
              <div style={{ marginBottom: '6px' }}><strong>Routing Key:</strong> <code>{selectedEvent.routingKey}</code></div>
              <div style={{ marginBottom: '6px' }}><strong>Nguồn phát:</strong> {selectedEvent.source}</div>
              <div style={{ marginBottom: '6px' }}><strong>Thời gian:</strong> {new Date(selectedEvent.timestamp).toLocaleString('vi-VN')}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Payload JSON (Message Body):
              </div>
              <pre style={{ background: '#1e293b', color: '#38bdf8', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(JSON.parse(selectedEvent.payload || '{}'), null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
              <button onClick={() => setIsEventModalOpen(false)} className="btn-primary">
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
