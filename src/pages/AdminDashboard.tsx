import { useState, useEffect, ChangeEvent, FormEvent, ReactNode } from 'react';

type Tab  = 'users' | 'predictions';
type Role = 'Patient' | 'Doctor';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  contact: string;
  address: string;
  initials: string;
  avatarClass: string;
  joinDate: string;
}

interface Prediction {
  id: string;
  patientName: string;
  patientInitials: string;
  avatarClass: string;
  probability: number;
  hasHeartDisease: boolean;
  date: string;
  age: number;
}

interface DoctorForm {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  age: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  specialization: string;
  workTime: string;
}

type DeleteTarget =
  | { kind: 'user'; id: number; label: string }
  | { kind: 'pred'; id: string; label: string };

const MOCK_USERS: User[] = [
  { id: 1, name: 'Ahmed Hassan',       username: 'ahmed.hassan',  email: 'ahmed.hassan@cardia.health',  role: 'Patient', contact: '+20 100 123 4567', address: 'Cairo, Nasr City',    initials: 'AH', avatarClass: 'bg-blue-100 text-blue-700',    joinDate: 'Jan 12, 2026' },
  { id: 2, name: 'Sara Mohamed',       username: 'sara.mohamed',  email: 'sara.mohamed@cardia.health',  role: 'Patient', contact: '+20 101 987 6543', address: 'Giza, Dokki',         initials: 'SM', avatarClass: 'bg-purple-100 text-purple-700', joinDate: 'Feb 3, 2026'  },
  { id: 3, name: 'Dr. Karim Nour',     username: 'dr.karim',      email: 'dr.karim@cardia.health',      role: 'Doctor',  contact: '+20 102 555 0011', address: 'Cairo, Heliopolis',   initials: 'KN', avatarClass: 'bg-teal-100 text-teal-700',    joinDate: 'Mar 7, 2026'  },
  { id: 4, name: 'Nour El-Din',        username: 'nour.eldin',    email: 'nour.eldin@cardia.health',    role: 'Patient', contact: '+20 103 444 9988', address: 'Alexandria, Smouha', initials: 'NE', avatarClass: 'bg-orange-100 text-orange-700', joinDate: 'Mar 19, 2026' },
  { id: 5, name: 'Omar Farouk',        username: 'omar.farouk',   email: 'omar.farouk@cardia.health',   role: 'Patient', contact: '+20 104 321 7654', address: 'Cairo, Maadi',        initials: 'OF', avatarClass: 'bg-pink-100 text-pink-700',    joinDate: 'Apr 2, 2026'  },
  { id: 6, name: 'Dr. Sara Hassan',    username: 'dr.sara',       email: 'dr.sara@cardia.health',       role: 'Doctor',  contact: '+20 101 987 6543', address: 'Cairo, Zamalek',      initials: 'SH', avatarClass: 'bg-indigo-100 text-indigo-700', joinDate: 'Apr 14, 2026' },
  { id: 7, name: 'Khaled Ali',         username: 'khaled.ali',    email: 'khaled.ali@cardia.health',    role: 'Patient', contact: '+20 105 876 5432', address: 'Luxor, El Awameya',   initials: 'KA', avatarClass: 'bg-green-100 text-green-700',  joinDate: 'Apr 28, 2026' },
  { id: 8, name: 'Dr. Khaled Mansour', username: 'dr.khaled',     email: 'dr.khaled@cardia.health',     role: 'Doctor',  contact: '+20 102 555 0011', address: 'Cairo, New Cairo',    initials: 'KM', avatarClass: 'bg-cyan-100 text-cyan-700',    joinDate: 'May 1, 2026'  },
];

