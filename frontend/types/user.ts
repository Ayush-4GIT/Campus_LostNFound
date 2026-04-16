export interface User {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  avatarUrl?: string | null;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}
