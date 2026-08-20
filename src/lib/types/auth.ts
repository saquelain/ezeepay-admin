export type UserRole = "superadmin" | "admin" | "editor";
export type UserStatus = "active" | "inactive";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
};