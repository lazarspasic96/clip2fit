import type { Session, User } from "@supabase/supabase-js";

export type AuthSession = Session;
export type AuthUser = User;

export interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  signIn: (credentials: LoginCredentials) => Promise<AuthResult>;
  signUp: (credentials: SignupCredentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}
