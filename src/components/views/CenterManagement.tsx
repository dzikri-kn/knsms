import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, ConfirmDialog } from '../ui';
import { Center, Classroom } from '../../types';
import {
  Building2,
  Search,
  MapPin,
  Users,
  BookOpen,
  DoorClosed,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Check,
  Tv,
  Wifi,
  Sparkles
} from 'lucide-react';

export const CenterManagement: React.FC = () => {
  const { currentUser, centers, classrooms, setSelectedCenterId, switchRole, addCenter, updateCenter, deleteCenter, addClassroom, updateClassroom, deleteClassroom } = useApp();

  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0
    ? currentUser.centerIds
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  const isSuperAdmin = currentUser.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  // Center Modal States
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [centerToDelete, setCenterToDelete] = useState<Center | null>(null);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCenterCity, setNewCenterCity] = useState('');
  const [newCenterProvince, setNewCenterProvince] = useState('DKI Jakarta');
  const [newCenterAddress, setNewCenterAddress] = useState('');
  const [newCenterPhone, setNewCenterPhone] = useState('');
  const [newCenterEmail, setNewCenterEmail] = useState('');
  const [initialRooms, setInitialRooms] = useState<string[]>([
    'Lab Turing (Room 101)',
    'Lab Ada Lovelace (Room 102)'
  ]);

  // In-modal room addition for Edit Mode
  const [isAddingRoomInCenterModal, setIsAddingRoomInCenterModal] = useState(false);
  const [newRoomNameInCenterModal, setNewRoomNameInCenterModal] = useState('');

  // Inline Room Editing States (for both Edit Center modal and Rooms modal)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');

  // Room Management Modal States (Per Center)
  const [selectedCenterForRooms, setSelectedCenterForRooms] = useState<Center | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomToDelete, setRoomToDelete] = useState<Classroom | null>(null);

  const filteredCenters = centers.filter((c) => {
    if (!isSuperAdmin && !assignedCenterIds.includes(c.id)) {
      return false;
    }
    const matchesProvince = selectedProvince === 'all' || c.province === selectedProvince;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvince && matchesSearch;
  });

  const provinces = Array.from(new Set(filteredCenters.map(c => c.province)));

  const handleAddInitialRoom = () => {
    setInitialRooms(prev => [...prev, `Lab Room ${prev.length + 1}`]);
  };

  const handleRemoveInitialRoom = (index: number) => {
    if (initialRooms.length <= 1) return;
    setInitialRooms(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateInitialRoom = (index: number, val: string) => {
    setInitialRooms(prev => prev.map((r, i) => i === index ? val : r));
  };

  const handleOpenCreateCenter = () => {
    setEditingCenter(null);
    setNewCenterName('');
    setNewCenterCode('');
    setNewCenterCity('');
    setNewCenterProvince('DKI Jakarta');
    setNewCenterAddress('');
    setNewCenterPhone('');
    setNewCenterEmail('');
    setInitialRooms(['Lab Turing (Room 101)', 'Lab Ada Lovelace (Room 102)']);
    setIsAddingRoomInCenterModal(false);
    setNewRoomNameInCenterModal('');
    setEditingRoomId(null);
    setIsCenterModalOpen(true);
  };

  const handleOpenEditCenter = (center: Center) => {
    setEditingCenter(center);
    setNewCenterName(center.name);
    setNewCenterCode(center.code);
    setNewCenterCity(center.city);
    setNewCenterProvince(center.province);
    setNewCenterAddress(center.address);
    setNewCenterPhone(center.phone);
    setNewCenterEmail(center.email);
    setIsAddingRoomInCenterModal(false);
    setNewRoomNameInCenterModal('');
    setEditingRoomId(null);
    setIsCenterModalOpen(true);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName || !newCenterCity) return;
    const code = newCenterCode || `CTR-${newCenterCity.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    if (editingCenter) {
      updateCenter(editingCenter.id, {
        name: newCenterName,
        code,
        city: newCenterCity,
        province: newCenterProvince,
        address: newCenterAddress,
        phone: newCenterPhone,
        email: newCenterEmail,
      });
    } else {
      const generatedCenterId = `ctr-${Date.now()}`;
      addCenter({
        name: newCenterName,
        code,
        city: newCenterCity,
        province: newCenterProvince,
        address: newCenterAddress || `Jl. Utama ${newCenterCity}`,
        phone: newCenterPhone || '+62 21 5555 0000',
        email: newCenterEmail || `${newCenterCity.toLowerCase()}@kodingnext.id`,
        studentCount: 0,
        teacherCount: 0,
        roomCount: initialRooms.filter(r => r.trim()).length || 1,
        activeClassesCount: 0,
        status: 'active'
      });

      // Create all configured rooms for this new center
      const validRooms = initialRooms.filter(r => r.trim());
      const roomsToCreate = validRooms.length > 0 ? validRooms : ['Main Lab 1'];

      roomsToCreate.forEach((rName, idx) => {
        addClassroom({
          name: rName,
          code: `${code}-R${idx + 1}`,
          centerId: generatedCenterId,
          centerName: newCenterName,
          capacity: 6,
          hasComputers: true,
          computerCount: 6,
          facilities: ['Smart TV', 'High-Speed Wi-Fi', 'AC', '6x iMac Workstations'],
          status: 'available'
        });
      });
    }

    setIsCenterModalOpen(false);
  };

  // Quick Room Actions inside Edit Center modal
  const handleAddRoomInEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter || !newRoomNameInCenterModal.trim()) return;

    addClassroom({
      name: newRoomNameInCenterModal.trim(),
      code: `${editingCenter.code}-R${Math.floor(100 + Math.random() * 900)}`,
      centerId: editingCenter.id,
      centerName: editingCenter.name,
      capacity: 6,
      hasComputers: true,
      computerCount: 6,
      facilities: ['Smart TV', 'High-Speed Wi-Fi', 'AC', '6x iMac Workstations'],
      status: 'available'
    });

    setNewRoomNameInCenterModal('');
    setIsAddingRoomInCenterModal(false);
  };

  const handleSaveInlineRoomEdit = (roomId: string) => {
    if (!editingRoomName.trim()) return;
    updateClassroom(roomId, { name: editingRoomName.trim() });
    setEditingRoomId(null);
    setEditingRoomName('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenterForRooms || !roomName) return;

    addClassroom({
      name: roomName,
      code: `${selectedCenterForRooms.code}-R${Math.floor(100 + Math.random() * 900)}`,
      centerId: selectedCenterForRooms.id,
      centerName: selectedCenterForRooms.name,
      capacity: 6,
      hasComputers: true,
      computerCount: 6,
      facilities: ['Smart TV', 'High-Speed Wi-Fi', 'AC'],
      status: 'available'
    });

    setRoomName('');
    setIsAddRoomOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centers & Rooms Directory</h1>

        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Total {centers.length} Active Centers
          </Badge>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateCenter}
          >
            Add New Center
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search center by city, mall name, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Province Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-white border border-gray-200 text-sm font-semibold rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Provinces (National)</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCenters.map((c) => {
          const currentCenterRooms = classrooms.filter(r => r.centerId === c.id || (c.id === 'ctr-online' && r.centerName === 'Online'));
          return (
            <Card key={c.id} className="flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">{c.city} • {c.province}</span>
                    <h2 className="text-base font-bold text-gray-900 mt-1">{c.name}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="success" size="sm" dot>
                      {c.code}
                    </Badge>
                    <button
                      onClick={() => handleOpenEditCenter(c)}
                      aria-label="Edit Center"
                      className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded cursor-pointer transition-colors"
                      title="Edit Center"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {c.id !== 'ctr-online' && (
                      <button
                        onClick={() => setCenterToDelete(c)}
                        aria-label="Delete Center"
                        className="p-1 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                        title="Delete Center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs font-extrabold text-gray-900">{c.studentCount}</div>
                    <div className="text-[10px] text-gray-500">Students</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs font-extrabold text-gray-900">{c.teacherCount}</div>
                    <div className="text-[10px] text-gray-500">Teachers</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs font-extrabold text-gray-900">{c.activeClassesCount}</div>
                    <div className="text-[10px] text-gray-500">Classes (Batches)</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCenterForRooms(c)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <DoorClosed className="w-3.5 h-3.5 text-gray-500" />
                  {currentCenterRooms.length} Rooms
                </button>
                <button
                  onClick={() => {
                    setSelectedCenterId(c.id);
                    switchRole('admin_center');
                  }}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5 cursor-pointer"
                >
                  Open Center Panel <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Add/Edit Center */}
      <Modal isOpen={isCenterModalOpen} onClose={() => setIsCenterModalOpen(false)} title={editingCenter ? 'Edit Campus Center' : 'Add New Campus Center'}>
        <form onSubmit={handleSaveCenter} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Center / Campus Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jakarta - Pondok Indah"
                value={newCenterName}
                onChange={(e) => setNewCenterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Jakarta Selatan"
                value={newCenterCity}
                onChange={(e) => setNewCenterCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Province</label>
              <select
                value={newCenterProvince}
                onChange={(e) => setNewCenterProvince(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
              >
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address / Location</label>
            <input
              type="text"
              placeholder="e.g. Pondok Indah Mall 2, 3rd Fl, Unit 302"
              value={newCenterAddress}
              onChange={(e) => setNewCenterAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Official Phone</label>
              <input
                type="text"
                placeholder="+62 21 7592 0000"
                value={newCenterPhone}
                onChange={(e) => setNewCenterPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="pim@kodingnext.id"
                value={newCenterEmail}
                onChange={(e) => setNewCenterEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rooms Configuration */}
          {!editingCenter ? (
            /* Multi-room setup for creating new center */
            <div className="p-3.5 bg-primary-50/70 border border-primary-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-primary-900 uppercase flex items-center gap-1.5">
                  <DoorClosed className="w-4 h-4 text-primary-600" />
                  Lab Rooms Setup ({initialRooms.length} Rooms • Cap: 6 each)
                </label>
                <button
                  type="button"
                  onClick={handleAddInitialRoom}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-white border border-primary-300 px-2 py-0.5 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Another Room
                </button>
              </div>

              <div className="space-y-2">
                {initialRooms.map((room, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary-600 bg-white px-2 py-1.5 border border-primary-200 rounded-lg shrink-0">
                      R{idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. Lab Room ${idx + 1}`}
                      value={room}
                      onChange={(e) => handleUpdateInitialRoom(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-primary-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    {initialRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInitialRoom(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-primary-700 leading-normal">
                All {initialRooms.length} configured rooms will be created with max 6 student capacity and ready immediately for class scheduling.
              </p>
            </div>
          ) : (
            /* In-modal Room Management for Existing Center (Add, Edit, Delete Rooms) */
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <DoorClosed className="w-4 h-4 text-primary-600" />
                  Branch Rooms & Labs (
                  {classrooms.filter(r => r.centerId === editingCenter.id || (editingCenter.id === 'ctr-online' && r.centerName === 'Online')).length} Rooms)
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingRoomInCenterModal(prev => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-white border border-primary-300 px-2 py-0.5 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> {isAddingRoomInCenterModal ? 'Cancel' : 'Add Room'}
                </button>
              </div>

              {/* Add Room Inline Form inside Edit Center */}
              {isAddingRoomInCenterModal && (
                <div className="p-2.5 bg-primary-50/60 border border-primary-200 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Lab Hawking (Room 103)"
                      value={newRoomNameInCenterModal}
                      onChange={(e) => setNewRoomNameInCenterModal(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-primary-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddRoomInEditModal}
                      disabled={!newRoomNameInCenterModal.trim()}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-[10px] text-primary-700">Capacity automatically set to 6 students.</p>
                </div>
              )}

              {/* List of existing rooms for this editing center */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {classrooms
                  .filter(r => r.centerId === editingCenter.id || (editingCenter.id === 'ctr-online' && r.centerName === 'Online'))
                  .map((r) => {
                    const isInlineEditing = editingRoomId === r.id;
                    return (
                      <div key={r.id} className="p-2 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-2">
                        {isInlineEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingRoomName}
                              onChange={(e) => setEditingRoomName(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-primary-400 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineRoomEdit(r.id)}
                              className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded cursor-pointer"
                              title="Save Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRoomId(null)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <DoorClosed className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                            <span className="text-xs font-bold text-gray-800 truncate">{r.name}</span>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0">({r.code})</span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">Cap: 6</span>
                          </div>
                        )}

                        {!isInlineEditing && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoomId(r.id);
                                setEditingRoomName(r.name);
                              }}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded cursor-pointer"
                              title="Edit Room Name"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRoomToDelete(r)}
                              className="p-1 text-gray-300 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsCenterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCenter ? 'Save Changes' : 'Save Center'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View & Manage Rooms for Selected Center */}
      <Modal
        isOpen={!!selectedCenterForRooms}
        onClose={() => {
          setSelectedCenterForRooms(null);
          setIsAddRoomOpen(false);
          setEditingRoomId(null);
        }}
        title={`Rooms & Labs — ${selectedCenterForRooms?.name}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-primary-50 p-3 rounded-xl border border-primary-100">
            <div>
              <span className="text-xs font-bold text-primary-900">Branch Lab Facilities</span>
              <p className="text-[11px] text-primary-700">Each room is locked to maximum 6 student capacity for personalized learning.</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddRoomOpen(true)}
            >
              Add Room
            </Button>
          </div>

          {/* Form Create New Room Inline */}
          {isAddRoomOpen && (
            <form onSubmit={handleCreateRoom} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Room / Lab Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Ada Lovelace (Room 102)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Standard Capacity: <strong>6 Students</strong></span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setIsAddRoomOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    Create Room
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Rooms List for Selected Center */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {classrooms.filter(r => r.centerId === selectedCenterForRooms?.id || (selectedCenterForRooms?.id === 'ctr-online' && r.centerName === 'Online')).length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">No rooms configured yet for this center.</p>
            ) : (
              classrooms
                .filter(r => r.centerId === selectedCenterForRooms?.id || (selectedCenterForRooms?.id === 'ctr-online' && r.centerName === 'Online'))
                .map((r) => {
                  const isInlineEditing = editingRoomId === r.id;
                  return (
                    <div key={r.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0">
                          <DoorClosed className="w-4 h-4" />
                        </div>
                        {isInlineEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingRoomName}
                              onChange={(e) => setEditingRoomName(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs border border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineRoomEdit(r.id)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
                              title="Save Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRoomId(null)}
                              className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{r.name}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                              <span className="font-mono">{r.code}</span>
                              <span>•</span>
                              <span>Capacity: 6 Students</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">{r.facilities?.join(', ') || 'Equipped'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {!isInlineEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoomId(r.id);
                              setEditingRoomName(r.name);
                            }}
                            aria-label="Edit Room Name"
                            className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                            title="Edit Room Name"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRoomToDelete(r)}
                            aria-label="Delete Room"
                            className="p-1.5 text-gray-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog for Center Deletion */}
      <ConfirmDialog
        isOpen={!!centerToDelete}
        onClose={() => setCenterToDelete(null)}
        onConfirm={() => {
          if (centerToDelete) {
            deleteCenter(centerToDelete.id);
            setCenterToDelete(null);
          }
        }}
        title="Delete Campus Center"
        message={`Are you sure you want to delete "${centerToDelete?.name}" (${centerToDelete?.code})? All associated classes and classrooms in this branch will be affected.`}
        confirmText="Yes, Delete Center"
      />

      {/* Confirmation Dialog for Room Deletion */}
      <ConfirmDialog
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={() => {
          if (roomToDelete) {
            deleteClassroom(roomToDelete.id);
            setRoomToDelete(null);
          }
        }}
        title="Delete Classroom"
        message={`Are you sure you want to delete "${roomToDelete?.name}" (${roomToDelete?.code})?`}
        confirmText="Yes, Delete Room"
      />
    </div>
  );
};
