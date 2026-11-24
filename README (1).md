# Sistem Kasir Minimarket Barokah (POS)

Aplikasi web Point of Sale (kasir) untuk minimarket, dibangun dengan prinsip **Pemrograman Berorientasi Objek** (class, encapsulation, inheritance, polymorphism) menggunakan JavaScript.

### 🔗 Live Demo: [https://kelompok-14.github.io/Sistem-Kasir-Minimarket/]
### 📦 Repositori: [https://github.com/Kelompok-14/Sistem-Kasir-Minimarket]
## Akun Uji Coba

| Role  | Username | Password   | Hak akses |
|-------|----------|------------|-----------|
| Admin | `admin`  | `admin123` | Transaksi, riwayat, tambah/hapus produk, tambah stok, reset data |
| Kasir | `kasir`  | `kasir123` | Transaksi dan riwayat |

## Fitur Utama

- Login dengan 2 role (Admin & Kasir); menu dibatasi sesuai hak akses
- Katalog produk: filter kategori, pencarian nama/kode, input barcode (Enter)
- Keranjang: tambah/kurang qty dengan validasi stok, hapus item
- Diskon (Rp), PPN 11% opsional, tombol uang cepat, kembalian otomatis
- Struk transaksi + cetak (`window.print`)
- Riwayat transaksi (maks. 100) beserta nama kasir
- Admin: tambah produk, tambah stok, hapus produk, reset data
- Data tersimpan di `localStorage` browser

## Teknologi

HTML5, JavaScript ES2022 (class, private field `#`), Tailwind CSS 3, Font Awesome 6 (di-bundle lokal), Web Crypto API (hash SHA-256 password).

## Struktur OOP

| File | Isi |
|------|-----|
| `js/models.js` | `Product`, `CartItem`, `Cart` (private `#items`), `Transaction` |
| `js/storage.js` | `Repository` → `ProductRepository`, `TransactionRepository` (inheritance) |
| `js/auth.js` | `User` → `Admin`, `Cashier` (override `permissions` = polymorphism), `AuthService` |
| `js/app.js` | `PosApp` (controller/view) |

## Struktur Folder

```
Sistem-Kasir-Minimarket/
├── index.html               # Halaman utama (login, kasir, modal)
├── README.md                # Dokumentasi projek
├── Laporan Projek.pdf       # Laporan singkat projek
├── package.json             # Konfigurasi npm & script build CSS
├── tailwind.config.js       # Konfigurasi Tailwind CSS
├── .gitignore               # Mengecualikan node_modules, .env, dll.
├── .env.example             # Contoh variabel lingkungan (tanpa data rahasia)
├── css/
│   ├── input.css            # Sumber CSS (direktif Tailwind + gaya cetak struk)
│   └── style.css            # Hasil build Tailwind (dipakai index.html)
├── js/
│   ├── models.js            # Product, CartItem, Cart, Transaction
│   ├── storage.js           # Repository, ProductRepository, TransactionRepository
│   ├── auth.js              # User, Admin, Cashier, AuthService
│   └── app.js               # PosApp (controller & tampilan)
└── assets/
    ├── fa.min.css           # Font Awesome (lokal)
    └── webfonts/
        └── fa-solid-900.woff2
```

Folder `node_modules/` dan file `.env` tidak ikut diunggah ke GitHub (lihat `.gitignore`).

## Instalasi Lokal

```bash
git clone https://github.com/Kelompok-14/Sistem-Kasir-Minimarket.git
cd Sistem-Kasir-Minimarket
npm install            # hanya untuk build CSS (opsional)
npm run build:css      # opsional: build ulang Tailwind
npm start              # jalankan server lokal, lalu buka alamat yang tampil
```

Tanpa Node.js pun cukup jalankan `python3 -m http.server 8000` lalu buka `http://localhost:8000`.
Salin `.env.example` ke `.env` bila diperlukan (aplikasi ini belum memerlukan variabel rahasia).

## Deploy (Hosting Publik)

- **GitHub Pages:** Settings → Pages → Deploy from branch `main` / root.
- **Netlify/Vercel:** import repo, tanpa build command, publish directory `.`

## Catatan Keamanan

Ini aplikasi demo client-side: autentikasi hanya simulasi untuk keperluan pembelajaran dan tidak aman untuk produksi.

## Pembagian Tugas (Kelompok 14)

| No. | Nama | Tugas |
|-----|------|-------|
| 1 | Mendy Yappno | Logika kasir: keranjang, perhitungan diskon/PPN, transaksi, dan struk (`Cart`, `Transaction`) |
| 2 | Cheivert Gregorius Moningka | Autentikasi dan role (`User`, `Admin`, `Cashier`, `AuthService`) serta manajemen produk Admin |
| 3 | Jordan Sheva Rafandi Anes | Antarmuka, penyimpanan data (`Repository`), pengujian, dokumentasi (README dan laporan), dan hosting |
