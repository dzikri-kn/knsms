// Types definition for School Management System

export type UserRole = 
  | 'admin' 
  | 'admin_center' 
  | 'student_advisor' 
  | 'teacher' 
  | 'parent' 
  | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  centerId?: string; // If applicable
  centerName?: string;
  centerIds?: string[]; // Multiple assigned centers for Admin Center / Student Advisor
  handledParentIds?: string[]; // Handled parents for Student Advisor
  parentId?: string; // For student
  childrenIds?: string[]; // For parent
  specialization?: string; // For teacher
  level?: string; // For student
  joinDate: string;
}

export interface Center {
  id: string;
  name: string;
  code: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  roomCount: number;
  activeClassesCount: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export type ClassType = 'Regular' | 'Catchup' | 'Make-up' | 'Consult' | 'Trial';

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  type: ClassType;
  moduleId: string;
  moduleName: string;
  moduleLevel: string; // e.g. LK 4-6, JK 7-9, JK 10-12, JK 12-16
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  centerId: string;
  centerName: string;
  roomId: string;
  roomName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // '14:00'
  endTime: string; // '15:30'
  capacity: number;
  enrolledStudentsCount: number;
  studentIds: string[];
  status: 'active' | 'ongoing' | 'completed' | 'cancelled';
  zoomLink?: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  centerId: string;
  centerName: string;
  capacity: number;
  hasComputers: boolean;
  computerCount: number;
  facilities: string[];
  status: 'available' | 'in_use' | 'maintenance';
  zoomLink?: string;
}

export interface ModuleCurriculum {
  id: string;
  code: string;
  title: string;
  level: string; // 'LK 4-6 (Little Kids)', 'JK 7-9 (Junior Kids)', 'JK 10-12', 'JK 12-16 (Teens)'
  ageGroup: string;
  description: string;
  durationWeeks: number;
  totalLessons: number;
  topics: string[];
  finalProject: string;
  color: string;
  thumbnail?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  date: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
  markedByTeacherId: string;
  markedAt: string;
}

export interface StudentProject {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  moduleName: string;
  submissionDate: string;
  projectUrl: string;
  grade?: number; // 0-100
  feedback?: string;
  status: 'submitted' | 'reviewed' | 'showcased';
  thumbnail: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  centerId: string;
  centerName: string;
  advisorId: string;
  advisorName: string;
  bookingType: 'Trial' | 'Catchup' | 'Consult' | 'Internal Meeting';
  date: string;
  startTime: string;
  endTime: string;
  studentNames: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
}
