<div align="center">

<img src="./public/logo-terang.svg" alt="MindBloom" width="72" />

# MindBloom
**Mental Wellness Space**

Platform skrining dan intervensi kesehatan mental berbasis AI untuk Indonesia

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## Latar Belakang

Indonesia punya masalah kesehatan mental yang serius. **12 juta orang** hidup dengan depresi, **1 dari 3 remaja** pernah mengalami gangguan mental, dan yang paling mengkhawatirkan   **90% dari mereka tidak pernah mendapat penanganan apapun**.

Bukan karena tidak mau, tapi karena akses yang susah, biaya yang mahal, dan banyak yang bahkan tidak sadar kalau mereka butuh bantuan.

MindBloom dibuat untuk jadi **pintu pertama**  tempat seseorang bisa mulai memahami kondisi mentalnya, kapan saja dan dari mana saja.

---

## Fitur

### Skrining Kesehatan Mental
Menggunakan kuesioner **PHQ-9** (depresi) dan **PSS** (stres) yang sudah terstandar secara klinis. Hasilnya diproses dengan **metode Fuzzy Tahani**   bukan sekadar skor angka, tapi analisis yang memahami bahwa kondisi mental itu ada spektrumnya, bukan cuma "sehat" atau "tidak sehat".

Output yang dihasilkan berupa skor 0–100 dengan kategori: *Baik, Cukup, atau Perlu Perhatian*.

### Program Intervensi Dini
Setelah skrining, pengguna langsung masuk ke 3 tahap intervensi:

- **Musik Relaksasi**   pilih dari 6 kategori audio (suara alam, hujan, lo-fi, binaural, mangkuk tibetan, ombak laut)
- **Meditasi Terpandu**   video panduan pernapasan, pemindaian tubuh, grounding, dan afirmasi
- **Jurnal Refleksi**   tulis pikiran dengan prompt yang disesuaikan hasil skrining

### Kalender Mood
Tracking kondisi mental harian. Pengguna bisa lihat pola moodnya dari waktu ke waktu dan mengukur apakah ada perubahan setelah rutin melakukan intervensi.

### Rekomendasi Psikolog
Kalau kondisi membutuhkan bantuan lebih lanjut, MindBloom menyediakan daftar psikolog yang bisa dihubungi.

### Bantuan Darurat
Akses hotline krisis **119 ext 8** (24 jam) yang selalu terlihat di sidebar   untuk kondisi yang tidak bisa menunggu.

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 8 sebagai build tool
- Tailwind CSS v4 untuk styling
- Framer Motion v12 untuk animasi
- React Router v7 untuk routing
- Recharts untuk visualisasi data
- Lucide React untuk ikon
- next-themes untuk dark/light mode

**Backend**
- Supabase (Auth + PostgreSQL + Realtime)

**AI / Analisis**
- Metode Fuzzy Tahani untuk pemrosesan hasil skrining

---

## Cara Menjalankan

**1. Clone dan install**
```bash
git clone https://github.com/DimasPanca/Mindbloom-TryNoSleep.git
cd Mindbloom-TryNoSleep
npm install
```

**2. Buat file `.env`**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Credentials bisa didapat dari [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

**3. Setup database**

Import file SQL dari folder `supabase/migrations/` melalui Supabase Dashboard, atau jalankan:
```bash
supabase db push
```

**4. Jalankan**
```bash
npm run dev
```

Buka `http://localhost:5173`.

---

## Struktur Folder

```
mindbloom/
├── public/
│   ├── audio/              # File audio musik relaksasi
│   ├── logo-terang.svg
│   └── logo-malam.svg
├── src/
│   ├── components/
│   │   └── intervention/   # MusicPlayer, VideoPlayer, JournalPrompt
│   ├── contexts/           # AuthContext, ThemeContext
│   ├── data/               # Bank soal skrining
│   ├── hooks/
│   ├── lib/                # Supabase client & utilities
│   ├── pages/              # Semua halaman aplikasi
│   └── types/
└── supabase/
    └── migrations/         # Schema database
```

---

## Alur Pengguna

```
Landing Page → Register / Login → Dashboard
→ Skrining (PHQ-9 + PSS)
→ Hasil Analisis Fuzzy Tahani
→ Intervensi (Musik → Meditasi → Jurnal)
→ Kalender Mood & Riwayat
→ Rekomendasi Psikolog (jika perlu)
```

---

## Kenapa Fuzzy Tahani?

Kesehatan mental tidak bisa diukur hitam-putih. Seseorang bisa saja "agak stres tapi belum sampai depresi"   dan sistem harus bisa memahami nuansa itu.

Berbeda dengan machine learning yang butuh ribuan data training dan hasilnya sulit dijelaskan, Fuzzy Tahani bekerja dengan aturan linguistik yang transparan dan cocok untuk input kuesioner terstruktur. Hasilnya bisa dijelaskan secara logis, bukan sekadar angka dari black box.

---

## SDGs

Mendukung **SDG Goal 3   Good Health and Well-Being**: meningkatkan akses terhadap layanan kesehatan mental, khususnya untuk remaja dan usia produktif di Indonesia.

---

## Tim

| Nama | Peran |
|------|-------|
| Dimas Panca Pamungka | Fullstack Developer |
| Raihana | Peneliti & Presenter |
| Wakhida | Analis & Presenter |

---

<div align="center">

*"Menjaga kesehatan mental bukan tanda kelemahan   tapi bentuk keberanian."*

</div>
