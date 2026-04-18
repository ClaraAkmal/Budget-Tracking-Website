export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  idToken?: string;
  expiresIn?: string;
}