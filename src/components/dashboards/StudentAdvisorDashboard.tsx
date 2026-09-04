import React, { useState, useEffect } from 'react';
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
  Mail,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Check,
  AlertCircle,
  Trash2,
  Building2,
  MapPin
} from 'lucide-react';

export const StudentAdvisorDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, classrooms, bookings, addBooking, updateBooking, users, addUser, updateUser, classes, centers, selectedCenterId, setSelectedCenterId, isSuperAdminSession } = useApp();

  // If super admin session, all centers are accessible. Otherwise, assigned centers for this advisor.
  const assignedCenterIds = isSuperAdminSession
    ? centers.map(c => c.id)
    : (currentUser.centerIds && currentUser.centerIds.length > 0
        ? currentUser.centerIds
        : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']));

  const assignedCenters = isSuperAdminSession
    ? centers
    : centers.filter(c => assignedCenterIds.includes(c.id));

  // Determine initial active center (prefer selectedCenterId if valid and not 'all')
  const defaultCenterId = (selectedCenterId && selectedCenterId !== 'all' && centers.some(c => c.id === selectedCenterId))
    ? selectedCenterId
    : (currentUser.centerId && currentUser.centerId !== 'all' ? currentUser.centerId : (assignedCenterIds[0] || 'ctr-kemayoran'));

  const [activeCenterId, setActiveCenterId] = useState<string>(defaultCenterId);

  // Keep in sync if selectedCenterId changes externally
  useEffect(() => {
    if (selectedCenterId && selectedCenterId !== 'all' && centers.some(c => c.id === selectedCenterId)) {
      setActiveCenterId(selectedCenterId);
    }
  }, [selectedCenterId, centers]);

  const currentCenter = centers.find(c => c.id === activeCenterId) || assignedCenters[0] || centers[0];

  // Data scoped specifically to the current active center
  const advisorClassrooms = classrooms.filter(r => r.centerId === currentCenter?.id || (currentCenter?.id === 'ctr-online' && r.centerName === 'Online'));
  const advisorBookings = bookings.filter(b => b.centerId === currentCenter?.id);
  const advisorStudents = users.filter(u => u.role === 'student' && u.centerId === currentCenter?.id);
  const advisorParents = users.filter(u => {
    if (u.role !== 'parent') return false;
    const hasDirect = u.centerId === currentCenter?.id;
    const hasMulti = u.centerIds && u.centerIds.includes(currentCenter?.id);
    const hasChild = u.childrenIds && users.some(s => u.childrenIds?.includes(s.id) && s.centerId === currentCenter?.id);
    return hasDirect || hasMulti || hasChild;
  });

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Form Booking Trial Class State
  const [bookingRoomId, setBookingRoomId] = useState(advisorClassrooms[0]?.id || classrooms[0]?.id || '');
  const [bookingType, setBookingType] = useState<'Trial' | 'Catchup' | 'Consult'>('Trial');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('15:00 - 16:00');

  // Parent info
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Child / Student info
  const [childName, setChildName] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [childLevel, setChildLevel] = useState('JK 7-9');
  const [bookingCenterId, setBookingCenterId] = useState(assignedCenterIds[0] || 'ctr-kemayoran');

  // Success / notification modal or toast
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'info'; title: string; desc: string } | null>(null);

  const handleOpenBookingModal = () => {
    const defaultCenter = activeCenterId || assignedCenterIds[0] || 'ctr-kemayoran';
    setBookingCenterId(defaultCenter);
    const rooms = classrooms.filter(r => r.centerId === defaultCenter || defaultCenter === 'ctr-online');
    setBookingRoomId(rooms[0]?.id || classrooms[0]?.id || '');
    setBookingType('Trial');
    setBookingDate(new Date().toISOString().split('T')[0]);
    setBookingTime('15:00 - 16:00');
    setParentName('');
    setParentEmail('');
    setParentPhone('');
    setChildName('');
    setChildEmail('');
    setChildLevel('JK 7-9');
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selCenter = centers.find(c => c.id === bookingCenterId) || centers[0];
    const selectedRoom = classrooms.find(r => r.id === bookingRoomId) || classrooms[0];
    const [start, end] = bookingTime.split(' - ');

    addBooking({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      centerId: selCenter.id,
      centerName: selCenter.name,
      advisorId: currentUser.id,
      advisorName: currentUser.name,
      bookingType: bookingType,
      date: bookingDate,
      startTime: start || '15:00',
      endTime: end || '16:00',
      studentNames: [childName || 'Calon Murid'],
      status: 'pending', // Pending confirmation by Admin Center
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim().toLowerCase(),
      parentPhone: parentPhone.trim(),
      studentName: childName.trim(),
      studentEmail: childEmail.trim().toLowerCase() || `${childName.trim().toLowerCase().replace(/\s+/g, '')}@student.kodingnext.com`,
      studentLevel: childLevel,
      paymentStatus: 'unpaid',
      trialCompleted: false,
    });

    setIsBookingModalOpen(false);
    setNotificationMsg({
      type: 'success',
      title: 'Trial Class Berhasil Diajukan!',
      desc: `Jadwal trial untuk ${childName} telah dikirim ke Admin Center (${selCenter.name}) untuk dikonfirmasi. Setelah trial dan pembayaran kursus, Anda dapat mengonfirmasi status menjadi Paid untuk membuat akun.`
    });
  };

  // Confirm Paid & Auto-Create / Link Parent & Student Accounts
  const handleConfirmPaid = async (booking: typeof bookings[0]) => {
    if (!booking.studentName || !booking.parentName) return;

    // 1. Mark booking as paid and completed
    updateBooking(booking.id, {
      paymentStatus: 'paid',
      trialCompleted: true,
      status: 'confirmed'
    });

    const studentEmail = booking.studentEmail || `${booking.studentName.toLowerCase().replace(/\s+/g, '')}@student.kodingnext.com`;
    const parentEmail = booking.parentEmail || `${booking.parentName.toLowerCase().replace(/\s+/g, '')}@parent.kodingnext.com`;
    const center = centers.find(c => c.id === booking.centerId) || centers[0];

    // 2. Check if parent already exists
    const existingParent = users.find(u =>
      u.role === 'parent' &&
      (u.email.toLowerCase() === parentEmail.toLowerCase() || (booking.parentPhone && u.phone === booking.parentPhone))
    );

    // 3. Create Student Account
    const studentId = `usr-st-${Date.now()}`;
    await addUser({
      name: booking.studentName,
      email: studentEmail,
      phone: booking.parentPhone || '',
      role: 'student',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      centerId: center.id,
      centerIds: [center.id],
      centerName: center.name,
      level: booking.studentLevel || 'JK 7-9',
      parentId: existingParent ? existingParent.id : undefined,
    }, 'kodingnext123');

    // 4. Handle Parent Account (Create or Link)
    if (existingParent) {
      // Link child to existing parent
      const currentChildren = existingParent.childrenIds || [];
      const updatedChildren = Array.from(new Set([...currentChildren, studentId]));
      const parentCenters = Array.from(new Set([...(existingParent.centerIds || []), center.id]));

      await updateUser(existingParent.id, {
        childrenIds: updatedChildren,
        centerIds: parentCenters,
      });

      setNotificationMsg({
        type: 'success',
        title: 'Pembayaran Dikonfirmasi & Akun Ditautkan!',
        desc: `Akun murid "${booking.studentName}" berhasil dibuat dan otomatis ditautkan ke akun Parent yang sudah terdaftar (${existingParent.name} - ${existingParent.email}).`
      });
    } else {
      // Create new Parent Account and link the student
      await addUser({
        name: booking.parentName,
        email: parentEmail,
        phone: booking.parentPhone || '',
        role: 'parent',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        centerId: center.id,
        centerIds: [center.id],
        centerName: center.name,
        childrenIds: [studentId],
      }, 'kodingnext123');

      setNotificationMsg({
        type: 'success',
        title: 'Pembayaran Dikonfirmasi & Akun Dibuat!',
        desc: `Sistem telah otomatis membuat Akun Parent (${booking.parentName}) dan Akun Murid (${booking.studentName}) dengan password default: kodingnext123.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Advisor Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="purple" className="bg-white/20 text-white border-white/30 text-xs">
              Student Advisor Portal
            </Badge>
            <span className="text-xs text-purple-200">Official Branch</span>
            {assignedCenters.length > 1 && (
              <select
                value={activeCenterId}
                onChange={(e) => {
                  setActiveCenterId(e.target.value);
                  setSelectedCenterId(e.target.value);
                }}
                className="ml-2 px-2.5 py-1 bg-white/20 text-white border border-white/30 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
              >
                {assignedCenters.map(c => (
                  <option key={c.id} value={c.id} className="text-gray-900 bg-white">
                    🏢 {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentCenter?.name}</h1>
          <p className="text-purple-200 text-sm mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> {currentCenter?.city}, {currentCenter?.province} • Trial Class & Consultation Pipeline
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-4 h-4 text-purple-700" />}
            onClick={handleOpenBookingModal}
            className="bg-white text-purple-700 hover:bg-purple-50 font-bold border-none shadow-sm"
          >
            Book Trial Class
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Calendar className="w-4 h-4" />}
            onClick={() => onNavigate('schedule')}
            className="border-white/40 text-white hover:bg-white/10 font-bold"
          >
            View Schedule & Timetable
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
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{advisorStudents.length} Murid</div>
          <p className="text-xs text-gray-500 mt-1">Assigned Center Cohorts</p>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Managed Parents</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{advisorParents.length} Orang Tua</div>
          <p className="text-xs text-blue-600 font-semibold mt-1">Akun Parent Aktif</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Trials This Week</span>
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {advisorBookings.filter(b => b.bookingType === 'Trial').length} Sesi
          </div>
          <p className="text-xs text-success-600 font-semibold mt-1">↗ Confirmed Attendees</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Trial Bookings</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{advisorBookings.length} Bookings</div>
          <p className="text-xs text-gray-500 mt-1">Lab Rooms Reserved</p>
        </Card>
      </div>

      {/* Booked Rooms & Sessions List */}
      {/* Notification Modal */}
      {notificationMsg && (
        <Modal
          isOpen={true}
          onClose={() => setNotificationMsg(null)}
          title={notificationMsg.title}
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-900 leading-relaxed">
                {notificationMsg.desc}
              </p>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setNotificationMsg(null)}>
                OK, Mengerti
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Booked Rooms & Trial Class Pipeline */}
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Jadwal Trial Class & Booking Ruangan</h2>
              <p className="text-xs text-gray-500">
                Pendaftaran trial murid baru. Setelah selesai trial & pembayaran lunas, konfirmasi status menjadi <b>Paid</b> untuk otomatis membuat akun parent & murid.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenBookingModal}
              icon={<Plus className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + Book Trial Class
            </Button>
          </div>

          <div className="space-y-3">
            {advisorBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 font-medium border-2 border-dashed border-gray-200 rounded-xl">
                Belum ada jadwal trial class atau booking ruangan. Klik <b>"+ Book Trial Class"</b> untuk mendaftarkan calon murid & orang tua.
              </div>
            ) : (
              advisorBookings.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${b.paymentStatus === 'paid'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : b.status === 'confirmed'
                      ? 'bg-purple-50/30 border-purple-200'
                      : 'bg-amber-50/30 border-amber-200'
                    }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${b.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-purple-100 text-purple-700'
                      }`}>
                      <DoorClosed className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{b.roomName}</span>
                        <Badge variant={b.bookingType === 'Trial' ? 'warning' : 'primary'} size="sm">
                          {b.bookingType}
                        </Badge>
                        <Badge
                          variant={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          Admin: {b.status === 'confirmed' ? 'Confirmed' : b.status === 'cancelled' ? 'Ditolak' : 'Pending Approval'}
                        </Badge>
                        {b.paymentStatus === 'paid' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> PAID (Akun Aktif)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-full">
                            UNPAID
                          </span>
                        )}
                      </div>

                      {/* Student & Parent Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
                        <div>
                          <span className="text-gray-400">Murid:</span>{' '}
                          <span className="font-bold text-gray-900">{b.studentName || b.studentNames?.join(', ')}</span>
                          {b.studentLevel && <span className="ml-1 text-[11px] text-purple-700 font-semibold">({b.studentLevel})</span>}
                          {b.studentEmail && <div className="text-[11px] text-gray-500 font-mono">{b.studentEmail}</div>}
                        </div>
                        <div>
                          <span className="text-gray-400">Parent:</span>{' '}
                          <span className="font-bold text-gray-900">{b.parentName || '-'}</span>
                          {b.parentPhone && <span className="ml-1 text-[11px] text-gray-600">({b.parentPhone})</span>}
                          {b.parentEmail && <div className="text-[11px] text-gray-500 font-mono">{b.parentEmail}</div>}
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1">
                        Cabang: <b>{b.centerName}</b> • Advisor: {b.advisorName}
                      </p>

                      {/* Assigned Teacher Badge */}
                      <div className="mt-1.5 flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Guru / Pengajar:</span>
                        {b.teacherName ? (
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                            👨‍🏫 {b.teacherName}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                            ⏳ Menunggu Admin Center Menugaskan Guru
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between w-full md:w-auto shrink-0 gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900">{b.date}</div>
                      <div className="text-xs text-purple-600 font-semibold">{b.startTime} - {b.endTime}</div>
                    </div>

                    {/* Action: Confirm Paid to Auto Create / Link Account */}
                    {b.paymentStatus !== 'paid' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => handleConfirmPaid(b)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                      >
                        Confirm Paid & Buat Akun
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Akun Terdaftar
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Modal Booking Trial Class */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Book Trial Class & Data Murid / Parent">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900">
            Form ini langsung mendaftarkan jadwal <b>Trial Class</b> sekaligus mencatat data Parent dan Calon Murid. Jadwal akan dikirim ke Admin Center untuk dikonfirmasi.
          </div>

          {/* Center Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pilih Cabang (Center)</label>
            <select
              value={bookingCenterId}
              onChange={(e) => {
                const newC = e.target.value;
                setBookingCenterId(newC);
                const rooms = classrooms.filter(r => r.centerId === newC || newC === 'ctr-online');
                setBookingRoomId(rooms[0]?.id || '');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {assignedCenters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id === 'ctr-online' ? '(Virtual / Online)' : `(${c.city})`}
                </option>
              ))}
            </select>
          </div>

          {/* Room & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ruangan / Lab</label>
              <select
                value={bookingRoomId}
                onChange={(e) => setBookingRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {classrooms
                  .filter(r => r.centerId === bookingCenterId || bookingCenterId === 'ctr-online')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Max {r.capacity})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipe Sesi</label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Trial">Free Trial Class (1-on-1)</option>
                <option value="Trial Regular">Trial Regular Class (Join Existing Batch)</option>
                <option value="Catchup">Catchup Missing Lesson</option>
                <option value="Consult">Parent Consultation</option>
              </select>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tanggal Trial</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Time Slot</label>
              <input
                type="text"
                required
                placeholder="15:00 - 16:00"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Data Parent */}
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-xs font-bold text-purple-950 uppercase mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" /> Data Orang Tua (Parent)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nama Parent *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hendra Wijaya"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Parent *</label>
                <input
                  type="email"
                  required
                  placeholder="hendra@gmail.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">No HP / WA Parent *</label>
                <input
                  type="tel"
                  required
                  placeholder="0812-xxxx-xxxx"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Data Murid */}
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-xs font-bold text-purple-950 uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Data Calon Murid (Anak)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nama Anak *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ryan Wijaya"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Anak (Opsional)</label>
                <input
                  type="email"
                  placeholder="ryan@student.com"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Target Modul / Level</label>
                <select
                  value={childLevel}
                  onChange={(e) => setChildLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="LK 4-6">LK 4-6 (Little Kids)</option>
                  <option value="JK 7-9">JK 7-9 (Junior Kids)</option>
                  <option value="JK 10-12">JK 10-12 (Roblox/Web)</option>
                  <option value="JK 12-16">JK 12-16 (Python/AI)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsBookingModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="bg-purple-600 hover:bg-purple-700 font-bold">
              Kirim Jadwal Trial
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
