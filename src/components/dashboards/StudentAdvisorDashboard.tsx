import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, Avatar } from '../ui';
import { 
  Users, 
  Calendar, 
  DoorClosed, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Search,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';

export const StudentAdvisorDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, classrooms, bookings, addBooking, users, addUser, classes, centers } = useApp();

  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  const advisorClassrooms = classrooms.filter(r => assignedCenterIds.includes(r.centerId));
  const advisorBookings = bookings.filter(b => assignedCenterIds.includes(b.centerId) || b.advisorId === currentUser.id);
  const advisorStudents = users.filter(u => u.role === 'student' && u.centerId && assignedCenterIds.includes(u.centerId));

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Form Booking State
  const [bookingRoomId, setBookingRoomId] = useState(advisorClassrooms[0]?.id || classrooms[0]?.id || '');
  const [bookingType, setBookingType] = useState<'Trial' | 'Catchup' | 'Consult'>('Trial');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('15:00 - 16:00');
  const [bookingStudent, setBookingStudent] = useState('');

  // Form Lead/Student State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadLevel, setLeadLevel] = useState('JK 8-12');
  const [leadCenterId, setLeadCenterId] = useState(assignedCenterIds[0] || 'ctr-kemayoran');

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = advisorClassrooms.find(r => r.id === bookingRoomId) || classrooms.find(r => r.id === bookingRoomId) || classrooms[0];
    const [start, end] = bookingTime.split(' - ');
    addBooking({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      centerId: selectedRoom.centerId,
      centerName: selectedRoom.centerName,
      advisorId: currentUser.id,
      advisorName: currentUser.name,
      bookingType: bookingType,
      date: bookingDate,
      startTime: start || '15:00',
      endTime: end || '16:00',
      studentNames: [bookingStudent || 'New Prospect Student'],
      status: 'confirmed'
    });
    setBookingStudent('');
    setIsBookingModalOpen(false);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const leadCenter = centers.find(c => c.id === leadCenterId) || centers[0];
    addUser({
      name: leadName,
      email: leadEmail || `${leadName.toLowerCase().replace(/\s+/g, '')}@lead.com`,
      phone: leadPhone,
      role: 'student',
      status: 'pending',
      level: leadLevel,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      centerId: leadCenter.id,
      centerName: leadCenter.name
    });
    setLeadName('');
    setLeadEmail('');
    setLeadPhone('');
    setIsLeadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Advisor Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" className="bg-white/20 text-white border-white/30 text-xs">
              Student Advisor Portal
            </Badge>
            <span className="text-xs text-purple-200">Consultation & Enrollment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {currentUser.name}!</h1>
          <p className="text-purple-100 text-sm mt-1">
            Manage student registrations, book free trial coding sessions, parent consultations, and lab room reservations.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<UserPlus className="w-4 h-4 text-purple-700" />}
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-white text-purple-700 hover:bg-purple-50 font-bold border-none"
          >
            Add New Lead / Prospect
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<DoorClosed className="w-4 h-4" />}
            onClick={() => setIsBookingModalOpen(true)}
            className="border-white/40 text-white hover:bg-white/10"
          >
            Book Trial / Catchup Room
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Managed Students</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{advisorStudents.length} Students</div>
          <p className="text-xs text-gray-500 mt-1">Assigned Center Cohorts</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Trials This Week</span>
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {advisorBookings.filter(b => b.bookingType === 'Trial').length} Sessions
          </div>
          <p className="text-xs text-success-600 font-semibold mt-1">↗ Confirmed Attendees</p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Conversion Rate</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">74.5%</div>
          <p className="text-xs text-gray-500 mt-1">Trial to Regular Enrollment</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Catchup Scheduled</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{advisorBookings.length} Bookings</div>
          <p className="text-xs text-gray-500 mt-1">Lab Rooms Reserved</p>
        </Card>
      </div>

      {/* Booked Rooms & Sessions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Trial & Catchup Room Bookings</h2>
              <p className="text-xs text-gray-500">Active reservations for trials, catchup lessons, and consultations</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsBookingModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
              New Booking
            </Button>
          </div>

          <div className="space-y-3">
            {advisorBookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 font-medium">
                No room bookings currently active.
              </div>
            ) : (
              advisorBookings.map((b) => (
                <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                      <DoorClosed className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{b.roomName}</span>
                        <Badge variant={b.bookingType === 'Trial' ? 'warning' : 'primary'} size="sm">
                          {b.bookingType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        👤 {b.studentNames.join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Advisor: {b.advisorName} • {b.centerName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-900">{b.date}</div>
                    <div className="text-xs text-purple-600 font-semibold">{b.startTime} - {b.endTime}</div>
                    <Badge variant="success" size="sm" className="mt-1">Confirmed</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Lead CRM Pipeline Quick Widget */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Student Prospect Leads</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsLeadModalOpen(true)}>
              + Add
            </Button>
          </div>
          <div className="space-y-3">
            {advisorStudents.slice(0, 5).map((st) => (
              <div key={st.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar name={st.name} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">{st.name}</div>
                    <div className="text-[11px] text-gray-500">{st.level || 'JK Module'}</div>
                  </div>
                </div>
                <Badge variant={st.status === 'active' ? 'success' : 'warning'} size="sm">
                  {st.status === 'active' ? 'Enrolled' : 'New Lead'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal Booking Room */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Book Room for Trial / Catchup">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Room</label>
            <select
              value={bookingRoomId}
              onChange={(e) => setBookingRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {classrooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - Capacity: {r.capacity} Students
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Session Type</label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Trial">Free Trial Class</option>
                <option value="Catchup">Catchup Missing Lesson</option>
                <option value="Consult">Parent Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Time Slot</label>
            <input
              type="text"
              placeholder="15:00 - 16:00"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prospect Student / Note</label>
            <input
              type="text"
              required
              placeholder="e.g. Ryan & Parent (Trial Scratch)"
              value={bookingStudent}
              onChange={(e) => setBookingStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-purple-600 hover:bg-purple-700">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Lead Input */}
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="Add Student Lead (Prospect)">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Student Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alvin Pratama"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parent's WhatsApp / Phone</label>
              <input
                type="tel"
                placeholder="0812-xxxx-xxxx"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Module Track</label>
              <select
                value={leadLevel}
                onChange={(e) => setLeadLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="LK 4-6">LK 4-6 (Little Kids)</option>
                <option value="JK 7-9">JK 7-9 (Junior Kids)</option>
                <option value="JK 10-12">JK 10-12 (Roblox/Web)</option>
                <option value="JK 12-16">JK 12-16 (Python/AI)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-purple-600 hover:bg-purple-700">
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
