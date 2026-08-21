import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sanitizePlainText } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      registrationNote,
      requiresExtendedTime,
      timeMultiplier,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi (minimal 2 karakter).' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Kata sandi harus minimal 8 karakter.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email tersebut sudah terdaftar dalam sistem. Silakan masuk atau gunakan email lain.' },
        { status: 400 }
      );
    }

    // Role hanya boleh STUDENT atau INSTRUCTOR saat registrasi mandiri (ADMIN dilarang keras)
    const safeRole = role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';

    let safeMultiplier = 1.5;
    if (timeMultiplier !== undefined) {
      const parsed = Number(timeMultiplier);
      if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 3.0) {
        safeMultiplier = parsed;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: sanitizePlainText(name),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: safeRole,
        status: 'PENDING', // Wajib disetujui Admin pada sistem tertutup
        registrationNote: registrationNote && typeof registrationNote === 'string' ? sanitizePlainText(registrationNote) : null,
        requiresExtendedTime: Boolean(requiresExtendedTime),
        timeMultiplier: safeMultiplier,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran berhasil dikirim! Menunggu persetujuan Administrator.',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses pendaftaran.' },
      { status: 500 }
    );
  }
}
