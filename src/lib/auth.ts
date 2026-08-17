import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'nama@accessilearn.edu' },
        password: { label: 'Kata Sandi', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error('Akun dengan email tersebut tidak ditemukan dalam sistem tertutup.');
        }

        // Cek status persetujuan akun pada sistem tertutup
        if (user.status === 'PENDING') {
          throw new Error('Pendaftaran akun Anda masih MENUNGGU PERSETUJUAN dari Administrator.');
        }

        if (user.status === 'REJECTED') {
          throw new Error('Pendaftaran akun Anda telah DITOLAK oleh Administrator.');
        }

        // Verifikasi kata sandi
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          requiresExtendedTime: user.requiresExtendedTime,
          timeMultiplier: user.timeMultiplier,
          preferredTheme: user.preferredTheme,
          preferredFont: user.preferredFont,
          fontSizeMultiplier: user.fontSizeMultiplier,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.requiresExtendedTime = (user as any).requiresExtendedTime;
        token.timeMultiplier = (user as any).timeMultiplier;
        token.preferredTheme = (user as any).preferredTheme;
        token.preferredFont = (user as any).preferredFont;
        token.fontSizeMultiplier = (user as any).fontSizeMultiplier;
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).requiresExtendedTime = token.requiresExtendedTime;
        (session.user as any).timeMultiplier = token.timeMultiplier;
        (session.user as any).preferredTheme = token.preferredTheme;
        (session.user as any).preferredFont = token.preferredFont;
        (session.user as any).fontSizeMultiplier = token.fontSizeMultiplier;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'inclusive-lms-super-secret-key-2026',
};
