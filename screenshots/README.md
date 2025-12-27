# 📸 API Testing Screenshots

Simpan screenshot hasil testing API di folder ini.

## 🧪 API Endpoints yang Harus Ditest:

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru
- `GET /api/auth/profile` - Get user profile (protected)

### Employee Management (Admin only)
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `POST /api/attendance/checkin` - Check in (protected)
- `POST /api/attendance/checkout` - Check out (protected)
- `GET /api/attendance/today` - Get today's attendance (protected)
- `GET /api/attendance/my-attendance` - Get user attendance history (protected)
- `GET /api/attendance/all` - Get all attendance (admin only)

## 🔧 Tools untuk Testing:
- Postman
- Thunder Client (VS Code Extension)
- Insomnia

## 📝 Format Screenshot:
- Nama file: `endpoint-method.png`
- Contoh: `auth-login-POST.png`, `employees-GET.png`