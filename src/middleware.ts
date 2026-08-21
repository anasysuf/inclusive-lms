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

    // 3. Proteksi Endpoint API Admin
    if (pathname.startsWith('/api/admin')) {
      if (userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Akses Ditolak: Memerlukan hak akses Administrator.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Rute publik tidak memerlukan token
        if (
          pathname === '/login' ||
          pathname === '/register' ||
          pathname === '/' ||
          pathname === '/unauthorized' ||
          pathname.startsWith('/api/auth')
        ) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Terapkan proteksi sistem tertutup pada semua halaman dan API internal
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
    '/api/admin/:path*',
    '/api/courses/:path*',
    '/api/lessons/:path*',
    '/api/quizzes/:path*',
    '/api/users/:path*',
  ],
};
