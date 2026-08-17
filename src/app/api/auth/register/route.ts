import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi (minimal 2 karakter).' }, { status: 400 });
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
      return NextResponse.json(
        { error: 'Email tersebut sudah terdaftar dalam sistem. Silakan masuk atau gunakan email lain.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT',
        status: 'PENDING', // Wajib disetujui Admin pada sistem tertutup
        registrationNote: registrationNote ? registrationNote.trim() : null,
        requiresExtendedTime: Boolean(requiresExtendedTime),
        timeMultiplier: timeMultiplier ? Number(timeMultiplier) : 1.5,
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
