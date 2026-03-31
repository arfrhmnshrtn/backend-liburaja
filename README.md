# 🔐 Authentication API Documentation

Dokumentasi ini menjelaskan fitur autentikasi pada backend menggunakan **NestJS + Prisma + PostgreSQL + JWT**

---

## 🚀 Tech Stack

* **Backend**: NestJS
* **Database**: PostgreSQL
* **ORM**: Prisma
* **Authentication**: JWT (JSON Web Token)
* **Validation**: class-validator

---

## 📌 Base URL

```
http://localhost:3000
```

---

# 🔑 AUTH ENDPOINTS

---

## 📝 1. Register

Mendaftarkan user baru

### 📍 Endpoint

```
POST /auth/register
```

### 📥 Request Body

```json
{
  "name": "Panji",
  "email": "panji@gmail.com",
  "password": "123456"
}
```

### 📤 Response

```json
{
  "message": "Register berhasil",
  "user": {
    "id": 1,
    "name": "Panji",
    "email": "panji@gmail.com",
    "role": "USER"
  }
}
```

---

## 🔐 2. Login

Login untuk mendapatkan JWT token

### 📍 Endpoint

```
POST /auth/login
```

### 📥 Request Body

```json
{
  "email": "panji@gmail.com",
  "password": "123456"
}
```

### 📤 Response

```json
{
  "access_token": "jwt_token"
}
```

---

## 🔒 3. Get Profile (Protected)

Mengambil data user yang sedang login

### 📍 Endpoint

```
GET /auth/me
```

### 📥 Headers

```
Authorization: Bearer <token>
```

### 📤 Response

```json
{
  "id": 1,
  "name": "Panji",
  "email": "panji@gmail.com",
  "role": "USER"
}
```

---

## ✏️ 4. Update Profile (Protected)

Mengupdate data user

### 📍 Endpoint

```
PATCH /auth/update
```

### 📥 Headers

```
Authorization: Bearer <token>
```

### 📥 Request Body

```json
{
  "name": "Panji Update",
  "email": "panji2@gmail.com",
  "password": "12345678"
}
```

### 📤 Response

```json
{
  "id": 1,
  "name": "Panji Update",
  "email": "panji2@gmail.com",
  "role": "USER"
}
```

---

# 🔐 Authentication Flow

1. User register akun
2. User login → mendapatkan JWT token
3. Token digunakan untuk akses endpoint protected
4. Backend memverifikasi token menggunakan JWT Strategy

---

# ⚠️ Important Notes

* Gunakan header:

```
Authorization: Bearer <token>
```

* Password disimpan dalam bentuk hash (bcrypt)
* Role default adalah `USER`
* User tidak bisa menentukan role saat register (untuk keamanan)

---

# 🛡️ Security

* JWT digunakan untuk autentikasi
* Password di-hash menggunakan bcrypt
* Endpoint protected menggunakan JWT Guard

---

# 📂 Struktur Folder (Auth)

```
auth/
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── update-user.dto.ts
│
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── jwt.strategy.ts
├── jwt-auth.guard.ts
```

---

# 🧪 Testing

Gunakan tools seperti:

* Postman
* API Dog
* Insomnia

---

# 👨‍💻 Author

Project ini dibuat untuk keperluan pembelajaran & pengembangan sistem booking wisata 🚀

---
