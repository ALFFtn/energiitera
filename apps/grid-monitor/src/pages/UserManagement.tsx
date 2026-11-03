import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { MonitoringHeader } from '../components/monitoring/MonitoringHeader';
import { useAuth } from '../components/common/AuthGuard';
import { API_URL, getAuthHeaders } from '../config/api';
import { formatDateWIB } from '../config/datetime';

interface ManagedUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'viewer';
    createdAt: string;
}

function AddUserModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ email, password, name, role }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create user');

            setEmail(''); setPassword(''); setName(''); setRole('viewer');
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#1e232e] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-[#282e39]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#282e39]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">person_add</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New User</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Buat akun admin atau viewer baru</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama <span className="text-red-500">*</span></label>
                        <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)} required
                            placeholder="mis. Budi Santoso"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            placeholder="mis. budi@itera.ac.id"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password <span className="text-red-500">*</span></label>
                        <input
                            type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                            placeholder="Minimal 6 karakter"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                        <select
                            value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'viewer')}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="viewer">Viewer — lihat saja</option>
                            <option value="admin">Admin — kelola gedung & user</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282e39] font-medium transition-colors">
                            Batal
                        </button>
                        <button
                            type="submit" disabled={isSubmitting || !email || !password || !name}
                            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Membuat...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">person_add</span>Buat User</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function UserManagement() {
    const { isAdmin, user: currentUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [busyUserId, setBusyUserId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/users`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load users');
            setUsers(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin, fetchUsers]);

    // Pengaman di sisi UI -- batas keamanan sesungguhnya ada di backend
    // (authorize('admin') di users.routes.ts) kalau ada yang nekat akses
    // lewat API langsung.
    if (!isAdmin) {
        return <Navigate to="/monitoring" replace />;
    }

    const handleRoleChange = async (targetUser: ManagedUser, newRole: 'admin' | 'viewer') => {
        if (newRole === targetUser.role) return;
        setBusyUserId(targetUser.id);
        try {
            const res = await fetch(`${API_URL}/api/users/${targetUser.id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update role');
            await fetchUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update role');
        } finally {
            setBusyUserId(null);
        }
    };

    const handleDelete = async (targetUser: ManagedUser) => {
        if (!window.confirm(`Hapus user "${targetUser.name}" (${targetUser.email})? Tindakan ini tidak bisa dibatalkan.`)) return;
        setBusyUserId(targetUser.id);
        try {
            const res = await fetch(`${API_URL}/api/users/${targetUser.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');
            await fetchUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user');
        } finally {
            setBusyUserId(null);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col">
            <MonitoringHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">User Management</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Kelola akun & hak akses — hanya admin yang bisa tambah/edit/hapus gedung.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium text-sm transition-colors shadow-lg shadow-primary/25"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Add User
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-white dark:bg-[#1e232e] rounded-2xl border border-slate-200 dark:border-[#282e39] overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-[#282e39] text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="px-5 py-3 font-semibold">Nama</th>
                                        <th className="px-5 py-3 font-semibold">Email</th>
                                        <th className="px-5 py-3 font-semibold">Role</th>
                                        <th className="px-5 py-3 font-semibold">Dibuat</th>
                                        <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const isSelf = u.id === currentUser?.id;
                                        const isBusy = busyUserId === u.id;
                                        return (
                                            <tr key={u.id} className="border-b border-slate-100 dark:border-[#282e39]/60 last:border-0">
                                                <td className="px-5 py-3 font-medium">
                                                    {u.name}
                                                    {isSelf && <span className="ml-2 text-xs text-slate-400 font-normal">(Anda)</span>}
                                                </td>
                                                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                                                <td className="px-5 py-3">
                                                    <select
                                                        value={u.role}
                                                        disabled={isBusy}
                                                        onChange={(e) => handleRoleChange(u, e.target.value as 'admin' | 'viewer')}
                                                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                                                            u.role === 'admin'
                                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                                                        }`}
                                                    >
                                                        <option value="viewer">Viewer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDateWIB(new Date(u.createdAt), { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDelete(u)}
                                                        disabled={isSelf || isBusy}
                                                        title={isSelf ? 'Tidak bisa menghapus akun sendiri' : 'Hapus user'}
                                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
