import React, { useState } from 'react';
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
  Phone
} from 'lucide-react';

export const AdminCenterDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, centers, classrooms, classes, users, addClassroom, updateClassroom, deleteClassroom } = useApp();
  
  // Assigned centers for this Center Admin
  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);
  
  const assignedCenters = centers.filter(c => assignedCenterIds.includes(c.id));
  const [activeCenterId, setActiveCenterId] = useState<string>(assignedCenterIds[0] || 'ctr-kemayoran');
  const currentCenter = centers.find(c => c.id === activeCenterId) || assignedCenters[0] || centers[0];
  
  const centerClassrooms = classrooms.filter(r => r.centerId === currentCenter?.id);
  const centerClasses = classes.filter(c => c.centerId === currentCenter?.id);
  const centerTeachers = users.filter(u => u.role === 'teacher' && (u.centerId === currentCenter?.id || (u.centerIds && u.centerIds.includes(currentCenter?.id))));
  const centerStudents = users.filter(u => u.role === 'student' && u.centerId === currentCenter?.id);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('');

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomNameInput('');
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Classroom) => {
    setEditingRoom(room);
    setRoomNameInput(room.name);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput) return;

    if (editingRoom) {
      updateClassroom(editingRoom.id, {
        name: roomNameInput
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
        facilities: ['Smart TV', 'High-Speed Wi-Fi', 'AC', '6x iMac Workstations'],
        status: 'available'
      });
    }
    setRoomNameInput('');
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
                onChange={(e) => setActiveCenterId(e.target.value)}
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
          <p className="text-slate-300 text-sm mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {currentCenter?.address}, {currentCenter?.city}</span>
            {currentCenter?.phone && (
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {currentCenter?.phone}</span>
            )}
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
                        <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
              placeholder="e.g. Hopper Lab (Room 105)"
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

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
