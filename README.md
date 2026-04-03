# 💰 FinSight – Finance Data Processing & Access Control Backend

A backend system for managing financial records with role-based access control and analytics, built using Django REST Framework.

---

## 🚀 Overview

FinSight is a backend API designed for a finance dashboard where users interact with financial data based on their roles.

The system focuses on:

* Clean API design
* Proper data handling
* Role-based access control (RBAC)
* Meaningful analytics for dashboard usage

---

## 🛠 Tech Stack

* **Backend:** Django, Django REST Framework
* **Authentication:** JWT (SimpleJWT)
* **Database:** SQLite
* **Language:** Python

---

## 📦 Project Structure

```
FinSight/
│
├── users/        # Authentication, roles, user management
├── records/      # Financial records (expenses, income)
├── analytics/    # Dashboard summaries and insights
├── core/         # Custom permissions (RBAC)
├── expense_tracker/  # Main project settings
```

---

## 👤 User Roles & Permissions

| Role    | Permissions                                        |
| ------- | -------------------------------------------------- |
| Viewer  | Can view records and analytics                     |
| Analyst | Can view records and analytics                     |
| Admin   | Full access (create, update, delete, manage users) |

### 🔐 Access Control

* All APIs require authentication (JWT)
* Read operations → Authenticated users
* Write operations → Admin only

---

## 🔑 Authentication APIs

### Register

```
POST /api/users/auth/register/
```

### Login

```
POST /api/users/auth/login/
```

Returns:

```json
{
  "refresh": "...",
  "access": "..."
}
```

Use in headers:

```
Authorization: Bearer <access_token>
```

---

## 👥 User Management APIs (Admin Only)

### Get All Users

```
GET /api/users/
```

### Update Role

```
PATCH /api/users/{id}/role/
```

```json
{
  "role": "analyst"
}
```

### Activate / Deactivate User

```
PATCH /api/users/{id}/status/
```

```json
{
  "is_active": false
}
```

---

## 💰 Financial Records APIs

### Base Endpoint

```
/api/records/
```

### Features

* Create, Read, Update, Delete records
* User-specific data isolation
* Validation (amount must be positive)

---

### 🔍 Filtering

```
/api/records/?type=expense
/api/records/?category=food
/api/records/?start_date=2026-04-01&end_date=2026-04-30
```

---

### 🔎 Search

```
/api/records/?search=rent
```

(Searches within record descriptions)

---

### 🔽 Ordering

```
/api/records/?ordering=-amount
/api/records/?ordering=added_at
```

---

### 📄 Pagination

* Enabled globally
* Default page size: **10**

---

## 📊 Analytics APIs

### Summary

```
GET /api/analytics/summary/
```

Returns:

```json
{
  "total_income": 5000,
  "total_expense": 2000,
  "balance": 3000
}
```

---

### Insights (Category Breakdown)

```
GET /api/analytics/insights/
```

Returns:

```json
{
  "category_breakdown": [
    { "categories__title": "Food", "total": 1200 },
    { "categories__title": "Transport", "total": 800 }
    ]
}
```

---

## 🛡 Validation & Error Handling

* Amount must be greater than 0
* Invalid role updates are rejected
* Unauthorized actions return proper HTTP status codes

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```
git clone <your-repo-link>
cd FinSight
```

### 2. Create Virtual Environment

```
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```
pip install -r requirements.txt
```

### 4. Run Migrations

```
python manage.py makemigrations
python manage.py migrate
```

### 5. Run Server

```
python manage.py runserver
```

---

## 🧠 Design Decisions

* Used **role-based access control** instead of simple authentication to simulate real-world systems
* Kept APIs **modular (users, records, analytics)** for clarity and scalability
* Added **filtering, search, and ordering** to make APIs flexible for frontend usage
* Implemented **JWT authentication** for stateless and secure API access

---

## 📌 Assumptions

* Each user manages their own financial data
* Roles are predefined (viewer, analyst, admin)
* SQLite is used for simplicity (can be replaced with PostgreSQL)

---

## 🚀 Future Improvements

* Monthly trend analytics
* Soft delete for records
* API documentation (Swagger)
* Unit and integration tests

---

## 🎯 Conclusion

This project demonstrates a structured backend system with:

* Clean API design
* Strong access control
* Scalable architecture
* Practical financial data handling


---
