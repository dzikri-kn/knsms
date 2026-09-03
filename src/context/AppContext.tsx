import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Center,
  ClassItem,
  Classroom,
  ModuleCurriculum,
  AttendanceRecord,
  StudentProject,
  RoomBooking
} from '../types';

import { executeNeonQuery } from '../services/neonDbClient';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  originalAdminUser: User | null;
  isSuperAdminSession: boolean;
  switchRole: (role: UserRole) => void;
  resetToAdmin: () => void;

  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;

  // Database status
  isLoadingDb: boolean;
  dbError: string | null;
  refreshDb: () => Promise<void>;

  // Center filter
  selectedCenterId: string;
  setSelectedCenterId: (id: string) => void;

  // Data entities
  centers: Center[];
  modules: ModuleCurriculum[];
  classrooms: Classroom[];
  users: User[];
  classes: ClassItem[];
  attendance: AttendanceRecord[];
  projects: StudentProject[];
  bookings: RoomBooking[];

  // CRUD Actions
  addUser: (user: Omit<User, 'id' | 'joinDate'>, customPassword?: string) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  addCenter: (center: Omit<Center, 'id'>) => Promise<void>;
  updateCenter: (id: string, center: Partial<Center>) => Promise<void>;
  deleteCenter: (id: string) => Promise<void>;

  addModule: (mod: Omit<ModuleCurriculum, 'id'>) => Promise<void>;
  updateModule: (id: string, mod: Partial<ModuleCurriculum>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;

  addClass: (cls: Omit<ClassItem, 'id'>) => Promise<void>;
  updateClass: (id: string, cls: Partial<ClassItem>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  addClassroom: (room: Omit<Classroom, 'id'>) => Promise<void>;
  updateClassroom: (id: string, room: Partial<Classroom>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;

  addBooking: (booking: Omit<RoomBooking, 'id'>) => Promise<void>;
  updateBooking: (id: string, booking: Partial<RoomBooking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'markedAt'>) => Promise<void>;
  addProject: (proj: Omit<StudentProject, 'id' | 'submissionDate'>) => Promise<void>;
  updateProject: (id: string, proj: Partial<StudentProject>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Row Mappers ---
const mapCenter = (r: any): Center => ({
  id: r.id,
  name: r.name,
  code: r.code,
  city: r.city,
  province: r.province,
  address: r.address,
  phone: r.phone,
  email: r.email,
  studentCount: Number(r.student_count) || 0,
  teacherCount: Number(r.teacher_count) || 0,
  roomCount: Number(r.room_count) || 0,
  activeClassesCount: Number(r.active_classes_count) || 0,
  status: r.status || 'active',
});

const mapUser = (r: any): User => {
  let parsedCenterIds: string[] = [];
  if (Array.isArray(r.center_ids)) {
    parsedCenterIds = r.center_ids;
  } else if (typeof r.center_ids === 'string' && r.center_ids.trim() !== '') {
    try {
      parsedCenterIds = JSON.parse(r.center_ids);
    } catch {
      parsedCenterIds = r.center_ids.replace(/[\{\}\"\'\[\]]/g, '').split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    avatar: r.avatar || '',
    phone: r.phone || '',
    status: r.status || 'active',
    centerId: r.center_id || '',
    centerIds: parsedCenterIds,
    specialization: r.specialization || '',
    level: r.level || '',
    joinDate: r.join_date ? String(r.join_date).split('T')[0] : new Date().toISOString().split('T')[0],
    parentId: r.parent_id || '',
    childrenIds: r.children_ids || [],
  };
};

const mapModule = (r: any): ModuleCurriculum => ({
  id: r.id,
  code: r.code,
  title: r.title,
  level: r.level,
  ageGroup: r.age_group || '',
  description: r.description || '',
  durationWeeks: Number(r.duration_weeks) || 20,
  totalLessons: Number(r.total_lessons) || 20,
  topics: r.topics || [],
  finalProject: r.final_project || '',
  color: r.color || '#007AFF',
  thumbnail: r.thumbnail || '',
});

const mapClassroom = (r: any): Classroom => ({
  id: r.id,
  name: r.name,
  code: r.code,
  centerId: r.center_id,
  centerName: r.center_name || '',
  capacity: Number(r.capacity) || 6,
  hasComputers: r.has_computers ?? true,
  computerCount: Number(r.computer_count) || 6,
  facilities: r.facilities || [],
  status: r.status || 'available',
});

const mapClass = (r: any): ClassItem => ({
  id: r.id,
  name: r.name,
  code: r.code,
  type: r.type || 'Regular',
  moduleId: r.module_id || '',
  moduleName: r.module_name || '',
  moduleLevel: r.module_level || '',
  teacherId: r.teacher_id || '',
  teacherName: r.teacher_name || '',
  teacherAvatar: r.teacher_avatar || '',
  centerId: r.center_id || '',
  centerName: r.center_name || '',
  roomId: r.room_id || '',
  roomName: r.room_name || '',
  dayOfWeek: r.day_of_week || '',
  startTime: r.start_time || '',
  endTime: r.end_time || '',
  capacity: Number(r.capacity) || 6,
  enrolledStudentsCount: Number(r.enrolled_students_count) || 0,
  studentIds: r.student_ids || [],
  status: r.status || 'active',
  zoomLink: r.zoom_link || '',
});

const mapProject = (r: any): StudentProject => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  title: r.title,
  description: r.description || '',
  moduleName: r.module_name || '',
  submissionDate: r.submission_date ? String(r.submission_date).split('T')[0] : new Date().toISOString().split('T')[0],
  projectUrl: r.project_url || '',
  grade: r.grade || undefined,
  feedback: r.feedback || '',
  status: r.status || 'submitted',
  thumbnail: r.thumbnail || '',
});

const mapAttendance = (r: any): AttendanceRecord => ({
  id: r.id,
  classId: r.class_id,
  className: r.class_name || '',
  date: r.date ? String(r.date).split('T')[0] : new Date().toISOString().split('T')[0],
  studentId: r.student_id,
  studentName: r.student_name,
  studentAvatar: r.student_avatar || '',
  status: r.status,
  note: r.note || '',
  markedByTeacherId: r.marked_by_teacher_id || '',
  markedAt: r.marked_at || '',
});

// --- Provider ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [modules, setModules] = useState<ModuleCurriculum[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);

  const EMPTY_USER: User = {
    id: '', name: '', email: '', role: 'student', avatar: '', phone: '',
    status: 'active', joinDate: '', centerId: '', centerIds: [], specialization: '', level: '',
  };
  const [currentUser, setCurrentUser] = useState<User>(EMPTY_USER);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');

  // Check if current session originated from a Super Admin
  const isSuperAdminSession = Boolean(
    currentUser.role === 'admin' || (originalAdminUser && originalAdminUser.role === 'admin')
  );

  // ─── Fetch all data from Neon DB ─────────────────────────────────────────
  const refreshDb = async () => {
    setIsLoadingDb(true);
    setDbError(null);
    try {
      const [centersRes, usersRes, modulesRes, roomsRes, classesRes, projectsRes, attendanceRes] =
        await Promise.all([
          executeNeonQuery('SELECT * FROM centers ORDER BY name ASC'),
          executeNeonQuery('SELECT * FROM users ORDER BY id ASC'),
          executeNeonQuery('SELECT * FROM modules ORDER BY id ASC'),
          executeNeonQuery('SELECT * FROM classrooms ORDER BY name ASC'),
          executeNeonQuery('SELECT * FROM classes ORDER BY id ASC'),
          executeNeonQuery('SELECT * FROM student_projects ORDER BY id DESC'),
          executeNeonQuery('SELECT * FROM attendance_records ORDER BY date DESC, id DESC'),
        ]);

      if (centersRes.rows.length > 0) setCenters(centersRes.rows.map(mapCenter));
      if (usersRes.rows.length > 0) setUsers(usersRes.rows.map(mapUser));
      if (modulesRes.rows.length > 0) setModules(modulesRes.rows.map(mapModule));
      if (roomsRes.rows.length > 0) setClassrooms(roomsRes.rows.map(mapClassroom));
      if (classesRes.rows.length > 0) setClasses(classesRes.rows.map(mapClass));
      if (projectsRes.rows.length > 0) setProjects(projectsRes.rows.map(mapProject));
      if (attendanceRes.rows.length > 0) setAttendance(attendanceRes.rows.map(mapAttendance));
    } catch (e: any) {
      console.error('Neon DB sync error:', e);
      setDbError('Gagal terhubung ke database. Periksa koneksi internet Anda.');
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    refreshDb();
  }, []);

  // ─── Authentication (verified directly from Neon DB) ───────────────────
  const login = async (emailInput: string, _password?: string): Promise<boolean> => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    try {
      // 1. Fetch fresh users directly from Neon database
      const result = await executeNeonQuery('SELECT * FROM users ORDER BY id ASC');
      const dbUsers: User[] = (result.rows || []).map(mapUser);
      
      // Update global users state with fresh data from DB
      if (dbUsers.length > 0) {
        setUsers(dbUsers);
      }

      // 2. Match email (case-insensitive) or match single super admin
      let foundUser = dbUsers.find(
        u => (u.email || '').trim().toLowerCase() === cleanEmail
      );

      // Support alias for budi.santoso@kodingnext.id -> admin@kodingnext.com
      if (!foundUser && (cleanEmail === 'budi.santoso@kodingnext.id' || cleanEmail === 'admin@kodingnext.com')) {
        foundUser = dbUsers.find(u => u.role === 'admin') || dbUsers[0];
      }

      if (foundUser) {
        setCurrentUser(foundUser);
        if (foundUser.role === 'admin') {
          setOriginalAdminUser(foundUser);
          setSelectedCenterId('all');
        } else {
          setOriginalAdminUser(null);
          setSelectedCenterId(foundUser.centerId || 'all');
        }
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Login database verification error:', e);
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(EMPTY_USER);
    setOriginalAdminUser(null);
    setSelectedCenterId('all');
  };

  // Switch role is ONLY available if current session belongs to Super Admin
  const switchRole = (role: UserRole) => {
    if (!isSuperAdminSession) return;

    if (role === 'admin') {
      resetToAdmin();
      return;
    }

    // Keep reference of the original super admin if not set
    if (!originalAdminUser && currentUser.role === 'admin') {
      setOriginalAdminUser(currentUser);
    }

    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      setSelectedCenterId(targetUser.centerId || 'all');
    }
  };

  const resetToAdmin = () => {
    if (!isSuperAdminSession) return;
    const adminUser = originalAdminUser || users.find(u => u.role === 'admin');
    if (adminUser) {
      setCurrentUser(adminUser);
      setSelectedCenterId('all');
    }
  };

  // ─── User CRUD ─────────────────────────────────────────────────────────
  const addUser = async (userData: Omit<User, 'id' | 'joinDate'>, customPassword?: string) => {
    const newId = `usr-${Date.now()}`;
    const joinDate = new Date().toISOString().split('T')[0];
    const passwordHash = customPassword || 'kodingnext123';

    await executeNeonQuery(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, phone, status, center_id, center_ids, specialization, level, join_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (email) DO UPDATE SET 
         name=EXCLUDED.name, 
         role=EXCLUDED.role,
         password_hash=COALESCE(users.password_hash, EXCLUDED.password_hash)`,
      [
        newId, 
        userData.name, 
        userData.email, 
        passwordHash, 
        userData.role, 
        userData.avatar||null,
        userData.phone||null, 
        userData.status||'active', 
        userData.centerId||null,
        userData.centerIds||null, 
        userData.specialization||null, 
        userData.level||null, 
        joinDate
      ]
    );
    await refreshDb();
  };

  const updateUser = async (id: string, updatedData: Partial<User>) => {
    await executeNeonQuery(
      `UPDATE users SET
         name=COALESCE($2,name), phone=COALESCE($3,phone),
         role=COALESCE($4,role), status=COALESCE($5,status),
         avatar=COALESCE($6,avatar), center_id=COALESCE($7,center_id),
         center_ids=COALESCE($8,center_ids),
         specialization=COALESCE($9,specialization),
         level=COALESCE($10,level)
       WHERE id=$1`,
      [
        id, 
        updatedData.name || null, 
        updatedData.phone || null,
        updatedData.role || null, 
        updatedData.status || null,
        updatedData.avatar || null, 
        updatedData.centerId || null,
        updatedData.centerIds || null,
        updatedData.specialization || null,
        updatedData.level || null
      ]
    );
    await refreshDb();
  };

  const changePassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'Password minimal terdiri dari 4 karakter.' };
    }

    try {
      await executeNeonQuery(
        `UPDATE users SET password_hash = $2 WHERE id = $1`,
        [userId, newPassword.trim()]
      );
      return { success: true, message: 'Password berhasil diperbarui!' };
    } catch (e: any) {
      console.error('Change password error:', e);
      return { success: false, message: 'Gagal memperbarui password ke database.' };
    }
  };

  const deleteUser = async (id: string) => {
    await executeNeonQuery('DELETE FROM users WHERE id=$1', [id]);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // ─── Center CRUD ────────────────────────────────────────────────────────
  const addCenter = async (centerData: Omit<Center, 'id'>) => {
    const newId = `ctr-${Date.now()}`;
    await executeNeonQuery(
      `INSERT INTO centers (id,name,code,city,province,address,phone,email,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [newId, centerData.name, centerData.code, centerData.city, centerData.province,
       centerData.address, centerData.phone, centerData.email, centerData.status||'active']
    );
    await refreshDb();
  };

  const updateCenter = async (id: string, updatedData: Partial<Center>) => {
    await executeNeonQuery(
      `UPDATE centers SET
         name=COALESCE($2,name), address=COALESCE($3,address),
         phone=COALESCE($4,phone), email=COALESCE($5,email), status=COALESCE($6,status)
       WHERE id=$1`,
      [id, updatedData.name||null, updatedData.address||null,
       updatedData.phone||null, updatedData.email||null, updatedData.status||null]
    );
    await refreshDb();
  };

  const deleteCenter = async (id: string) => {
    await executeNeonQuery('DELETE FROM centers WHERE id=$1', [id]);
    setCenters(prev => prev.filter(c => c.id !== id));
  };

  // ─── Module CRUD ────────────────────────────────────────────────────────
  const addModule = async (modData: Omit<ModuleCurriculum, 'id'>) => {
    const newId = `mod-${Date.now()}`;
    await executeNeonQuery(
      `INSERT INTO modules (id,code,title,level,age_group,description,duration_weeks,total_lessons,topics,final_project,color,thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [newId, modData.code, modData.title, modData.level, modData.ageGroup||'',
       modData.description||'', 20, 20, modData.topics||[],
       modData.finalProject||'', modData.color||'#007AFF', modData.thumbnail||'']
    );
    await refreshDb();
  };

  const updateModule = async (id: string, updatedData: Partial<ModuleCurriculum>) => {
    await executeNeonQuery(
      `UPDATE modules SET
         title=COALESCE($2,title), description=COALESCE($3,description),
         color=COALESCE($4,color), thumbnail=COALESCE($5,thumbnail)
       WHERE id=$1`,
      [id, updatedData.title||null, updatedData.description||null,
       updatedData.color||null, updatedData.thumbnail||null]
    );
    await refreshDb();
  };

  const deleteModule = async (id: string) => {
    await executeNeonQuery('DELETE FROM modules WHERE id=$1', [id]);
    setModules(prev => prev.filter(m => m.id !== id));
  };

  // ─── Class CRUD ─────────────────────────────────────────────────────────
  const addClass = async (classData: Omit<ClassItem, 'id'>) => {
    const newId = `cls-${Date.now()}`;
    await executeNeonQuery(
      `INSERT INTO classes (id,name,code,type,module_id,module_name,module_level,teacher_id,teacher_name,teacher_avatar,center_id,center_name,room_id,room_name,day_of_week,start_time,end_time,capacity,enrolled_students_count,student_ids,status,zoom_link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [newId, classData.name, classData.code, classData.type||'Regular',
       classData.moduleId||null, classData.moduleName||null, classData.moduleLevel||null,
       classData.teacherId||null, classData.teacherName||null, classData.teacherAvatar||null,
       classData.centerId||null, classData.centerName||null,
       classData.roomId||null, classData.roomName||null,
       classData.dayOfWeek, classData.startTime, classData.endTime,
       6, classData.enrolledStudentsCount||0, classData.studentIds||[],
       classData.status||'active', classData.zoomLink||null]
    );
    await refreshDb();
  };

  const updateClass = async (id: string, updatedData: Partial<ClassItem>) => {
    await executeNeonQuery(
      `UPDATE classes SET
         status=COALESCE($2,status),
         enrolled_students_count=COALESCE($3,enrolled_students_count),
         student_ids=COALESCE($4,student_ids)
       WHERE id=$1`,
      [id, updatedData.status||null,
       updatedData.enrolledStudentsCount??null,
       updatedData.studentIds||null]
    );
    await refreshDb();
  };

  const deleteClass = async (id: string) => {
    await executeNeonQuery('DELETE FROM classes WHERE id=$1', [id]);
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // ─── Classroom CRUD ──────────────────────────────────────────────────────
  const addClassroom = async (roomData: Omit<Classroom, 'id'>) => {
    const newId = `room-${Date.now()}`;
    await executeNeonQuery(
      `INSERT INTO classrooms (id,name,code,center_id,center_name,capacity,has_computers,computer_count,facilities,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [newId, roomData.name, roomData.code, roomData.centerId,
       roomData.centerName||'', 6, roomData.hasComputers??true,
       roomData.computerCount||6, roomData.facilities||[], roomData.status||'available']
    );
    await refreshDb();
  };

  const updateClassroom = async (id: string, updatedData: Partial<Classroom>) => {
    await executeNeonQuery(
      `UPDATE classrooms SET
         name=COALESCE($2,name), status=COALESCE($3,status),
         capacity=COALESCE($4,capacity)
       WHERE id=$1`,
      [id, updatedData.name||null, updatedData.status||null, updatedData.capacity||null]
    );
    await refreshDb();
  };

  const deleteClassroom = async (id: string) => {
    await executeNeonQuery('DELETE FROM classrooms WHERE id=$1', [id]);
    setClassrooms(prev => prev.filter(r => r.id !== id));
  };

  // ─── Booking CRUD (local only — no bookings table in schema) ─────────────
  const addBooking = async (bookingData: Omit<RoomBooking, 'id'>) => {
    const newBooking: RoomBooking = { ...bookingData, id: `bk-${Date.now()}` };
    setBookings(prev => [newBooking, ...prev]);
  };

  const updateBooking = async (id: string, updatedData: Partial<RoomBooking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatedData } : b));
  };

  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // ─── Attendance ──────────────────────────────────────────────────────────
  const markAttendance = async (recordData: Omit<AttendanceRecord, 'id' | 'markedAt'>) => {
    const newId = `att-${Date.now()}`;
    const markedAt = new Date().toISOString();
    await executeNeonQuery(
      `INSERT INTO attendance_records (id,class_id,class_name,date,student_id,student_name,student_avatar,status,note,marked_by_teacher_id,marked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT DO NOTHING`,
      [newId, recordData.classId, recordData.className||'', recordData.date,
       recordData.studentId, recordData.studentName, recordData.studentAvatar||'',
       recordData.status, recordData.note||'', recordData.markedByTeacherId||null, markedAt]
    );
    await refreshDb();
  };

  // ─── Projects ────────────────────────────────────────────────────────────
  const addProject = async (projData: Omit<StudentProject, 'id' | 'submissionDate'>) => {
    const newId = `proj-${Date.now()}`;
    const submissionDate = new Date().toISOString().split('T')[0];
    await executeNeonQuery(
      `INSERT INTO student_projects (id,student_id,student_name,title,description,module_name,submission_date,project_url,grade,feedback,status,thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [newId, projData.studentId, projData.studentName, projData.title,
       projData.description||'', projData.moduleName||'', submissionDate,
       projData.projectUrl||'', projData.grade||null, projData.feedback||'',
       projData.status||'submitted', projData.thumbnail||'']
    );
    await refreshDb();
  };

  const updateProject = async (id: string, updatedData: Partial<StudentProject>) => {
    await executeNeonQuery(
      `UPDATE student_projects SET
         grade=COALESCE($2,grade), feedback=COALESCE($3,feedback), status=COALESCE($4,status)
       WHERE id=$1`,
      [id, updatedData.grade||null, updatedData.feedback||null, updatedData.status||null]
    );
    await refreshDb();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: currentUser,
        setCurrentUser,
        originalAdminUser,
        isSuperAdminSession,
        switchRole,
        resetToAdmin,
        isAuthenticated,
        login,
        logout,
        isLoadingDb,
        dbError,
        refreshDb,
        selectedCenterId,
        setSelectedCenterId,
        centers,
        modules,
        classrooms,
        users,
        classes,
        attendance,
        projects,
        bookings,
        addUser,
        updateUser,
        deleteUser,
        changePassword,
        addCenter,
        updateCenter,
        deleteCenter,
        addModule,
        updateModule,
        deleteModule,
        addClass,
        updateClass,
        deleteClass,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        addBooking,
        updateBooking,
        deleteBooking,
        markAttendance,
        addProject,
        updateProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
