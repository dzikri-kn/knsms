import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal } from '../ui';
import { Classroom } from '../../types';
import { 
  Building2, 
  Users, 
  BookOpen, 
  DoorClosed, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Calendar,
  AlertTriangle,
  Sparkles,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Video,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';

export const AdminCenterDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, centers, classrooms, classes, users, addClassroom, updateClassroom, deleteClassroom, bookings, updateBooking, selectedCenterId, setSelectedCenterId, isSuperAdminSession } = useApp();
  
  // Assigned centers for this Center Admin. If Super Admin session, all centers are accessible
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
  
  const centerClassrooms = classrooms.filter(r => r.centerId === currentCenter?.id);
  const centerClasses = classes.filter(c => c.centerId === currentCenter?.id);
  const centerTeachers = users.filter(u => u.role === 'teacher' && (u.centerId === currentCenter?.id || (u.centerIds && u.centerIds.includes(currentCenter?.id))));
  const centerStudents = users.filter(u => u.role === 'student' && u.centerId === currentCenter?.id);
  const centerBookings = bookings.filter(b => b.centerId === currentCenter?.id);

  const handleConfirmBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'confirmed' });
  };

  const handleRejectBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'cancelled' });
  };

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomZoomLinkInput, setRoomZoomLinkInput] = useState('');

  const isCurrentCenterOnline = currentCenter?.id === 'ctr-online' || currentCenter?.name === 'Online';

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomNameInput('');
    setRoomZoomLinkInput(isCurrentCenterOnline ? 'https://zoom.us/j/9988112233' : '');
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Classroom) => {
    setEditingRoom(room);
    setRoomNameInput(room.name);
    // Find zoomLink if stored in facilities or class
    const foundZoom = room.facilities.find(f => f.startsWith('Zoom: '))?.replace('Zoom: ', '') || '';
    setRoomZoomLinkInput(foundZoom);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput) return;

    const baseFacilities = isCurrentCenterOnline 
      ? ['Virtual Lab', 'Cloud Workstations', 'Screen Share Support']
      : ['Smart TV', 'High-Speed Wi-Fi', 'AC', '6x iMac Workstations'];
    
    if (isCurrentCenterOnline && roomZoomLinkInput.trim()) {
      baseFacilities.push(`Zoom: ${roomZoomLinkInput.trim()}`);
    }

    if (editingRoom) {
      updateClassroom(editingRoom.id, {
        name: roomNameInput,
        facilities: baseFacilities,
        zoomLink: isCurrentCenterOnline ? roomZoomLinkInput.trim() : undefined,
      });
    } else {
      addClassroom({
        name: roomNameInput,
        code: `${currentCenter.code}-R${Math.floor(100 + Math.random() * 900)}`,
        centerId: currentCenter.id,
        centerName: currentCenter.name,
        capacity: 6,
        hasComputers: true,
        computerCount: 6,
        facilities: baseFacilities,
        status: 'available',
        zoomLink: isCurrentCenterOnline ? roomZoomLinkInput.trim() : undefined,
      });
    }
    setRoomNameInput('');
    setRoomZoomLinkInput('');
    setEditingRoom(null);
    setIsRoomModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Center Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="purple" className="bg-white/20 text-white border-white/30 text-xs">
              Center Admin Panel
            </Badge>
            <span className="text-xs text-slate-300">Official Branch</span>
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
          <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> {currentCenter?.city}, {currentCenter?.province}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddRoom}
          >
            Add New Lab Room
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onNavigate('schedule')}
          >
            View Center Schedule
          </Button>
        </div>
      </div>

      {/* Center KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Enrolled Students</span>
            <Users className="w-5 h-5 text-primary-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{currentCenter.studentCount} Students</div>
          <p className="text-xs text-gray-500 mt-1">Active & Trial Batches</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Teachers</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{centerTeachers.length || 6} Instructors</div>
          <p className="text-xs text-gray-500 mt-1">Full-time & Part-time</p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Classrooms / Labs</span>
            <DoorClosed className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{centerClassrooms.length} Rooms</div>
          <p className="text-xs text-gray-500 mt-1">iMac Lab & Robotics Studio</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Weekly Batches</span>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{currentCenter.activeClassesCount} Classes</div>
          <p className="text-xs text-gray-500 mt-1">Regularly scheduled</p>
        </Card>
      </div>

      {/* Classroom Utilization Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Room Status & Utilization</h2>
            <p className="text-xs text-gray-500">Computer hardware capacity and live occupancy</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleOpenAddRoom} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Lab Room
          </Button>
        </div>

        {centerClassrooms.length === 0 ? (
          <Card className="py-8 text-center border-dashed border-2 border-gray-200">
            <DoorClosed className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No rooms created yet for {currentCenter.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">Add lab rooms to assign batches and schedule classes.</p>
            <Button size="sm" variant="primary" onClick={handleOpenAddRoom} icon={<Plus className="w-3.5 h-3.5" />}>
              Add First Lab Room
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {centerClassrooms.map((room) => (
              <Card key={room.id} className="relative overflow-hidden group hover:border-primary-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={room.status === 'available' ? 'success' : 'warning'} size="sm" dot>
                        {room.status === 'available' ? 'Available' : 'Occupied'}
                      </Badge>
                      <h3 className="font-bold text-gray-900 mt-2">{room.name}</h3>
                      <p className="text-xs text-gray-400">Code: {room.code}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRoom(room)}
                        title="Edit Room"
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClassroom(room.id)}
                        title="Delete Room"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-bold text-gray-900">{room.capacity} Seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Computers:</span>
                      <span className="font-bold text-gray-900">{room.computerCount} Units</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.facilities.map((f, i) => (
                        <span key={i} className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                          f.startsWith('Zoom: ') 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Quick Zoom Link Button if present */}
                    {room.facilities.find(f => f.startsWith('Zoom: ')) && (
                      <div className="pt-2">
                        <a
                          href={room.facilities.find(f => f.startsWith('Zoom: '))?.replace('Zoom: ', '')}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" /> Buka Zoom Room ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trial Class & Room Booking Approvals from Student Advisors */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Permintaan Booking Ruangan & Trial Class</h2>
              {centerBookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
                  {centerBookings.filter(b => b.status === 'pending').length} Menunggu Konfirmasi
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Pengajuan jadwal Free Trial Class atau Catchup dari Student Advisor untuk cabang {currentCenter.name}
            </p>
          </div>
        </div>

        {centerBookings.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400 italic">
            Belum ada permintaan booking ruangan atau jadwal trial class di cabang ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Tipe Sesi</th>
                  <th className="py-3 px-4">Calon Murid / Note</th>
                  <th className="py-3 px-4">Kontak Parent</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Student Advisor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {centerBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">{b.roomName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={b.bookingType === 'Trial' ? 'warning' : 'primary'} size="sm">
                        {b.bookingType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-gray-800">
                      <div>{b.studentName || b.studentNames?.join(', ') || 'Calon Murid'}</div>
                      {b.studentLevel && <span className="text-[10px] text-purple-700 font-bold">{b.studentLevel}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {b.parentName ? (
                        <div>
                          <div className="font-semibold text-gray-900">{b.parentName}</div>
                          <div className="text-[11px] text-gray-500">{b.parentPhone || b.parentEmail}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-bold text-gray-900">{b.date}</div>
                      <div className="text-purple-600 font-semibold">{b.startTime} - {b.endTime}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700">{b.advisorName}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'} 
                        size="sm"
                      >
                        {b.status === 'confirmed' ? 'Confirmed' : b.status === 'cancelled' ? 'Ditolak' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleConfirmBooking(b.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button
                            onClick={() => handleRejectBooking(b.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Center Classes List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Branch Class Schedule</h2>
            <p className="text-xs text-gray-500">Active class batches at {currentCenter.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('classes')}>
            Manage Classes
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Class Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Module & Level</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Zoom Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {centerClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{cls.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant={cls.type === 'Trial' ? 'warning' : 'primary'} size="sm">
                      {cls.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className="font-semibold text-purple-700">{cls.moduleLevel}</span>
                    <div className="text-gray-500">{cls.moduleName}</div>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-800">{cls.teacherName}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{cls.roomName}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-800">
                    {cls.dayOfWeek}, {cls.startTime} - {cls.endTime}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success" size="sm" dot>Active</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {cls.zoomLink ? (
                      <a
                        href={cls.zoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors border border-blue-200"
                      >
                        <Video className="w-3.5 h-3.5" /> Buka Zoom
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Offline Lab</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Add / Edit Room */}
      <Modal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} title={editingRoom ? 'Edit Lab Room' : 'Add New Lab Room'}>
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Room Name</label>
            <input
              type="text"
              required
              placeholder={isCurrentCenterOnline ? 'e.g. Zoom Room 1 (Breakout A)' : 'e.g. Hopper Lab (Room 105)'}
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Zoom Meeting Link for Online Center Room */}
          {isCurrentCenterOnline && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                Zoom Meeting Link (Online Class)
              </label>
              <input
                type="url"
                placeholder="https://zoom.us/j/9988112233"
                value={roomZoomLinkInput}
                onChange={(e) => setRoomZoomLinkInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-blue-700">
                Tiap sesi kelas online di ruangan ini dapat mengakses link Zoom ini secara langsung.
              </p>
            </div>
          )}

          <div className="p-3 bg-primary-50/70 border border-primary-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-primary-900">
              <span>Standard Room Capacity</span>
              <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-[11px]">6 Students</span>
            </div>
            <p className="text-[11px] text-primary-700">
              Capacity is locked to 6 students. Room code will be generated automatically upon saving.
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsRoomModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingRoom ? 'Update Room' : 'Save Room'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
