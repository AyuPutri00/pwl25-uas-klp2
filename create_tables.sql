-- Buat database
CREATE DATABASE IF NOT EXISTS absensi_db;
USE absensi_db;

-- Hapus tabel jika sudah ada (opsional)
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;

-- Tabel users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel employees
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  salary DECIMAL(15,2) DEFAULT 0,
  hire_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel attendances
CREATE TABLE attendances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME NULL,
  status ENUM('present', 'late', 'absent') DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert data admin (password: password)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert data employee sample (password: password)
INSERT INTO users (name, email, password, role) VALUES 
('Ayu Putri', 'ayu@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),

-- Insert data employee profile
INSERT INTO employees (user_id, employee_id, position, department, salary, hire_date) VALUES 
(2, 'EMP001', 'Software Developer', 'IT', 75000.00, '2024-01-15'),
(3, 'EMP002', 'UI/UX Designer', 'Design', 65000.00, '2024-02-01');

-- Buat index untuk performa
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_attendances_user_date ON attendances(user_id, check_in);
CREATE INDEX idx_attendances_date ON attendances(check_in);

-- Tampilkan hasil
SELECT 'Database dan tabel berhasil dibuat!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_employees FROM employees;