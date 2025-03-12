export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
  workspaceRole: string;
  workspace: string;
  createdAt: number;
  updatedAt: number;
}