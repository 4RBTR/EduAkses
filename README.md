# EduAkses – Platform Pembelajaran Inklusif & Adaptif Berbasis Web

[![Coding Camp 2026](https://img.shields.io/badge/Coding%20Camp-2026-blue)](https://dicoding.com)
[![Theme](https://img.shields.io/badge/Theme-Accessible%20%26%20Adaptive%20Learning-green)](#)
[![Live Demo](https://img.shields.io/badge/Live-Demo-orange)](https://edu-akses.vercel.app/)

EduAkses adalah sebuah unified platform yang dirancang untuk mengatasi fragmentasi dalam pendidikan digital. Kami menyatukan berbagai kebutuhan belajar—mulai dari manajemen kelas, sistem tugas, hingga komunikasi langsung—ke dalam satu ekosistem Full-stack Serverless yang mulus untuk mengurangi beban kognitif siswa dan meningkatkan efisiensi pengajaran guru.

---

## 🔗 Live Project
Aplikasi yang sudah dideploy dapat diakses melalui tautan berikut:
**[https://edu-akses.vercel.app/](https://edu-akses.vercel.app/)**

---

## 🚀 Masalah & Solusi

### Masalah (Problem Statement)
Pendidikan digital saat ini mengalami fragmentasi di mana 85% siswa merasa kewalahan karena harus menggunakan 3-5 aplikasi berbeda (seperti Google Classroom, Zoom, dan Quizizz secara terpisah) untuk satu mata pelajaran. Hal ini menyebabkan kebingungan, hilangnya fokus, dan inefisiensi dalam pengelolaan tugas.

### Solusi
EduAkses hadir sebagai "painkiller" yang menyatukan seluruh pengalaman belajar. Dengan implementasi Proxy Layer untuk keamanan dan kontrol akses berbasis peran (termasuk peran khusus bagi Ketua Kelas), platform ini memastikan pembelajaran tetap terorganisir, aman dari eksploitasi data, dan memiliki performa stabil.
---

## ✨ Fitur Utama

### 👨‍🎓 Untuk Siswa
* **Unified Dashboard**: Navigasi intuitif untuk mengakses materi, tugas, dan kuis dalam satu tempat.
* **Integrated Communication**: Fitur chat langsung (Direct & Group) untuk diskusi asinkron yang efisien.
* **Smart Notification**:Sistem pemberitahuan real-time untuk tugas baru, tenggat waktu, dan pengumuman kelas.
* **Adaptive Quiz Progress**: Pengerjaan kuis dengan pelacakan akurasi dan skor yang terintegrasi otomatis ke pangkalan data.

### 🧑‍✈️ Untuk Ketua Kelas
* **Coordination Hub**: Wewenang khusus untuk membantu koordinasi progres tugas kelompok anggota tim.
* **Schedule Monitoring**: Membantu guru dalam memantau ritme pembelajaran dan jadwal harian kelas.

### 👨‍🏫 Untuk Guru (Admin)
* **Enrollment & Access Controll**: Mengelola entitas kelas, siswa, dan otorisasi akses secara terpusat.
* **Deadline & Task Management**: Membuat dan mengelola tugas dengan validasi data yang ketat via Server Actions.
* **Automated Scoring**: Sistem penilaian yang terintegrasi dengan Prisma ORM untuk menjamin akurasi data akademik.

---

## 🛠️ Tech Stack

**Core Technology:**
* **Language**: JavaScript / TypeScript
* **Frontend & Backend**: Next.js 15+ (App Router & Server Actions)
* **Security Layer**: Custom Reverse Proxy & NextAuth.js
* **Database**: PostgreSQL dengan [Prisma ORM](https://www.prisma.io/)

**Tools & Deployment:**
* **Design**: Figma
* **Hosting**: Vercel (Frontend & Serverless Logic)
* **Database Hosting**: Supabase Connection Pooler (Transaction Mode - Port 6543)

---

## 👥 Tim Proyek (CC26-PS057)

| Nama Anggota | Peran | Status |
| :--- | :--- | :--- |
| **Almira Dwi Rosyadi** | Project Management, UI/UX | Aktif |
| **Danendra Bagas Himawan** | Back-End Developer | Aktif |
| **Sakti Mahayana Zaman** | Front-End Developer | Aktif |

---

## Akun Penglola
| Nama Pengguna | Email Address | Password |
| :--- | :--- | :--- |
| **Pak Guru Sakti** | sakti.teacher@eduakses.com | GuruEdu123! |
| **Ibu Guru Almira** | almira.teacher@eduakses.com | GuruEdu123! |
| **Danendra Leader** | danendra.leader@eduakses.com | Ketua123! |

---

## Akun Siswa
| Nama Pengguna | Email Address | Password |
| :--- | :--- | :--- |
| **Bagas Testing** | bagas.student@eduakses.com | Siswa123! |
| **Sakti Testeing** | sakti.student@eduakses.com | Siswa123! |
| **Almira Student** | almira.student@eduakses.com | Siswa123! |


---

*Proyek ini dikembangkan sebagai bagian dari **Coding Camp 2026 powered by DBS Foundation**.*
