-- =========================================================================
-- KODING NEXT SCHOOL MANAGEMENT SYSTEM - CLEAN NEON POSTGRES DATABASE
-- Disusun dengan 35 Cabang Resmi, 26 Kurikulum Modul, dan 1 Super Admin
-- Copy dan Paste seluruh script ini langsung ke Neon SQL Editor
-- =========================================================================

-- Drop existing tables to ensure a clean state
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS student_projects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS centers CASCADE;

-- 1. Centers Table (Cabang Sekolah)
CREATE TABLE centers (
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

-- 2. Users Table (Pengguna Sistem)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT 'password123',
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

-- 3. Classrooms / Lab Rooms (Ruangan Lab Komputer - Max 6 Kapasitas)
CREATE TABLE classrooms (
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
CREATE TABLE modules (
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

-- 5. Class Batches (Jadwal Batch Kelas)
CREATE TABLE classes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    type VARCHAR(50) DEFAULT 'Regular',
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

-- 6. Student Portfolios & Projects (Karya Coding Siswa)
CREATE TABLE student_projects (
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
    status VARCHAR(30) DEFAULT 'submitted',
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Attendance Records (Presensi)
CREATE TABLE attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE CASCADE,
    class_name VARCHAR(255),
    date DATE NOT NULL,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    student_avatar TEXT,
    status VARCHAR(30) NOT NULL,
    note TEXT,
    marked_by_teacher_id VARCHAR(64) REFERENCES users(id),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_center ON users(center_id);
CREATE INDEX idx_classes_center ON classes(center_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_projects_student ON student_projects(student_id);
CREATE INDEX idx_attendance_class ON attendance_records(class_id);


-- =========================================================================
-- DATA 1: SINGLE SUPER ADMIN ACCOUNT
-- =========================================================================

INSERT INTO users (id, name, email, password_hash, role, avatar, phone, status, join_date)
VALUES 
('usr-super-admin', 'Super Admin', 'budi.santoso@kodingnext.id', 'password123', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '0812-9988-7711', 'active', '2026-01-01');


-- =========================================================================
-- DATA 2: DAFTAR 35 CABANG RESMI KODING NEXT
-- =========================================================================

INSERT INTO centers (id, name, code, city, province, address, phone, email, student_count, teacher_count, room_count, active_classes_count, status)
VALUES 
('ctr-online', 'Online', 'ONLINE', 'Online', 'Online', 'Live Interactive Virtual Classes across Indonesia', '+62 21 8000 0000', 'online@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-kemayoran', 'Jakarta - Kemayoran', 'JKT-KMY', 'Jakarta', 'DKI Jakarta', 'Jl. Benyamin Sueb, Kemayoran, Jakarta Pusat', '+62 21 654 1001', 'kemayoran@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-kelapa-gading', 'Jakarta - Kelapa Gading', 'JKT-MKG', 'Jakarta', 'DKI Jakarta', 'Mall Kelapa Gading 3, Jl. Boulevard Raya, Jakarta', '+62 21 4585 0003', 'mkg.jakarta@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-menteng', 'Jakarta - Menteng', 'JKT-MTG', 'Jakarta', 'DKI Jakarta', 'Jl. HOS Cokroaminoto No. 42, Menteng, Jakarta', '+62 21 3190 2002', 'menteng@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-pik', 'Jakarta - PIK Cordoba', 'JKT-PIK', 'Jakarta', 'DKI Jakarta', 'Ruko Cordoba Blok E No. 18, Pantai Indah Kapuk, Jakarta', '+62 21 5698 3003', 'pik.cordoba@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-pluit', 'Jakarta - Pluit', 'JKT-PLUIT', 'Jakarta', 'DKI Jakarta', 'Pluit Village Mall 2nd Fl, Jl. Pluit Indah Raya, Jakarta', '+62 21 6667 4004', 'pluit@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-puri', 'Jakarta - Puri', 'JKT-PURI', 'Jakarta', 'DKI Jakarta', 'Puri Indah Mall 2nd Fl, Kembangan, Jakarta', '+62 21 5822 0004', 'puri.jakarta@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-kalimalang', 'Jakarta - Kalimalang', 'JKT-KLM', 'Jakarta', 'DKI Jakarta', 'Jl. Raya Kalimalang No. 88, Duren Sawit, Jakarta', '+62 21 8660 5005', 'kalimalang@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bogor', 'Bogor', 'BGR-BOTANI', 'Bogor', 'West Java', 'Botani Square Mall 2nd Fl, Jl. Pajajaran, Bogor', '+62 251 840 0009', 'bogor@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bsd', 'Tangerang - BSD', 'TNG-BSD', 'Tangerang', 'Banten', 'The Breeze BSD City, Block L No. 12, BSD City', '+62 21 5038 0005', 'bsd.tangerang@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-gading-serpong', 'Tangerang - Gading Serpong', 'TNG-SMS', 'Tangerang', 'Banten', 'Summarecon Mall Serpong 2nd Fl, Gading Serpong', '+62 21 5460 0006', 'gadingserpong@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bekasi-cikarang', 'Bekasi - Cikarang', 'BKS-CKR', 'Bekasi', 'West Java', 'Ruko Thamrin Boulevard, Cikarang Festival, Cikarang', '+62 21 8989 1001', 'cikarang@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bekasi-harapan-indah', 'Bekasi - Harapan Indah', 'BKS-BHI', 'Bekasi', 'West Java', 'Ruko Mega Boulevard, Kota Harapan Indah, Bekasi', '+62 21 8899 2002', 'harapanindah@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bekasi-grand-wisata', 'Bekasi Grand Wisata', 'BKS-GWI', 'Bekasi', 'West Java', 'Ruko Celebration Boulevard Blok AA, Grand Wisata, Bekasi', '+62 21 8260 3003', 'grandwisata@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bandung-sunda', 'Bandung - Jl Sunda', 'BDG-SND', 'Bandung', 'West Java', 'Jl. Sunda No. 65, Sumur Bandung, Kota Bandung', '+62 22 420 1001', 'bandung.sunda@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bandung-mekarwangi', 'Bandung - Mekarwangi', 'BDG-MKW', 'Bandung', 'West Java', 'Jl. Mekar Utama No. 88, Mekarwangi, Bandung', '+62 22 520 2002', 'bandung.mekarwangi@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bandung-kbp', 'Bandung - KBP', 'BDG-KBP', 'Bandung Barat', 'West Java', 'Ruko Tatar Wangsakancana, Kota Baru Parahyangan', '+62 22 680 3003', 'bandung.kbp@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-tasikmalaya', 'Tasikmalaya', 'TSK-TSM', 'Tasikmalaya', 'West Java', 'Jl. HZ. Mustofa No. 120, Cihideung, Tasikmalaya', '+62 265 330 100', 'tasikmalaya@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-yogyakarta', 'Yogyakarta', 'YOG-JOG', 'Yogyakarta', 'DI Yogyakarta', 'Jl. Kaliurang KM 5.5 No. 42, Sleman, Yogyakarta', '+62 274 560 100', 'yogyakarta@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-cilegon', 'Cilegon', 'CLG-CLG', 'Cilegon', 'Banten', 'Jl. Raya Cilegon No. 18, Sukmajaya, Cilegon', '+62 254 390 100', 'cilegon@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-serang', 'Serang', 'SRG-SRG', 'Serang', 'Banten', 'Jl. Veteran No. 35, Kotabaru, Serang', '+62 254 200 200', 'serang@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-east-surabaya', 'East Surabaya', 'SBY-EST', 'Surabaya', 'East Java', 'Jl. Kertajaya Indah Timur No. 50, Surabaya Timur', '+62 31 599 1001', 'east.surabaya@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-ciputra-world-sby', 'Ciputra World Surabaya', 'SBY-CPW', 'Surabaya', 'East Java', 'Ciputra World Mall 2nd Fl, Jl. Mayjen Sungkono, Surabaya', '+62 31 566 2002', 'ciputraworld@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-citraland-sby', 'Citraland Surabaya', 'SBY-CTL', 'Surabaya', 'East Java', 'G-Walk Blok W2 No. 15, Citraland, Surabaya Barat', '+62 31 740 3003', 'citraland.surabaya@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-surabaya-ngagel', 'Surabaya Ngagel', 'SBY-NGL', 'Surabaya', 'East Java', 'Jl. Ngagel Jaya Selatan No. 112, Gubeng, Surabaya', '+62 31 502 4004', 'ngagel.surabaya@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-bali-renon', 'Bali - Renon', 'DPS-RNN', 'Denpasar', 'Bali', 'Jl. Raya Puputan No. 88, Renon, Denpasar Selatan, Bali', '+62 361 240 100', 'bali.renon@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-batam', 'Batam', 'BTM-BTM', 'Batam', 'Riau Islands', 'Grand Batam Mall 3rd Fl, Jl. Pembangunan, Batam', '+62 778 488 100', 'batam@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-kupang', 'Kupang', 'KPG-KPG', 'Kupang', 'East Nusa Tenggara', 'Jl. Frans Seda No. 25, Fatululi, Oebobo, Kupang', '+62 380 840 100', 'kupang@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-makassar', 'Makassar', 'MKS-TSM', 'Makassar', 'South Sulawesi', 'Trans Studio Mall Makassar Lt. 2, Jl. Metro Tanjung Bunga', '+62 411 811 0014', 'makassar@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-manado', 'Manado', 'MND-MTC', 'Manado', 'North Sulawesi', 'Manado Town Square 3, Jl. Piere Tendean, Manado', '+62 431 880 100', 'manado@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-medan-balige', 'Medan - Balige', 'MDN-BLG', 'Medan / Toba', 'North Sumatra', 'Jl. Gereja No. 12, Balige, Toba Samosir', '+62 632 210 100', 'medan.balige@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-medan-cemara', 'Medan - Cemara', 'MDN-CMR', 'Medan', 'North Sumatra', 'Komplek Cemara Asri Blok G No. 8, Medan', '+62 61 662 2002', 'medan.cemara@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-pekanbaru', 'Pekanbaru', 'PKU-PKU', 'Pekanbaru', 'Riau', 'Mall SKA 2nd Fl, Jl. Soekarno - Hatta, Pekanbaru', '+62 761 860 100', 'pekanbaru@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-jayapura', 'Jayapura', 'DJJ-DJJ', 'Jayapura', 'Papua', 'Mall Jayapura Lt. 3, Jl. Sam Ratulangi No. 1, Jayapura', '+62 967 530 100', 'jayapura@kodingnext.id', 0, 0, 0, 0, 'active'),
('ctr-samarinda', 'Samarinda', 'SMD-SMD', 'Samarinda', 'East Kalimantan', 'Big Mall Samarinda Lt. 2, Jl. Untung Suropati No. 8, Samarinda', '+62 541 720 100', 'samarinda@kodingnext.id', 0, 0, 0, 0, 'active');


-- =========================================================================
-- DATA 3: OFFICIAL 26 CURRICULUM MODULES (20 Weeks / 20 Lessons)
-- =========================================================================

INSERT INTO modules (id, code, title, level, age_group, description, duration_weeks, total_lessons, topics, final_project, color, thumbnail)
VALUES 
-- Little Kodders (LK 4-6)
('mod-lk-1', 'LK-4-6-CS', 'LK 4-6 Coding Stories', 'LK 4-6', 'Ages 4 - 6 (Little Kodders)', 'Introduction to early logic, visual blocks, sequencing, and animated story creation.', 20, 20, ARRAY['Sequencing & Directional Logic', 'Animated Storyboard Creation', 'Character Design & Sounds', 'Interactive Story Presentation'], 'My First Animated Coding Storybook', '#007AFF', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'),
('mod-lk-2', 'LK-4-6-CSF', 'LK 4-6 Coding Safaries', 'LK 4-6', 'Ages 4 - 6 (Little Kodders)', 'Safari and animal exploration themed visual coding puzzles and habitat simulations.', 20, 20, ARRAY['Animal Movement Algorithms', 'Habitat Simulation Puzzles', 'Sound & Voice Triggers', 'Safari Exploration Map'], 'Virtual Wild Safari Park Simulation', '#0284C7', 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=60'),
('mod-lk-3', 'LK-4-6-CRA', 'LK 4-6 Coding Robot Adventure', 'LK 4-6', 'Ages 4 - 6 (Little Kodders)', 'Hands-on virtual robot steering, maze navigation algorithms, and sensors.', 20, 20, ARRAY['Robot Movement Commands', 'Obstacle Avoidance Logic', 'Color Sensors & Light Triggers', 'Maze Escape Quest'], 'Autonomous Robot Maze Navigator', '#2563EB', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60'),
('mod-lk-4', 'LK-4-6-AC', 'LK 4-6 Active Coding', 'LK 4-6', 'Ages 4 - 6 (Little Kodders)', 'Kinesthetic learning connecting physical movements and visual code blocks.', 20, 20, ARRAY['Action Sequences & Loops', 'Dance & Rhythm Coding', 'Interactive Touch Games', 'Active Motion Challenges'], 'Musical Dance Party Code Show', '#3B82F6', 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=500&auto=format&fit=crop&q=60'),
('mod-lk-5', 'LK-4-6-DT', 'LK 4-6 Design Thinker', 'LK 4-6', 'Ages 4 - 6 (Little Kodders)', 'Creative design thinking, user empathy, prototyping digital toys.', 20, 20, ARRAY['Empathy & Creative Ideation', 'Digital Toy Prototyping', 'User Testing & Iteration', 'Visual Aesthetic Design'], 'Custom Digital Toybox Invention', '#60A5FA', 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60'),
('mod-lk-6', 'LK-4-6-STEAM', 'LK 4-6 STEAM Coding', 'LK 4-6', 'Ages 4 - 6 (Little Kodders)', 'Interdisciplinary science, art, and math concepts with code blocks.', 20, 20, ARRAY['Science Experiments in Code', 'Geometric Art & Colors', 'Basic Math Counting Puzzles', 'Nature Phenomena Simulation'], 'Animated Solar System & Plant Life Cycle', '#06B6D4', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=60'),

-- Little Kodders (LK 6-8)
('mod-lk-7', 'LK-6-8-GA', 'LK 6-8 Games & Apps', 'LK 6-8', 'Ages 6 - 8 (Little Kodders)', 'Building custom 2D mini-games, clickable tablet apps, score counters.', 20, 20, ARRAY['UI Buttons & Screen Switching', 'Score Variables & Timers', 'Character Controls & Physics', 'App Publishing Basics'], 'Multi-Level Mini Arcade App Collection', '#10B981', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60'),
('mod-lk-8', 'LK-6-8-ROBOT', 'LK 6-8 Robot', 'LK 6-8', 'Ages 6 - 8 (Little Kodders)', 'Robotics logic, ultrasonic distance sensors, line tracking algorithms.', 20, 20, ARRAY['Motor Speed Control & Steering', 'Ultrasonic Sensor Distance Logic', 'Line Follower Algorithms', 'Robotic Arm Challenges'], 'Smart Obstacle-Avoiding Rover Robot', '#059669', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60'),
('mod-lk-9', 'LK-6-8-STEAM', 'LK 6-8 STEAM Coding', 'LK 6-8', 'Ages 6 - 8 (Little Kodders)', 'Advanced STEAM integration creating interactive science simulations.', 20, 20, ARRAY['Gravity & Velocity Simulations', 'Algorithmic Pattern Art', 'Sound Wave Synthesizers', 'Ecosystem Food Chain Model'], 'Interactive Science Discovery Lab', '#14B8A6', 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60'),
('mod-lk-10', 'LK-6-8-MATH', 'LK 6-8 Coding With Math', 'LK 6-8', 'Ages 6 - 8 (Little Kodders)', 'Coordinate axes, geometry, and mental math through coding games.', 20, 20, ARRAY['Cartesian Coordinates (X, Y)', 'Arithmetic Game Quizzes', 'Geometry Angle Drawing', 'Random Number Probability'], 'Math Quest: Dungeon Adventure Game', '#0D9488', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60'),
('mod-lk-11', 'LK-6-8-PROG', 'LK 6-8 Computer Programing', 'LK 6-8', 'Ages 6 - 8 (Little Kodders)', 'Core computer programming: conditional logic, nested loops, functions.', 20, 20, ARRAY['If-Else Conditionals', 'Nested Loops & Efficiency', 'Custom Functions & Parameters', 'Debugging Systematic Strategies'], 'Pet Simulation Tamagotchi Program', '#047857', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60'),
('mod-lk-12', 'LK-6-8-AI', 'LK 6-8 Active AI', 'LK 6-8', 'Ages 6 - 8 (Little Kodders)', 'AI concepts: image classification, voice models, and computer vision.', 20, 20, ARRAY['Machine Learning Training Data', 'Webcam Pose & Hand Tracking', 'Voice Command Recognizers', 'Ethical AI & Smart Assistants'], 'AI Magic Mirror with Gesture Controls', '#065F46', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=60'),

-- Junior (JK 8-12)
('mod-jk-1', 'JK-8-12-2D-AI', 'JK 8-12 2D Games and AI', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Building intelligent 2D arcade games featuring NPC pathfinding and enemy AI.', 20, 20, ARRAY['Enemy Patrolling & Line of Sight', 'State Machine AI Logic', 'Dynamic High-Score Leaderboards', 'Boss Fight Behavior Scripts'], 'Retro Cyberpunk Boss Battle 2D Game', '#8B5CF6', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60'),
('mod-jk-2', 'JK-8-12-MC1', 'JK 8-12 Minecraft 1', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Minecraft Education coding: block automation and Redstone circuitry logic.', 20, 20, ARRAY['Agent Automation & Pathing', 'Redstone Logic Gates (AND, OR, NOT)', 'Coordinate Math & Teleportation', 'Automated Mega-Structure Builder'], 'Smart Castle with Automated Defenses', '#7C3AED', 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=500&auto=format&fit=crop&q=60'),
('mod-jk-3', 'JK-8-12-MC2', 'JK 8-12 Minecraft 2', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Advanced Minecraft Modding, Python scripting in Minecraft.', 20, 20, ARRAY['Python In-Game API', 'Custom Mob Spawn Logic', 'Scoreboards & Mini-Game Arenas', 'Procedural Terrain Generation'], 'Multiplayer Parkour & Survival Arena', '#6D28D9', 'https://images.unsplash.com/photo-1627856014754-2907e2055704?w=500&auto=format&fit=crop&q=60'),
('mod-jk-4', 'JK-8-12-RBX1', 'JK 8-12 Roblox 1', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Roblox Studio 3D world creation, terrain modeling, and Lua scripting.', 20, 20, ARRAY['Roblox Studio 3D Tools', 'Lua Variables & Touch Events', 'Lava Jump Obstacles (Obby)', 'Checkpoints & Respawn Systems'], 'Multi-Stage 3D Roblox Obby Game', '#D97706', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60'),
('mod-jk-5', 'JK-8-12-RBX2', 'JK 8-12 Roblox 2', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Advanced Roblox Lua: DataStores, leaderstats, tool inventory.', 20, 20, ARRAY['DataStore Persistent Saving', 'In-Game Coins & Shop GUI', 'Custom Weapon & Tool Scripting', 'Multiplayer Tycoon Generators'], 'Full Multiplayer Simulator / Tycoon Game', '#B45309', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60'),
('mod-jk-6', 'JK-8-12-2DU', 'JK 8-12 2D Unity', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Introduction to Unity game engine with C# scripting basics.', 20, 20, ARRAY['Unity Editor & GameObjects', 'C# Scripting Foundations', '2D Colliders & Physics Forces', 'Tilemaps & Level Design'], 'Complete 2D Platformer Adventure Game', '#4B5563', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60'),
('mod-jk-7', 'JK-8-12-MAD', 'JK 8-12 Mobile Apps Dev', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Designing and coding Android/iOS mobile applications using visual logic.', 20, 20, ARRAY['Mobile UI/UX Layouts', 'GPS & Accelerometer Sensor APIs', 'Local Database Storage', 'App Testing on Mobile Device'], 'Smart Task & Fitness Companion Mobile App', '#EC4899', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60'),
('mod-jk-8', 'JK-8-12-CAJ', 'JK 8-12 Cyber Agents Junior', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Cybersecurity fundamentals: cipher cryptography and password defense.', 20, 20, ARRAY['Caesar & Vigenère Ciphers', 'Password Hashing & Cracking Defense', 'Phishing & Social Engineering Shield', 'Firewall Simulation Challenges'], 'Secret Agent Encrypted Chat Program', '#EF4444', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60'),
('mod-jk-9', 'JK-8-12-AIFS', 'JK 8-12 AI First Step', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Hands-on AI: Training machine learning models, image recognition, voice NLP.', 20, 20, ARRAY['Supervised Training & Datasets', 'Computer Vision Object Recognition', 'Speech to Text & NLP Models', 'Prompting & Generative Art'], 'Smart AI Assistant for School Homework', '#8B5CF6', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=60'),
('mod-jk-10', 'JK-8-12-2D3D', 'JK 8-12 2D&3D Design', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Vector illustration, 3D modeling, and asset pipeline for video games.', 20, 20, ARRAY['Vector Graphics & Sprite Sheets', '3D Poly Modeling & Extrusions', 'UV Texture Mapping & Lighting', 'Exporting Assets for Games'], '3D Cyber City Game Asset Portfolio', '#F59E0B', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'),
('mod-jk-11', 'JK-8-12-VCW', 'JK 8-12 Vibe Coding Web Creation', 'JK 8-12', 'Ages 8 - 12 (Junior)', 'Modern web development with aesthetic UI, CSS gradients, glassmorphism.', 20, 20, ARRAY['HTML5 Semantic Structure', 'CSS Flexbox & Aesthetic Design', 'JavaScript Interactive DOM', 'Publishing Web to Live URL'], 'Personal Interactive Creator Website', '#3B82F6', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&auto=format&fit=crop&q=60'),

-- Junior (JK 12-16)
('mod-jk-12', 'JK-12-16-PF', 'JK 12-16 Python First', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Text-based Python core: data structures, loops, file I/O, OOP programming.', 20, 20, ARRAY['Python Data Types & Lists/Dicts', 'Functions, Scope & Error Handling', 'Object-Oriented Programming (OOP)', 'File Handling & JSON Data'], 'Smart Personal Finance Manager CLI App', '#3776AB', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60'),
('mod-jk-13', 'JK-12-16-AI', 'JK 12-16 AI', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Neural networks, computer vision with OpenCV, MediaPipe gesture tracking.', 20, 20, ARRAY['OpenCV Real-time Video Stream', 'MediaPipe Hand & Face Mesh', 'Scikit-Learn Machine Learning', 'Deploying AI Python Models'], 'AI Real-time Hand-Tracking Air Canvas', '#6366F1', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=60'),
('mod-jk-14', 'JK-12-16-CEA', 'JK 12-16 Cyber Elite Agents', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Advanced ethical hacking, Wireshark, penetration testing, and web exploit defense.', 20, 20, ARRAY['TCP/IP Network Fundamentals', 'Port Scanning & Wireshark Analysis', 'SQL Injection & XSS Exploits', 'Penetration Testing Methodology'], 'Capture The Flag (CTF) Defense Blueprint', '#DC2626', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60'),
('mod-jk-15', 'JK-12-16-IOT', 'JK 12-16 IoT', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Internet of Things with ESP32/Arduino, cloud telemetry, home automation.', 20, 20, ARRAY['Microcontroller Circuit Wiring', 'Analog & Digital Sensor Readings', 'Wi-Fi & MQTT Cloud Telemetry', 'Smart Home Web Dashboard'], 'IoT Smart Automated Plant Watering Station', '#059669', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'),
('mod-jk-16', 'JK-12-16-FE', 'JK 12-16 Future Engineer', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Engineering principles, CAD 3D modeling, physics simulation, robotics.', 20, 20, ARRAY['CAD Mechanical Parts Modeling', 'Stress & Physics Simulation', 'Robotics Kinematics Control', 'Engineering Design Process'], 'Robotic Bionic Prosthetic Arm System', '#D97706', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'),
('mod-jk-17', 'JK-12-16-WAF', 'JK 12-16 AI Web App Frontend', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Modern frontend development with React, Tailwind CSS, TypeScript, OpenAI APIs.', 20, 20, ARRAY['React Component Architecture', 'Tailwind CSS Modern Styling', 'REST API & Streaming AI Calls', 'State Management & Deployment'], 'AI Powered Chat & Knowledge Copilot Web App', '#2563EB', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60'),
('mod-jk-18', 'JK-12-16-WAB', 'JK 12-16 AI Web App Back and', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Backend architecture with Node.js/Python, SQL databases, user authentication.', 20, 20, ARRAY['FastAPI / Express Server Routing', 'PostgreSQL & Database Models', 'JWT Auth & Security Middleware', 'AI Embeddings & Vector Stores'], 'Full-Stack Scalable AI Microservice Backend', '#4F46E5', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60'),
('mod-jk-19', 'JK-12-16-PA', 'JK 12-16 Python Arcade', 'JK 12-16', 'Ages 12 - 16 (Junior)', '2D game programming with Pygame: physics engines, sound synthesis, state managers.', 20, 20, ARRAY['Pygame Sprite & Group Logic', 'Custom 2D Collision Physics', 'Particle Generators & Juice VFX', 'Save State & Game Balancing'], 'Action-Packed Space Odyssey 2D Arcade Game', '#9333EA', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60'),
('mod-jk-20', 'JK-12-16-U3D', 'JK 12-16 Unity 3D Developer', 'JK 12-16', 'Ages 12 - 16 (Junior)', 'Professional 3D game development in Unity: C# programming, lighting, shaders.', 20, 20, ARRAY['3D Vector Math & Transforms', 'NavMesh Agent AI Pathfinding', 'Dynamic Lighting, Shadows & Post-Processing', 'Building Executable Game Packages'], 'First-Person Cyberpunk Exploration 3D Game', '#1E293B', 'https://images.unsplash.com/photo-1552824722-ddab137b4a6d?w=500&auto=format&fit=crop&q=60');
