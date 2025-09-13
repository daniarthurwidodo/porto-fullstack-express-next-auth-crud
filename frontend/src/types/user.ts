export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  isActive: boolean
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: number
}

export interface UserFormData {
  id?: number
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}
