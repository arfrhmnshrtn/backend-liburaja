# 🔐 Auth API Endpoints

Base URL:

```
http://localhost:3000
```

---

## 📝 Register

**POST** `/auth/register`

### Body:

```json
{
  "name": "Panji",
  "email": "panji@gmail.com",
  "password": "123456"
}
```

### Response:

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

## 🔐 Login

**POST** `/auth/login`

### Body:

```json
{
  "email": "panji@gmail.com",
  "password": "123456"
}
```

### Response:

```json
{
  "access_token": "jwt_token"
}
```

---

## 🙋‍♂️ Get Profile

**GET** `/auth/me`

### Headers:

```
Authorization: Bearer <token>
```

### Response:

```json
{
  "id": 1,
  "name": "Panji",
  "email": "panji@gmail.com",
  "role": "USER"
}
```

---

## ✏️ Update Profile

**PATCH** `/auth/update`

### Headers:

```
Authorization: Bearer <token>
```

### Body:

```json
{
  "name": "Panji Update",
  "email": "panji2@gmail.com",
  "password": "12345678"
}
```

### Response:

```json
{
  "id": 1,
  "name": "Panji Update",
  "email": "panji2@gmail.com",
  "role": "USER"
}
```

---

## ⚠️ Notes

* Semua endpoint selain register & login membutuhkan token
* Gunakan format header:

```
Authorization: Bearer <token>
```

* Password disimpan dalam bentuk hash
* Role default: `USER`

---
