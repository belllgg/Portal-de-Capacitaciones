// src/app/interfaces/user.interface.ts
export interface User {
  id?: number;
  email: string;
  name: string;
  role: string | number;
  password?: string;
  stateId?: number;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: string | number;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  roleId?: number;
  stateId?: number;
}