const MOCK_PREDICTIONS: Prediction[] = [
  { id: 'PRD-001', patientName: 'Ahmed Hassan', patientInitials: 'AH', avatarClass: 'bg-blue-100 text-blue-700',    probability: 0.82, hasHeartDisease: true,  date: 'May 5, 2026',  age: 54 },
  { id: 'PRD-002', patientName: 'Sara Mohamed', patientInitials: 'SM', avatarClass: 'bg-purple-100 text-purple-700', probability: 0.47, hasHeartDisease: false, date: 'May 6, 2026',  age: 42 },
  { id: 'PRD-003', patientName: 'Khaled Ali',   patientInitials: 'KA', avatarClass: 'bg-teal-100 text-teal-700',    probability: 0.21, hasHeartDisease: false, date: 'May 7, 2026',  age: 67 },
  { id: 'PRD-004', patientName: 'Nour El-Din',  patientInitials: 'NE', avatarClass: 'bg-orange-100 text-orange-700', probability: 0.76, hasHeartDisease: true,  date: 'May 8, 2026',  age: 38 },
  { id: 'PRD-005', patientName: 'Omar Farouk',  patientInitials: 'OF', avatarClass: 'bg-pink-100 text-pink-700',    probability: 0.53, hasHeartDisease: true,  date: 'May 9, 2026',  age: 59 },
  { id: 'PRD-006', patientName: 'Ahmed Hassan', patientInitials: 'AH', avatarClass: 'bg-blue-100 text-blue-700',    probability: 0.79, hasHeartDisease: true,  date: 'May 9, 2026',  age: 54 },
  { id: 'PRD-007', patientName: 'Sara Mohamed', patientInitials: 'SM', avatarClass: 'bg-purple-100 text-purple-700', probability: 0.38, hasHeartDisease: false, date: 'May 10, 2026', age: 42 },
];

