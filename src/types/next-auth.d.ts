import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      avatarUrl?: string | null;
      handle?: string | null;
      id: string;
      nickname?: string | null;
      profileNudgeDismissed?: boolean;
      role?: string;
      username?: string | null;
    };
  }

  interface User {
    avatarUrl?: string | null;
    handle?: string | null;
    nickname?: string | null;
    profileNudgeDismissed?: boolean;
    role?: string;
    username?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    avatarUrl?: string | null;
    handle?: string | null;
    nickname?: string | null;
    profileNudgeDismissed?: boolean;
    role?: string;
    username?: string | null;
  }
}
