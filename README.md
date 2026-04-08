# 🚀 Backend API Documentation

Base URL: `http://localhost:3000/api`

---

## 🔐 Auth API

### 1. Register
**POST** `/auth/register`
**Body:**
```json
{
  "name": "John Doe",
  "email": "johndoe@gmail.com",
  "password": "password123"
}
```

### 2. Login
**POST** `/auth/login`
**Body:**
```json
{
  "email": "johndoe@gmail.com",
  "password": "password123"
}
```
**Response:**
```json
{
    "success": true,
    "status": 200,
    "message": "Login berhasil",
    "data": {
        "access_token": "jwt_token",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "johndoe@gmail.com",
            "role": "USER"
        }
    }
}
```

### 3. Logout
**POST** `/auth/logout`

### 4. Update Profile (Current User)
**PATCH** `/auth/update`
*(Requires Bearer Token)*
**Body:**
```json
{
  "name": "John Update",
  "email": "john.update@gmail.com",
  "password": "newpassword123"
}
```

### 5. Update Profile by ID
**PATCH** `/auth/update/:id`
*(Requires Bearer Token)*

### 6. Get All Users
**GET** `/auth/users`
*(Requires Bearer Token, Role: ADMIN)*

### 7. Get All Admins
**GET** `/auth/admins`
*(Requires Bearer Token, Role: ADMIN)*

---

## 📦 Packages API

### 1. Create Package
**POST** `/packages`
**Body:** 
```json
{
    "name": "Nama Paket",
    "description": "Deskripsi Paket",
    "price": 35000,
    "location": "Lokasi",
    "image": "gambar.jpg"
}
```

### 2. Get All Packages
**GET** `/packages`

### 3. Get Package by ID
**GET** `/packages/:id`

### 4. Update Package
**PATCH** `/packages/:id`
**Body:** (Bergantung pada `UpdatePackageDto`)

### 5. Delete Package
**DELETE** `/packages/:id`

---

## 🔖 Bookmarks API
*(Semua aksi pembuatan/pengambilan data ini ditautkan otomatis dengan ID User yang login).*

### 1. Create Bookmark
**POST** `/bookmarks`
*(Requires Bearer Token)*
**Body:**
```json
{
  "packageId": 1
}
```

### 2. Get My Bookmarks
**GET** `/bookmarks`
*(Requires Bearer Token)*

### 3. Get Bookmark by ID
**GET** `/bookmarks/:id`

### 4. Delete Bookmark
**DELETE** `/bookmarks/:id`

---

## 🛒 Booking API

### 1. Create Booking (Checkout)
**POST** `/booking`
*(Requires Bearer Token)*
**Body:**
```json
{
    "userId": 1,
    "packageId": 11,
    "date": "11/4/2026",
    "quantity": 3
}
```
**Response:**
Menghasilkan objek transaksi beserta integrasi Midtrans.
```json
{
  "success": true,
  "data": { ... },
  "snapToken": "...",
  "redirectUrl": "..."
}
```

### 2. Get All Bookings
**GET** `/booking`
*(Endpoint untuk admin melihat seluruh pesanan)*

### 3. Get My Bookings
**GET** `/booking/me`
*(Requires Bearer Token)*
*(Menampilkan pesanan yang dimiliki oleh user yang sedang login)*

### 4. Cancel Booking
**PATCH** `/booking/:id`
*(Requires Bearer Token)*
Mengubah status pesanan menjadi `CANCELED`.

---

## 💳 Payments API

### 1. Midtrans Webhook
**POST** `/payments/midtrans/webhook`
*(Endpoint backend-to-backend)*
Endpoint ini otomatis dihit oleh sistem Midtrans bila pengguna berhasil menyelesaikan pembayaran atau pesanannya kadaluarsa. Sistem akan otomatis mengganti status `Booking` menjadi `PAID` apabila pembayaran berhasil (`capture` atau `settlement`).

---

## ⚠️ Notes
* Semua endpoint yang dilabeli **(Requires Bearer Token)** wajib menyertakan Authorization Header di request API.
* Format header: 
  ```
  Authorization: Bearer <token>
  ```
* Beberapa rute seperti `GET /auth/users` dibatasi melalui sistem Role (*Role-Based Access Control* / RBAC).
