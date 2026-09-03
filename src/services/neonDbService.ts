/**
 * Neon PostgreSQL Database Architecture & Schema Configuration
 * 
 * You can connect this application directly to Neon DB (Serverless Postgres).
 * 
 * STEP 1: Create a free database at https://neon.tech
 * STEP 2: Copy your Connection String / Database URL
 * STEP 3: Provide your DATABASE_URL in your .env or server environment
 */

export interface NeonDbConfig {
  connectionString: string;
  ssl: boolean;
  maxConnections: number;
}

export const DEFAULT_NEON_CONFIG: NeonDbConfig = {
  connectionString: (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_NEON_DATABASE_URL : '') || 'postgresql://neondb_owner:npg_8iOsGczvHjy4@ep-restless-brook-azx19ocz-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: true,
  maxConnections: 10,
};

/**
 * SQL Schema DDL ready to execute directly in the Neon Console (SQL Editor)
 */
export const NEON_POSTGRES_SCHEMA_SQL = `
-- ==========================================================
-- KODING NEXT SCHOOL MANAGEMENT SYSTEM - NEON POSTGRES SCHEMA
-- ==========================================================

-- 1. Centers Table
CREATE TABLE IF NOT EXISTS centers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    student_count INT DEFAULT 0,
    teacher_count INT DEFAULT 0,
    room_count INT DEFAULT 0,
    active_classes_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Super Admin, Admin Center, Student Advisor, Teacher, Parent, Student)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'admin', 'admin_center', 'student_advisor', 'teacher', 'parent', 'student'
    avatar TEXT,
    phone VARCHAR(50),
    status VARCHAR(30) DEFAULT 'active',
    center_id VARCHAR(64) REFERENCES centers(id) ON DELETE SET NULL,
    center_ids TEXT[], -- Array of assigned centers
    handled_parent_ids TEXT[],
    parent_id VARCHAR(64),
    children_ids TEXT[],
    specialization VARCHAR(255),
    level VARCHAR(50),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Classrooms / Lab Rooms (Locked to 6 students capacity)
CREATE TABLE IF NOT EXISTS classrooms (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    center_id VARCHAR(64) REFERENCES centers(id) ON DELETE CASCADE,
    center_name VARCHAR(255),
    capacity INT DEFAULT 6,
    has_computers BOOLEAN DEFAULT TRUE,
    computer_count INT DEFAULT 6,
    facilities TEXT[],
    status VARCHAR(30) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Curriculum Modules (Standardized 20 Weeks / 20 Lessons)
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL, -- 'LK 4-6', 'LK 6-8', 'JK 8-12', 'JK 12-16'
    age_group VARCHAR(100),
    description TEXT,
    duration_weeks INT DEFAULT 20,
    total_lessons INT DEFAULT 20,
    topics TEXT[] NOT NULL,
    final_project TEXT,
    color VARCHAR(30),
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Class Batches
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    type VARCHAR(50) DEFAULT 'Regular', -- 'Regular', 'Trial', 'Make-up', 'Catchup'
    module_id VARCHAR(64) REFERENCES modules(id) ON DELETE SET NULL,
    module_name VARCHAR(255),
    module_level VARCHAR(50),
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    teacher_name VARCHAR(255),
    teacher_avatar TEXT,
    center_id VARCHAR(64) REFERENCES centers(id) ON DELETE CASCADE,
    center_name VARCHAR(255),
    room_id VARCHAR(64) REFERENCES classrooms(id) ON DELETE SET NULL,
    room_name VARCHAR(255),
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    capacity INT DEFAULT 6,
    enrolled_students_count INT DEFAULT 0,
    student_ids TEXT[],
    status VARCHAR(30) DEFAULT 'active',
    zoom_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Student Portfolios & Projects
CREATE TABLE IF NOT EXISTS student_projects (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_name VARCHAR(255) NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    project_url TEXT NOT NULL,
    grade INT,
    feedback TEXT,
    status VARCHAR(30) DEFAULT 'submitted', -- 'submitted', 'reviewed', 'showcased'
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE CASCADE,
    class_name VARCHAR(255),
    date DATE NOT NULL,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    student_avatar TEXT,
    status VARCHAR(30) NOT NULL, -- 'present', 'absent', 'late', 'excused'
    note TEXT,
    marked_by_teacher_id VARCHAR(64) REFERENCES users(id),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_center ON users(center_id);
CREATE INDEX IF NOT EXISTS idx_classes_center ON classes(center_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_projects_student ON student_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance_records(class_id);
`;
