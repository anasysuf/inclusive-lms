import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nama pengguna harus minimal 2 karakter.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi harus minimal 6 karakter.' }, { status: 400 });
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
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'STUDENT',
        status: 'APPROVED',
        requiresExtendedTime: Boolean(requiresExtendedTime),
        timeMultiplier: timeMultiplier ? Number(timeMultiplier) : 1.5,
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
