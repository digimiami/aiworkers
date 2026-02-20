'use client';
import { useState, useEffect } from 'react';

interface User { id: string; email: string; name: string; role: string; createdAt: string; }

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aiworkers_user');
    if (saved) { setCurrentUser(JSON.parse(saved)); setLoggedIn(true); }
  }, []);

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn]);

  const loadData = async () => {
    try {
      const [usersRes, proposalsRes, bookingsRes, prospectsRes] = await Promise.all([
        fetch('/api/auth').then(r => r.json()),
        fetch('/api/generate-proposal').then(r => r.json()),
        fetch('/api/book').then(r => r.json()),
        fetch('/api/prospects').then(r => r.json()),
      ]);
      setUsers(usersRes.users || []);
      setProposals(proposalsRes.proposals || []);
      setBookings(bookingsRes.bookings || []);
      setProspects(prospectsRes.prospects || []);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async () => {
    setError('');
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword }) });
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    setCurrentUser(data.user); localStorage.setItem('aiworkers_user', JSON.stringify(data.user)); setLoggedIn(true);
  };

  const handleRegister = async () => {
    setError('');
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'register', email: regEmail, password: regPassword, name: regName, role: regRole }) });
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    setCurrentUser(data.user); localStorage.setItem('aiworkers_user', JSON.stringify(data.user)); setLoggedIn(true);
  };

  const handleLogout = () => { localStorage.removeItem('aiworkers_user'); setCurrentUser(null); setLoggedIn(false); };
  const deleteUser = async (id: string) => { await fetch(`/api/auth?id=${id}`, { method: 'DELETE' }); loadData(); };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">{showRegister ? 'Register' : 'Admin Login'}</h1>
          {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
          {showRegister ? (
            <>
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-3" placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} />
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-3" placeholder="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-3" placeholder="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-4" value={regRole} onChange={e => setRegRole(e.target.value)}>
                <option value="user">User</option><option value="admin">Admin</option>
              </select>
              <button onClick={handleRegister} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-3">Register</button>
              <button onClick={() => setShowRegister(false)} className="w-full text-gray-400 hover:text-white">Already have an account? Login</button>
            </>
          ) : (
            <>
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-3" placeholder="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-3" placeholder="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-3">Login</button>
              <button onClick={() => setShowRegister(true)} className="w-full text-gray-400 hover:text-white">Need an account? Register</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, <span className="text-purple-400">{currentUser?.name}</span> ({currentUser?.role})</span>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ label: 'Prospects', count: prospects.length, color: 'purple' }, { label: 'Proposals', count: proposals.length, color: 'blue' }, { label: 'Bookings', count: bookings.length, color: 'green' }, { label: 'Users', count: users.length, color: 'yellow' }].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-3xl font-bold text-${s.color}-400`}>{s.count}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['dashboard', 'prospects', 'proposals', 'bookings', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg font-medium capitalize ${tab === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{t}</button>
          ))}
        </div>
        {tab === 'dashboard' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Prospects</h3>
              {prospects.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <div><div className="text-white">{p.name}</div><div className="text-gray-500 text-sm">{p.niche} - {p.city}</div></div>
                  <div className="text-gray-400 text-sm">{p.email || 'No email'}</div>
                </div>
              ))}
              {prospects.length === 0 && <p className="text-gray-500">No prospects yet. Start searching!</p>}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Bookings</h3>
              {bookings.slice(0, 5).map((b: any) => (
                <div key={b.id} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <div><div className="text-white">{b.clientName}</div><div className="text-gray-500 text-sm">{b.clientEmail}</div></div>
                  <div className="text-gray-400 text-sm">{b.date} {b.time}</div>
                </div>
              ))}
              {bookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
            </div>
          </div>
        )}
        {tab === 'prospects' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-800"><th className="p-3 text-left text-gray-400">Name</th><th className="p-3 text-left text-gray-400">Niche</th><th className="p-3 text-left text-gray-400">City</th><th className="p-3 text-left text-gray-400">Email</th><th className="p-3 text-left text-gray-400">Rating</th><th className="p-3 text-left text-gray-400">Proposals</th></tr></thead>
              <tbody>{prospects.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white">{p.name}</td><td className="p-3 text-gray-400">{p.niche || '-'}</td><td className="p-3 text-gray-400">{p.city || '-'}</td><td className="p-3 text-gray-400">{p.email || '-'}</td><td className="p-3 text-yellow-400">{p.rating ? `${p.rating}` : '-'}</td><td className="p-3 text-purple-400">{p.proposals?.length || 0}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {tab === 'proposals' && (
          <div className="space-y-4">
            {proposals.map((p: any) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                <div><div className="text-white font-bold">{p.prospect?.name || 'Unknown'}</div><div className="text-gray-500 text-sm">LLM: {p.llmUsed} | Status: {p.status} | {new Date(p.createdAt).toLocaleDateString()}</div></div>
                <button onClick={async () => { await fetch(`/api/generate-proposal?id=${p.id}`, { method: 'DELETE' }); loadData(); }} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
              </div>
            ))}
            {proposals.length === 0 && <p className="text-gray-500">No proposals generated yet.</p>}
          </div>
        )}
        {tab === 'bookings' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-800"><th className="p-3 text-left text-gray-400">Client</th><th className="p-3 text-left text-gray-400">Email</th><th className="p-3 text-left text-gray-400">Phone</th><th className="p-3 text-left text-gray-400">Date</th><th className="p-3 text-left text-gray-400">Time</th><th className="p-3 text-left text-gray-400">Status</th></tr></thead>
              <tbody>{bookings.map((b: any) => (
                <tr key={b.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white">{b.clientName}</td><td className="p-3 text-gray-400">{b.clientEmail}</td><td className="p-3 text-gray-400">{b.clientPhone || '-'}</td><td className="p-3 text-gray-400">{b.date}</td><td className="p-3 text-gray-400">{b.time}</td><td className="p-3"><span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-sm">{b.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {tab === 'users' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-800"><th className="p-3 text-left text-gray-400">Name</th><th className="p-3 text-left text-gray-400">Email</th><th className="p-3 text-left text-gray-400">Role</th><th className="p-3 text-left text-gray-400">Joined</th><th className="p-3 text-left text-gray-400">Actions</th></tr></thead>
              <tbody>{users.map((u: User) => (
                <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white">{u.name}</td><td className="p-3 text-gray-400">{u.email}</td><td className="p-3"><span className={`px-2 py-1 rounded text-sm ${u.role === 'admin' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>{u.role}</span></td><td className="p-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td><td className="p-3"><button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
