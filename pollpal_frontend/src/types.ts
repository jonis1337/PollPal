export interface User {
  id: string;
  username: string;
}

export interface Poll {
  id: string;
  question: string;
  createdBy: string;
  createdAt: Date;
  votes: {
    yes: number;
    no: number;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}