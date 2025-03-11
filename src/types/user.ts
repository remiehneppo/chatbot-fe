export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  workspaceRole: string;
  workspace: string;
  createdAt: number;
  updatedAt: number;
}