const STAT_CARDS = [
  { label: 'Total Users',       value: '1,284', sub: '+12 this week',   icon: '👥', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
  { label: 'Total Doctors',     value: '47',    sub: '3 specialties',   icon: '👨‍⚕️', color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-100'   },
  { label: 'Total Patients',    value: '1,231', sub: '89 active today', icon: '🫀', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
  { label: 'Total Predictions', value: '8,402', sub: '+89 today',       icon: '🤖', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
];

const ROLE_CFG: Record<Role, string> = {
  Doctor:  'bg-teal-100 text-teal-700 border-teal-200',
  Patient: 'bg-blue-100 text-blue-700 border-blue-200',
};

const BLANK_DOCTOR: DoctorForm = {
  name: '', userName: '', email: '', password: '',
  contactNumber: '', age: '', streetAddress: '',
  city: '', state: '', country: '', specialization: '', workTime: '',
};

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition';

const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors flex-shrink-0"
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function Backdrop({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab]           = useState<Tab>('users');
  const [users, setUsers]       = useState<User[]>(MOCK_USERS);
  const [preds, setPreds]       = useState<Prediction[]>(MOCK_PREDICTIONS);
  const [search, setSearch]     = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All');

  const [viewUser, setViewUser]           = useState<User | null>(null);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<DeleteTarget | null>(null);
  const [doctorForm, setDoctorForm]       = useState<DoctorForm>(BLANK_DOCTOR);

  const anyModal = !!viewUser || showAddDoctor || !!deleteTarget;

  useEffect(() => {
    document.body.style.overflow = anyModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [anyModal]);

  useEffect(() => {
    if (!showAddDoctor) setDoctorForm(BLANK_DOCTOR);
  }, [showAddDoctor]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)) &&
      (roleFilter === 'All' || u.role === roleFilter)
    );
  });

  const filteredPreds = preds.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.patientName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
      (!filterDate || p.date.includes(filterDate))
    );
  });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleDateChange   = (e: ChangeEvent<HTMLInputElement>) => setFilterDate(e.target.value);

  const promptDeleteUser = (u: User) =>
    setDeleteTarget({ kind: 'user', id: u.id, label: u.name });

  const promptDeletePred = (p: Prediction) =>
    setDeleteTarget({ kind: 'pred', id: p.id, label: `${p.id} — ${p.patientName}` });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'user') setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    else setPreds((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleDoctorChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDoctorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDoctorSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowAddDoctor(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">System overview, user management, and prediction logs.</p>
          </div>
          <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-200 self-start sm:self-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Super Admin
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 ${s.border}`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="flex border-b border-gray-200 bg-slate-50">
            {([
              { key: 'users' as Tab,       label: 'User Management',    icon: '👥' },
              { key: 'predictions' as Tab,  label: 'ML Predictions Log', icon: '🤖' },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSearch(''); setFilterDate(''); }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  tab === t.key
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'users' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search name or username..."
                      value={search}
                      onChange={handleSearchChange}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-64 bg-white"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'All' | Role)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-700"
                  >
                    <option value="All">All Roles</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Patient</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {filteredUsers.length} of {users.length} users
                  </span>
                  <button
                    onClick={() => setShowAddDoctor(true)}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Doctor
                  </button>
                </div>
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-left">
                      {['User', 'Username', 'Role', 'Contact', 'Address', 'Joined', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No users match your search.</td>
                      </tr>
                    ) : filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.avatarClass}`}>
                              {u.initials}
                            </div>
                            <span className="font-medium text-gray-900 whitespace-nowrap">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">@{u.username}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_CFG[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{u.contact}</td>
                        <td className="px-6 py-4 text-gray-600">{u.address}</td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{u.joinDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewUser(u)}
                              className="flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => promptDeleteUser(u)}
                              className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.avatarClass}`}>
                          {u.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">@{u.username}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_CFG[u.role]}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>{u.contact}</p>
                      <p>{u.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewUser(u)}
                        className="flex-1 text-center text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => promptDeleteUser(u)}
                        className="flex-1 text-center text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'predictions' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search patient or ID..."
                      value={search}
                      onChange={handleSearchChange}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-56 bg-white"
                    />
                  </div>
                  <div className="relative">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Filter by date..."
                      value={filterDate}
                      onChange={handleDateChange}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-44 bg-white"
                    />
                  </div>
                </div>
                <button className="flex items-center gap-2 text-gray-600 bg-white hover:bg-slate-50 border border-gray-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors self-end sm:self-auto">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>

              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 bg-slate-50/70 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">{filteredPreds.length} records</span>
                <span className="w-px h-4 bg-gray-300" />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {filteredPreds.filter((p) => p.hasHeartDisease).length} positive
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {filteredPreds.filter((p) => !p.hasHeartDisease).length} negative
                </span>
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-left">
                      {['Prediction ID', 'Patient', 'Age', 'Probability Score', 'Has Heart Disease', 'Date', 'Action'].map((h) => (
                        <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPreds.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No predictions match your filters.</td>
                      </tr>
                    ) : filteredPreds.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.avatarClass}`}>
                              {p.patientInitials}
                            </div>
                            <span className="font-medium text-gray-900 whitespace-nowrap">{p.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.age} yrs</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${p.probability >= 0.65 ? 'bg-red-500' : p.probability >= 0.35 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${p.probability * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 tabular-nums">
                              {(p.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {p.hasHeartDisease ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{p.date}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => promptDeletePred(p)}
                            className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-gray-100">
                {filteredPreds.map((p) => (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.avatarClass}`}>
                          {p.patientInitials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.patientName}</p>
                          <p className="text-xs font-mono text-gray-400">{p.id}</p>
                        </div>
                      </div>
                      {p.hasHeartDisease
                        ? <span className="text-xs font-semibold bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">Yes</span>
                        : <span className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full">No</span>
                      }
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.probability >= 0.65 ? 'bg-red-500' : p.probability >= 0.35 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${p.probability * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 tabular-nums">{(p.probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{p.date} · Age {p.age}</span>
                      <button
                        onClick={() => promptDeletePred(p)}
                        className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-semibold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {viewUser && (
        <Backdrop onClose={() => setViewUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${viewUser.avatarClass}`}>
                  {viewUser.initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewUser.name}</h3>
                  <p className="text-blue-100 text-xs mt-0.5">User Profile</p>
                </div>
              </div>
              <CloseBtn onClose={() => setViewUser(null)} />
            </div>

            <div className="p-6 space-y-5">

              <div className="flex justify-center">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${ROLE_CFG[viewUser.role]}`}>
                  {viewUser.role === 'Doctor' ? '👨‍⚕️' : '🫀'} {viewUser.role}
                </span>
              </div>

              <dl className="space-y-3">
                {[
                  { icon: '👤', label: 'Full Name',      value: viewUser.name },
                  { icon: '@',  label: 'Username',       value: `@${viewUser.username}` },
                  { icon: '✉️', label: 'Email',          value: viewUser.email },
                  { icon: '📞', label: 'Contact Number', value: viewUser.contact },
                  { icon: '📍', label: 'Address',        value: viewUser.address },
                  { icon: '📅', label: 'Member Since',   value: viewUser.joinDate },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-base w-5 text-center flex-shrink-0 mt-0.5">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setViewUser(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Backdrop>
      )}

      {showAddDoctor && (
        <Backdrop onClose={() => setShowAddDoctor(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-500 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center text-xl">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Doctor</h3>
                  <p className="text-teal-100 text-xs mt-0.5">Fill in all fields to register a new doctor</p>
                </div>
              </div>
              <CloseBtn onClose={() => setShowAddDoctor(false)} />
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="add-doctor-form" onSubmit={handleDoctorSubmit} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input name="name" value={doctorForm.name} onChange={handleDoctorChange}
                      type="text" placeholder="Dr. John Smith" required className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Username</label>
                    <input name="userName" value={doctorForm.userName} onChange={handleDoctorChange}
                      type="text" placeholder="dr.johnsmith" required className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input name="email" value={doctorForm.email} onChange={handleDoctorChange}
                      type="email" placeholder="doctor@cardia.health" required className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Password</label>
                    <input name="password" value={doctorForm.password} onChange={handleDoctorChange}
                      type="password" placeholder="••••••••" required className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input name="contactNumber" value={doctorForm.contactNumber} onChange={handleDoctorChange}
                      type="tel" placeholder="+20 1XX XXXX XXXX" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Age</label>
                    <input name="age" value={doctorForm.age} onChange={handleDoctorChange}
                      type="number" placeholder="e.g. 38" min={24} max={80} className={inputCls} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Street Address</label>
                    <input name="streetAddress" value={doctorForm.streetAddress} onChange={handleDoctorChange}
                      type="text" placeholder="123 Medical District St." className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>City</label>
                    <input name="city" value={doctorForm.city} onChange={handleDoctorChange}
                      type="text" placeholder="Cairo" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>State / Governorate</label>
                    <input name="state" value={doctorForm.state} onChange={handleDoctorChange}
                      type="text" placeholder="Cairo Governorate" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Country</label>
                    <input name="country" value={doctorForm.country} onChange={handleDoctorChange}
                      type="text" placeholder="Egypt" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Specialization</label>
                    <input name="specialization" value={doctorForm.specialization} onChange={handleDoctorChange}
                      type="text" placeholder="e.g. Interventional Cardiologist" required className={inputCls} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Work Time</label>
                    <input name="workTime" value={doctorForm.workTime} onChange={handleDoctorChange}
                      type="text" placeholder="e.g. Mon–Thu, 9:00 AM – 4:00 PM" className={inputCls} />
                  </div>

                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setShowAddDoctor(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-doctor-form"
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Doctor
              </button>
            </div>
          </div>
        </Backdrop>
      )}

      {deleteTarget && (
        <Backdrop onClose={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            <div className="bg-red-50 border-b border-red-100 px-6 pt-7 pb-5 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center">Confirm Delete</h3>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900 break-all">"{deleteTarget.label}"</span>?
              </p>
              <p className="text-xs text-red-600 font-medium text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Confirm Delete
              </button>
            </div>
          </div>
        </Backdrop>
      )}

    </div>
  );
}
