import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Mengisi ulang database dengan materi pembelajaran berbahasa Indonesia...');

  // Hapus data lama
  await prisma.quizSubmission.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultHashedPassword = await bcrypt.hash('password123', 10);

  // 1. Buat Akun Administrator Utama (Akses Penuh & Manajemen Akun)
  await prisma.user.create({
    data: {
      name: 'Administrator Utama (Admin AccessiLearn)',
      email: 'admin@accessilearn.edu',
      password: defaultHashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      requiresExtendedTime: false,
      preferredTheme: 'default',
      preferredFont: 'system',
      fontSizeMultiplier: 1.0,
    },
  });

  // 2. Buat Data Instruktur / Dosen PLB
  const instructor = await prisma.user.create({
    data: {
      name: 'Dr. Maya Lin, M.Pd.',
      email: 'maya.lin@accessilearn.edu',
      password: defaultHashedPassword,
      role: 'INSTRUCTOR',
      status: 'APPROVED',
      requiresExtendedTime: false,
      preferredTheme: 'default',
      preferredFont: 'system',
      fontSizeMultiplier: 1.0,
    },
  });

  // 3. Buat Siswa Standar
  await prisma.user.create({
    data: {
      name: 'Alex Wijaya',
      email: 'alex.wijaya@accessilearn.edu',
      password: defaultHashedPassword,
      role: 'STUDENT',
      status: 'APPROVED',
      requiresExtendedTime: false,
      timeMultiplier: 1.0,
      preferredTheme: 'default',
      preferredFont: 'system',
      fontSizeMultiplier: 1.0,
    },
  });

  // 4. Buat Siswa dengan Akomodasi Waktu Tambahan (Pendidikan Khusus)
  await prisma.user.create({
    data: {
      name: 'Jordan Pratama (Penerima Akomodasi Khusus)',
      email: 'jordan.pratama@accessilearn.edu',
      password: defaultHashedPassword,
      role: 'STUDENT',
      status: 'APPROVED',
      requiresExtendedTime: true,
      timeMultiplier: 1.5,
      preferredTheme: 'high-contrast-dark',
      preferredFont: 'dyslexic',
      fontSizeMultiplier: 1.2,
      enableReadingRuler: true,
    },
  });

  // 5. Pendaftar Pengajar Menunggu Persetujuan Admin (Demo Approval Flow)
  await prisma.user.create({
    data: {
      name: 'Rizky Kurniawan, S.Pd.',
      email: 'rizky.kurniawan@sekolahluarbiasa.sch.id',
      password: defaultHashedPassword,
      role: 'INSTRUCTOR',
      status: 'PENDING',
      registrationNote: 'Guru Pendidikan Luar Biasa di SLB Negeri 1. Ingin menerbitkan materi pengenalan huruf Braille dan mobilitas orientasi tuna netra.',
      requiresExtendedTime: false,
    },
  });

  // 6. Pendaftar Siswa Menunggu Persetujuan Admin (Demo Approval Flow)
  await prisma.user.create({
    data: {
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@student.edu',
      password: defaultHashedPassword,
      role: 'STUDENT',
      status: 'PENDING',
      registrationNote: 'Siswa dengan diagnosis disleksia dan ADHD. Memerlukan bantuan penggaris fokus baca dan perpanjangan durasi kuis 1.5x.',
      requiresExtendedTime: true,
      timeMultiplier: 1.5,
    },
  });

  // 4. Kursus 1: Universal Design for Learning (UDL)
  await prisma.course.create({
    data: {
      title: 'Penerapan Universal Design for Learning (UDL) dalam Pembelajaran Inklusif',
      description:
        'Kelas master pedagogis komprehensif yang membahas cara merancang kurikulum dan lingkungan belajar inklusif yang mendukung keragaman profil kognitif, visual, dan motorik peserta didik.',
      category: 'Pendidikan Luar Biasa & Pedagogi',
      difficulty: 'Pemula hingga Menengah',
      coverImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt:
        'Ruang kelas inklusif dengan materi pembelajaran taktil, buku panduan Braille, dan perangkat tablet digital adaptif.',
      instructorId: instructor.id,
      lessons: {
        create: [
          {
            order: 1,
            title: '1. Pengenalan Prinsip UDL & Keberagaman Kognitif',
            summary:
              'Memahami 3 pilar utama Universal Design for Learning: Keterlibatan (Engagement), Representasi (Representation), dan Aksi/Ekspresi (Action).',
            content: `
              <h2>Selamat Datang dalam Universal Design for Learning (UDL)</h2>
              <p>Universal Design for Learning (UDL) adalah kerangka kerja pendidikan berbasis riset neurosains kognitif yang memandu perancangan lingkungan dan materi belajar agar fleksibel serta dapat mengakomodasi perbedaan individu sejak awal.</p>
              
              <h3>Tiga Pilar Fondasi UDL</h3>
              <ul>
                <li><strong>Beragam Cara Keterlibatan (The "Why" of Learning):</strong> Memicu minat, ketekunan, dan motivasi belajar melalui otonomi, relevansi materi, serta pengelolaan kecemasan ujian.</li>
                <li><strong>Beragam Cara Representasi (The "What" of Learning):</strong> Menyajikan konsep dan informasi dalam berbagai modalitas (teks terstruktur, deskripsi audio, subtitel video, diagram visual).</li>
                <li><strong>Beragam Cara Aksi dan Ekspresi (The "How" of Learning):</strong> Memberikan variasi cara bagi siswa untuk mengekspresikan pemahaman mereka (navigasi keyboard, pengenalan suara, kuis berdurasi terakomodasi).</li>
              </ul>

              <blockquote>
                <p>"Keadilan dalam pendidikan bukanlah memberikan hal yang sama persis kepada setiap orang. Keadilan sejati adalah memberikan apa yang dibutuhkan setiap individu agar dapat meraih keberhasilan."</p>
                <footer>— Center for Applied Special Technology (CAST)</footer>
              </blockquote>

              <h3>Prinsip Utama bagi Pendidik</h3>
              <p>Merancang pembelajaran dengan aksesibilitas sejak awal meniadakan biaya tinggi dan kesulitan adaptasi di masa mendatang. Materi yang mudah dibaca oleh siswa dengan gangguan penglihatan (low vision) juga akan sangat nyaman dibaca oleh siapa saja di layar ponsel saat kondisi silau atau kelelahan mata.</p>
            `,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            captionsUrl: '/captions/lesson1-udl.vtt',
            audioUrl: '',
            hasTranscript: true,
            transcript: `[00:00] Selamat datang dalam materi Pengantar Universal Design for Learning (UDL). Saya Dr. Maya Lin.
[00:08] Dalam modul ini, kita membedah bagaimana keberagaman kognitif memengaruhi pemrosesan informasi belajar.
[00:20] Pendidikan konvensional kerap mengasumsikan adanya "siswa rata-rata". Kenyataannya, riset neurologis menunjukkan bahwa setiap otak memiliki karakteristik unik.
[00:45] Tiga pilar UDL menjadi peta jalan: Keterlibatan, Representasi, dan Aksi/Ekspresi.
[01:15] Melalui subtitel teks tertutup, transkrip verbatim, dan opsi kontras tinggi, kita memampukan setiap peserta didik belajar mandiri.
[01:45] Terima kasih telah bergabung. Silakan lanjutkan ke evaluasi kuis pemahaman materi.`,
            quizzes: {
              create: [
                {
                  title: 'Kuis Pemahaman Fondasi UDL',
                  description:
                    'Uji pemahaman Anda mengenai 3 pilar UDL dan standar akomodasi kognitif.',
                  baseTimeLimit: 180, // 3 menit
                  questions: JSON.stringify([
                    {
                      id: 'q1',
                      question: 'Apa sajakah tiga pilar utama dalam kerangka kerja Universal Design for Learning (UDL)?',
                      options: [
                        'Keterlibatan (Engagement), Representasi (Representation), dan Aksi & Ekspresi (Action & Expression)',
                        'Menghafal, Ujian Tertulis, dan Penilaian Angka',
                        'Membaca, Menulis, dan Berhitung saja',
                        'Visual, Auditori, dan Kinestetik semata',
                      ],
                      correctIndex: 0,
                      explanation:
                        'Panduan UDL dari CAST disusun berdasarkan 3 jaringan saraf utama otak: Afektif (Engagement), Pengenalan (Representation), dan Strategis (Action & Expression).',
                    },
                    {
                      id: 'q2',
                      question:
                        'Mengapa penyediaan beragam cara representasi sangat penting untuk aksesibilitas kognitif?',
                      options: [
                        'Memungkinkan siswa dengan berbagai profil pemrosesan sensori dan visual memahami konsep inti tanpa hambatan.',
                        'Hanya membuat kurikulum menjadi lebih panjang dan rumit.',
                        'Hanya berguna bagi siswa dengan diagnosis tuna rungu.',
                        'Menghilangkan seluruh kebutuhan materi teks tertulis.',
                      ],
                      correctIndex: 0,
                      explanation:
                        'Representasi jamak (video, subtitel, transkrip, teks ringkas) menjamin aksesibilitas kognitif dan sensori bagi seluruh spektrum peserta didik.',
                    },
                    {
                      id: 'q3',
                      question:
                        'Berdasarkan standar WCAG 2.1 AA, berapakah rasio kontras warna minimum yang diwajibkan untuk teks konten biasa?',
                      options: ['4.5:1', '3.0:1', '2.0:1', '7.0:1'],
                      correctIndex: 0,
                      explanation:
                        'WCAG 2.1 AA mensyaratkan rasio kontras minimal 4.5:1 untuk teks biasa dan 3:1 untuk teks berukuran besar (18pt/24px atau 14pt tebal).',
                    },
                  ]),
                },
              ],
            },
          },
          {
            order: 2,
            title: '2. Merancang Pembelajaran untuk Neurodiversity: ADHD, Disleksia, dan Autisme',
            summary:
              'Menerapkan panduan visual, penggaris fokus baca, tata letak bebas distraksi, dan navigasi yang terprediksi.',
            content: `
              <h2>Lingkungan Belajar Ramah Neurodivergen</h2>
              <p>Merancang ruang digital bagi individu neurodivergen berarti mereduksi kelebihan beban sensorik, memperjelas keterbacaan kognitif, dan menyediakan umpan balik interaktif yang konsisten.</p>

              <h3>1. Pertimbangan Khusus Disleksia</h3>
              <p>Disleksia memengaruhi pemrosesan fonologis dan rekognisi kata visual cepat. Strategi desain yang direkomendasikan:</p>
              <ul>
                <li>Menyediakan tipografi khusus seperti <strong>OpenDyslexic</strong> atau sans-serif berketerbacaan tinggi (contoh: Lexend / Atkinson Hyperlegible).</li>
                <li>Memberikan jarak antar-baris yang longgar (1.6x hingga 2.0x) serta spasi huruf yang memadai.</li>
                <li>Menghindari teks hitam pekat di atas latar putih terang; latar belakang krem lembut mereduksi stres visual (sindrom scotopic).</li>
              </ul>

              <h3>2. Manajemen Fokus untuk ADHD</h3>
              <ul>
                <li>Sediakan penggaris fokus baca (reading ruler) untuk memandu penelusuran baris.</li>
                <li>Hilangkan animasi otomatis berputar atau notifikasi berkedip yang mengalihkan perhatian.</li>
                <li>Bagi modul belajar menjadi bagian-bagian kecil (chunking) dengan indikator kemajuan yang jelas.</li>
              </ul>

              <h3>3. Spektrum Autisme & Kepastian Navigasi</h3>
              <ul>
                <li>Pertahankan konsistensi wilayah landmark navigasi di seluruh halaman.</li>
                <li>Berikan instruksi dan tujuan yang jelas sebelum aktivitas ujian berbasis waktu dimulai.</li>
                <li>Sediakan akomodasi waktu tambahan tanpa elemen antarmuka yang memberi rasa malu/stigma.</li>
              </ul>
            `,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            captionsUrl: '/captions/lesson2-neurodiversity.vtt',
            audioUrl: '',
            hasTranscript: true,
            transcript: `[00:00] Dalam materi ini, kita membahas bagaimana peserta didik neurodivergen menavigasi materi digital.
[00:15] Perhatikan bagaimana popup tak terduga atau animasi berkedip dapat memicu stres sensorik berlebih.
[00:35] Opsi kontras tinggi, huruf ramah disleksia, dan penggaris fokus baca memampukan akomodasi mandiri.
[01:00] Pastikan ujian berbasis waktu menyediakan pemicu akomodasi waktu tambahan yang transparan dan mudah diakses.`,
            quizzes: {
              create: [
                {
                  title: 'Kuis Desain Ramah Neurodiversity',
                  description:
                    'Uji pengetahuan Anda tentang tipografi disleksia, reduksi sensorik, dan penggaris fokus baca.',
                  baseTimeLimit: 180,
                  questions: JSON.stringify([
                    {
                      id: 'q1',
                      question:
                        'Fitur apakah yang sangat membantu siswa dengan disleksia dan ADHD menelusuri baris bacaan tanpa kehilangan fokus konteks?',
                      options: [
                        'Penggaris Fokus Baca (Reading Ruler Guide)',
                        'Banner berkedip warna-warni terang',
                        'Ukuran font kecil 10px jenis serif',
                        'Teks carousel yang bergulir otomatis',
                      ],
                      correctIndex: 0,
                      explanation:
                        'Penggaris fokus membaca menciptakan pita sorotan horizontal yang mereduksi kepadatan visual dan membantu menjaga penelusuran baris teks.',
                    },
                    {
                      id: 'q2',
                      question:
                        'Bagaimanakah akomodasi waktu tambahan membantu peserta didik neurodivergen dan hambatan motorik dalam asesmen?',
                      options: [
                        'Meredakan kecemasan pemrosesan dan mengakomodasi navigasi teknologi asistif tanpa mengurangi kedalaman pemahaman materi.',
                        'Membuat soal otomatis menjadi sangat mudah.',
                        'Memberikan nilai sempurna secara instan.',
                        'Menonaktifkan seluruh navigasi keyboard.',
                      ],
                      correctIndex: 0,
                      explanation:
                        'Waktu tambahan mengakomodasi durasi yang dibutuhkan untuk pembacaan screen-reader, perangkat switch access, dan waktu pemrosesan kognitif mandiri.',
                    },
                  ]),
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. Kursus 2: Standar Aksesibilitas Web (WCAG 2.1 AA)
  await prisma.course.create({
    data: {
      title: 'Standar Aksesibilitas Web (WCAG 2.1 AA) & Teknologi Asistif',
      description:
        'Panduan praktis penguasaan HTML semantik, teknik WAI-ARIA, pengelolaan fokus keyboard, dan kompatibilitas pembaca layar (screen reader) bagi pengembang platform edukasi inklusif.',
      category: 'Aksesibilitas Web & Teknologi Asistif',
      difficulty: 'Menengah',
      coverImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt:
        'Foto jarak dekat jari-jemari mengetik pada keyboard ergonomis di samping terminal layar Braille elektronik.',
      instructorId: instructor.id,
      lessons: {
        create: [
          {
            order: 1,
            title: '1. HTML Semantik dan Wilayah Landmark Web',
            summary:
              'Mempelajari mengapa tag <header>, <nav>, <main>, <article>, <aside>, dan <footer> adalah fondasi utama arsitektur web aksesibel.',
            content: `
              <h2>Kekuatan HTML Semantik Asli</h2>
              <p>Teknologi asistif seperti pembaca layar (NVDA, JAWS, VoiceOver, TalkBack) bergantung sepenuhnya pada tag HTML semantik untuk membangun pohon aksesibilitas (accessibility tree) yang dapat dinavigasi pengguna dengan cepat.</p>

              <h3>Landmark Utama</h3>
              <ol>
                <li><code>&lt;header&gt;</code>: Mendefinisikan konten pembuka atau banner navigasi utama.</li>
                <li><code>&lt;nav aria-label="..."&gt;</code>: Mengidentifikasi navigasi situs. Selalu sertakan <code>aria-label</code> jika terdapat lebih dari satu navigasi pada halaman.</li>
                <li><code>&lt;main id="main-content"&gt;</code>: Konten pokok dari dokumen. Wajib menjadi target dari tautan lompat (skip link).</li>
                <li><code>&lt;article&gt;</code>: Komposisi mandiri dalam dokumen (contoh: isi materi pelajaran).</li>
                <li><code>&lt;aside&gt;</code>: Konten pendukung yang relevan secara tidak langsung (contoh: silabus materi, daftar referensi).</li>
              </ol>

              <h3>Manajemen Fokus Keyboard</h3>
              <p>Setiap elemen interaktif wajib memberikan garis fokus yang jelas dan kontras tinggi. Pada Tailwind CSS, kita menerapkan:</p>
              <pre><code>focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2</code></pre>
            `,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            captionsUrl: '/captions/lesson1-wcag.vtt',
            audioUrl: '',
            hasTranscript: true,
            transcript: `[00:00] Dalam materi ini, kita membahas wilayah landmark HTML semantik.
[00:12] Pengguna screen reader menavigasi web dengan menekan tombol 'H' untuk membaca judul atau 'D' untuk melompat antar-landmark.
[00:30] Situs yang tidak terstruktur dengan baik memaksa pengguna pembaca layar mendengarkan seluruh konten dari baris pertama.
[00:55] Selalu tentukan satu judul h1 per halaman dan susun subjudul h2 serta h3 secara logis.`,
            quizzes: {
              create: [
                {
                  title: 'Kuis HTML Semantik & Landmark Aksesibel',
                  description:
                    'Uji pemahaman Anda tentang wilayah landmark, hierarki judul, dan tautan lompat (skip links).',
                  baseTimeLimit: 240,
                  questions: JSON.stringify([
                    {
                      id: 'q1',
                      question:
                        'Apakah fungsi utama dari tautan "Lompat ke Konten Utama" (Skip to Main Content) di bagian paling atas halaman?',
                      options: [
                        'Memungkinkan pengguna keyboard dan screen reader melompati menu navigasi atas yang berulang langsung menuju area materi utama.',
                        'Menutup tab browser secara langsung.',
                        'Menerjemahkan seluruh isi halaman ke bahasa lain secara otomatis.',
                        'Hanya berupa hiasan desain bagi pengembang.',
                      ],
                      correctIndex: 0,
                      explanation:
                        'Kriteria WCAG 2.4.1 (Bypass Blocks) mensyaratkan adanya mekanisme untuk melewati blok navigasi yang berulang langsung ke area konten utama.',
                    },
                    {
                      id: 'q2',
                      question:
                        'Mengapa beberapa elemen `<nav>` dalam satu halaman yang sama wajib memiliki atribut `aria-label` yang unik?',
                      options: [
                        'Agar pengguna pembaca layar dapat membedakan fungsi antar-navigasi (misalnya "Navigasi Utama" vs "Navigasi Kurikulum Pelajaran").',
                        'Karena diwajibkan oleh CSS untuk menerapkan warna.',
                        'Karena HTML akan menghasilkan error fatal jika tidak ada.',
                        'Secara otomatis membuat dropdown menu.',
                      ],
                      correctIndex: 0,
                      explanation:
                        'Ketika teknologi asistif mendeteksi beberapa landmark berjenis sama, `aria-label` memberikan konteks pembeda yang jelas bagi pengguna tunanetra.',
                    },
                  ]),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Database berhasil diisi ulang dengan data kurikulum inklusif Bahasa Indonesia!');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat mengisi database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
