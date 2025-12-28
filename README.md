# Sistem Informasi Absensi Karyawan

## Deskripsi Umum

Sistem Informasi Absensi Karyawan merupakan aplikasi berbasis web yang digunakan untuk mengelola proses absensi karyawan secara digital. Sistem ini mendukung autentikasi berbasis JSON Web Token (JWT), pembatasan akses berdasarkan role pengguna (admin dan user), serta pengelolaan data absensi secara terintegrasi antara frontend dan backend melalui REST API.

---

## Teknologi yang Digunakan

### Frontend

- Vue.js 3
- Pinia (State Management)
- Axios
- Day.js

### Backend

- Node.js
- Express.js
- MySQL
- JSON Web Token (JWT)
- Middleware Authentication & Authorization

---

## Struktur Halaman Aplikasi

### 1. Halaman Login

Halaman Login digunakan sebagai gerbang autentikasi pengguna sebelum dapat mengakses sistem. Pengguna memasukkan email dan password yang kemudian dikirim ke backend melalui API login. Jika data valid, backend akan mengembalikan token JWT yang disimpan di localStorage. Token ini digunakan sebagai identitas pengguna untuk mengakses endpoint yang dilindungi serta menentukan hak akses berdasarkan role pengguna.

---

### 2. Halaman Dashboard

Halaman Dashboard merupakan halaman utama setelah pengguna berhasil login. Halaman ini menampilkan ringkasan informasi absensi pengguna, seperti status kehadiran hari ini, jam check-in dan check-out, serta statistik singkat absensi. Dashboard juga berfungsi sebagai pusat navigasi menuju halaman lain seperti Attendance dan Profile.

---

### 3. Halaman Attendance

Halaman Attendance digunakan untuk mengelola dan menampilkan data absensi pengguna. Pada halaman ini, pengguna dapat melakukan check-in dan check-out serta melihat riwayat absensi berdasarkan rentang tanggal tertentu. Data yang ditampilkan meliputi tanggal kehadiran, waktu masuk, waktu pulang, jam kerja, dan status kehadiran. Seluruh data diambil dari backend melalui API yang telah diamankan menggunakan token JWT.

---

### 4. Halaman Employees

Halaman Employees hanya dapat diakses oleh pengguna dengan role admin. Halaman ini digunakan untuk mengelola data karyawan, seperti melihat daftar karyawan, menambahkan karyawan baru, mengubah data karyawan, serta menghapus data karyawan. Pembatasan akses dilakukan menggunakan middleware otorisasi di backend dan validasi role pada frontend.

---

### 5. Halaman Profile

Halaman Profile digunakan untuk menampilkan informasi akun pengguna yang sedang login. Informasi yang ditampilkan meliputi nama, email, dan role pengguna. Selain itu, halaman ini juga dapat menampilkan ringkasan statistik absensi pengguna. Halaman Profile membantu pengguna untuk memantau data pribadi dan aktivitas absensinya.

---

## Implementasi Backend

### Struktur Folder Backend

Backend disusun menggunakan arsitektur terpisah antara route, controller, middleware, dan model. Struktur ini bertujuan agar kode lebih terorganisir, mudah dikembangkan, dan mudah dipelihara.

---

### API (Application Programming Interface)

Backend menyediakan REST API yang digunakan oleh frontend untuk melakukan autentikasi, pengelolaan absensi, serta manajemen data karyawan. Setiap endpoint telah dilindungi oleh middleware autentikasi untuk memastikan hanya pengguna yang memiliki token valid yang dapat mengakses API tertentu.

---

### Middleware

Middleware digunakan untuk menangani autentikasi dan otorisasi pengguna. Middleware `authenticateToken` berfungsi untuk memverifikasi token JWT yang dikirim melalui header Authorization. Middleware `authorizeRole` digunakan untuk membatasi akses endpoint tertentu berdasarkan role pengguna, seperti admin atau user.

---

## Pengujian API Menggunakan Postman

### 1. Pengujian Login

Pengujian login dilakukan dengan mengirimkan request POST ke endpoint login menggunakan email dan password. Jika berhasil, sistem mengembalikan token JWT yang digunakan untuk mengakses endpoint lain.

---

### 2. Pengujian Check-in dan Check-out

Setelah login berhasil, token JWT dimasukkan ke dalam header Authorization dengan format `Bearer <token>`. Endpoint check-in dan check-out diuji untuk memastikan absensi hanya dapat dilakukan oleh pengguna yang telah terautentikasi.

---

### 3. Pengujian Akses Endpoint Dengan dan Tanpa Token

Pengujian dilakukan dengan mengakses endpoint absensi tanpa token dan dengan token. Tanpa token, sistem akan mengembalikan respon error, sedangkan dengan token yang valid, request akan diproses dengan benar.

---

### 4. Pengujian Akses Endpoint Admin oleh User Non-Admin

Pengujian ini dilakukan dengan login sebagai user biasa, kemudian mencoba mengakses endpoint khusus admin. Hasil pengujian menunjukkan bahwa sistem menolak akses dengan pesan error, sehingga pembatasan akses berdasarkan role telah berjalan dengan baik.

---

## Kesimpulan

Berdasarkan hasil pengujian melalui browser dan Postman, sistem absensi telah berjalan sesuai dengan fungsi yang dirancang. Autentikasi, otorisasi, pengelolaan absensi, serta pembatasan akses admin berhasil diterapkan dengan baik.
