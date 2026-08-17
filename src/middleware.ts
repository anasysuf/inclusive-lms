import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = token?.role as string;

    // 1. Proteksi Rute Khusus Administrator
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // 2. Proteksi Rute Studio Pengajar (Hanya Instruktur dan Admin)
    if (pathname.startsWith('/instructor')) {
      if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Terapkan proteksi sistem tertutup pada semua halaman kursus, admin, dan studio pengajar
export const config = {
  matcher: [
    '/courses/:path*',
    '/courses',
    '/instructor/:path*',
    '/instructor',
    '/admin/:path*',
    '/admin',
    '/profile/:path*',
    '/profile',
  ],
};
