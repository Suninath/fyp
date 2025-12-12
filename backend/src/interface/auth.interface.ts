export interface LoginResult {
  success: boolean;
  status: number;
  message: string;
}

export interface JwtPayLoadWithId {
  id: string;
  email: string;
  role: string;
}
