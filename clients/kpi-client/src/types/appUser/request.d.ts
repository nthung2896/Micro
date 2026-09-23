
export interface AppUserEditViewModelType  {
  familyName?: string;
  name?: string;
  givenName?: string;
  gender: number;
  cCCD?: string;
  avatar?: string;
  phoneNumber?: string;
  email?: string;
  diaChi?: string;
  ngaySinh?: Date;
}

export interface ChangePasswordViewModelType  {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  userId?: string;
}

export interface ForgotPasswordViewModelType  {
  userName?: string;
  email?: string;
  url?: string;
}

export interface LoginViewModelType  {
  userName?: string;
  password?: string;
}

export interface LoginSSOViewModelType  {
  code?: string;
}

export interface ProfileUserEditRequestType  {
  id?: string;
  name?: string;
  email?: string;
  gender: number;
  ngaySinh?: Date;
  phoneNumber?: string;
  diaChi?: string;
  isKySo?: boolean;
}

export interface RegisterViewModelType  {
  email?: string;
  name?: string;
  gender?: number;
  userName?: string;
  password?: string;
  confirmPassword?: string;
  diaChi?: string;
  phoneNumber?: string;
}

export interface RegisterRequestType {
  fullName?: string;
  phoneNumber?: string;
  password?: string;
  accountType?: string;
  referralPhone?: string;
  userName?: string;
  email?: string;
}

export interface ResetPasswordViewModelType  {
  userName?: string;
  password?: string;
  confirmPassword?: string;
  token?: string;
}

