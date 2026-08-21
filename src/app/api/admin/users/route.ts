import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizePlainText } from '@/lib/sanitize';

// GET /api/admin/users - Ambil semua pengguna beserta metriknya (Hanya untuk ADMIN)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Administrator yang berhak mengakses manajemen pengguna.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        registrationNote: true,
        requiresExtendedTime: true,
        timeMultiplier: true,
        preferredTheme: true,
        preferredFont: true,
        enableReadingRuler: true,
        createdAt: true,
        _count: {
          select: {
            coursesTaught: true,
            quizSubmissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = users.filter((u) => u.status === 'APPROVED').length;
    const totalPending = users.filter((u) => u.status === 'PENDING').length;
    const totalInstructors = users.filter((u) => u.role === 'INSTRUCTOR' && u.status === 'APPROVED').length;
    const totalStudents = users.filter((u) => u.role === 'STUDENT' && u.status === 'APPROVED').length;
    const totalAccommodated = users.filter((u) => u.requiresExtendedTime && u.status === 'APPROVED').length;
    const totalCourses = await prisma.course.count();

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        totalPending,
        totalInstructors,
        totalStudents,
        totalAccommodated,
        totalCourses,
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna' }, { status: 500 });
  }
}

// POST /api/admin/users - Buat akun pengguna baru langsung aktif (Hanya untuk ADMIN)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Administrator yang berhak membuat akun pengguna.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, requiresExtendedTime, timeMultiplier } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nama pengguna harus minimal 2 karakter.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Kata sandi harus minimal 8 karakter untuk keamanan.' }, { status: 400 });
    }

    const validRoles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];
    const safeRole = role && validRoles.includes(role) ? role : 'STUDENT';

    let safeMultiplier = 1.5;
    if (timeMultiplier !== undefined) {
      const parsed = Number(timeMultiplier);
      if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 3.0) {
        safeMultiplier = parsed;
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email tersebut sudah terdaftar dalam sistem.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: sanitizePlainText(name),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: safeRole,
        status: 'APPROVED',
        requiresExtendedTime: Boolean(requiresExtendedTime),
        timeMultiplier: safeMultiplier,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        requiresExtendedTime: true,
        timeMultiplier: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    return NextResponse.json({ error: 'Gagal membuat pengguna baru' }, { status: 500 });
  }
}
