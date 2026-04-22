import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { type NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { normalizeEmail } from '@/lib/request-security';
import { createUsernameSeed, getDisplayName, getResolvedAvatarUrl } from '@/lib/profile';

function getOAuthAvatarUrl(provider?: string, profile?: Record<string, unknown>) {
  if (!provider || !profile) return null

  if (provider === 'github' && typeof profile.avatar_url === 'string') {
    return profile.avatar_url
  }

  if (provider === 'google' && typeof profile.picture === 'string') {
    return profile.picture
  }

  return null
}

function getOAuthUsernameSeed(
  provider?: string,
  profile?: Record<string, unknown>,
  fallback?: string | null
) {
  if (provider === 'github' && typeof profile?.login === 'string') {
    return createUsernameSeed(profile.login)
  }

  if (provider === 'google' && typeof profile?.email === 'string') {
    return createUsernameSeed(profile.email.split('@')[0] || fallback || undefined)
  }

  return createUsernameSeed(fallback)
}

async function createAvailableUsername(baseValue: string, currentUserId: string) {
  let candidate = createUsernameSeed(baseValue)
  let suffix = 1

  while (
    await prisma.user.findFirst({
      where: {
        id: { not: currentUserId },
        username: candidate,
      },
      select: { id: true },
    })
  ) {
    candidate = `${createUsernameSeed(baseValue).slice(0, 27)}_${suffix}`
    suffix += 1
  }

  return candidate
}

type ProfileSyncUser = {
  avatarUrl?: string | null
  email?: string | null
  image?: string | null
  name?: string | null
  username?: string | null
}

async function syncProfileFields(
  userId: string,
  currentUser: ProfileSyncUser | null | undefined,
  options: {
    avatarUrl?: string | null
    usernameSeed?: string | null
  } = {}
) {
  if (!currentUser) {
    return null
  }

  const updateData: Record<string, unknown> = {}
  const nextAvatarUrl = options.avatarUrl?.trim()

  if (nextAvatarUrl && (currentUser.avatarUrl !== nextAvatarUrl || currentUser.image !== nextAvatarUrl)) {
    updateData.avatarUrl = nextAvatarUrl
    updateData.image = nextAvatarUrl
  } else if (!currentUser.avatarUrl && currentUser.image) {
    updateData.avatarUrl = currentUser.image
  }

  if (!currentUser.username) {
    updateData.username = await createAvailableUsername(
      options.usernameSeed || currentUser.name || currentUser.email || 'typist',
      userId
    )
  }

  if (Object.keys(updateData).length === 0) {
    return null
  }

  const result = await prisma.user.updateMany({
    where: { id: userId },
    data: updateData,
  })

  return result.count > 0 ? updateData : null
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    // Enable GitHub social login. Users can sign in using their GitHub account credentials.
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Invalid credentials');
        }

        const email = normalizeEmail(credentials.email);
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
        });
        if (!user || !user.hashedPassword) {
          const socialAccount = await prisma.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: 'insensitive',
              },
              hashedPassword: null,
            },
            select: { id: true },
          });

          if (socialAccount) {
            throw new Error('Use Google or GitHub sign-in for this account.');
          }

          throw new Error('Invalid credentials');
        }
        if (user.isBanned) {
          throw new Error('Account access restricted');
        }
        const isValid = await compare(credentials.password, user.hashedPassword);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.id) {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true, email: true, image: true, isBanned: true, name: true, username: true },
      });

      if (!dbUser) {
        return true;
      }

      if (dbUser?.isBanned) {
        return false;
      }

      const oauthAvatarUrl = getOAuthAvatarUrl(account?.provider, profile as Record<string, unknown> | undefined)
      await syncProfileFields(user.id, dbUser, {
        avatarUrl: oauthAvatarUrl,
        usernameSeed: getOAuthUsernameSeed(
          account?.provider,
          profile as Record<string, unknown> | undefined,
          user.name || user.email || null
        ),
      })

      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.name = (token.name as string) || session.user.name;
        session.user.username = (token.username as string | null) ?? null;
        session.user.nickname = (token.nickname as string | null) ?? null;
        session.user.handle = (token.handle as string | null) ?? null;
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
        session.user.image = (token.avatarUrl as string | null) ?? session.user.image;
        session.user.profileNudgeDismissed = Boolean(token.profileNudgeDismissed);
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        if ('name' in session) token.name = session.name || token.name
        if ('username' in session) token.username = session.username ?? null
        if ('nickname' in session) token.nickname = session.nickname ?? null
        if ('handle' in session) token.handle = session.handle ?? null
        if ('avatarUrl' in session) token.avatarUrl = session.avatarUrl ?? null
        if ('profileNudgeDismissed' in session) {
          token.profileNudgeDismissed = Boolean(session.profileNudgeDismissed)
        }
        return token
      }

      const userId = user?.id || token.sub

      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            avatarUrl: true,
            email: true,
            handle: true,
            image: true,
            name: true,
            nickname: true,
            profileNudgeDismissed: true,
            role: true,
            username: true,
          },
        });

        const syncedFields = dbUser
          ? await syncProfileFields(userId, dbUser, {
              usernameSeed: getOAuthUsernameSeed(
                undefined,
                undefined,
                dbUser.username || dbUser.name || dbUser.email || (user as any)?.email || token.email
              ),
            })
          : null
        const effectiveUser = dbUser ? { ...dbUser, ...syncedFields } : null

        token.role = effectiveUser?.role || (user as any)?.role || token.role;
        token.username = effectiveUser?.username ?? null;
        token.nickname = effectiveUser?.nickname ?? null;
        token.handle = effectiveUser?.handle ?? null;
        token.avatarUrl = getResolvedAvatarUrl(effectiveUser);
        token.name = getDisplayName(
          {
            email: (user as any)?.email || token.email,
            name: effectiveUser?.name || user?.name || (token.name as string | undefined),
            nickname: effectiveUser?.nickname,
            username: effectiveUser?.username,
          },
          'Typist'
        );
        token.profileNudgeDismissed = Boolean(effectiveUser?.profileNudgeDismissed);
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) {
        return
      }

      await syncProfileFields(
        user.id,
        {
          avatarUrl: null,
          email: user.email,
          image: user.image,
          name: user.name,
          username: null,
        },
        {
          avatarUrl: user.image,
          usernameSeed: getOAuthUsernameSeed(undefined, undefined, user.name || user.email || null),
        }
      )
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
