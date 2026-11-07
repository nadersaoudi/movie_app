export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  photoUrl: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: number;
}
