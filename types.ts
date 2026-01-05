
export interface Memo {
  id: string;
  content: string;
  createdAt: number;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}
