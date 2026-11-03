import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MonitoringHeader } from '../components/monitoring/MonitoringHeader';
import { useAuth } from '../components/common/AuthGuard';
import { API_URL, getAuthHeaders } from '../config/api';

export function ProfileSettings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password baru tidak cocok.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password baru minimal 6 karakter.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal mengganti password');

            setSuccess(true);
            // Server memutus semua sesi (refresh token) lama demi keamanan
            // begitu password berganti -- login ulang di sini supaya tokennya
            // benar-benar baru, bukan meninggalkan sesi yang nanti gagal diam-diam.
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengganti password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col">
            <MonitoringHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-lg mx-auto flex flex-col gap-6">
                    <div>
                        <Link to="/monitoring" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1 mb-3 w-fit">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Kembali
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Profile Settings</h1>
                    </div>

                    {/* Info akun */}
                    <div className="bg-white dark:bg-[#1e232e] rounded-2xl border border-slate-200 dark:border-[#282e39] p-5 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-2xl">person</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.name || '—'}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email || '—'}</p>
                        </div>
                        <span className={`ml-auto shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                            user?.role === 'admin'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        }`}>
                            {user?.role || '—'}
                        </span>
                    </div>

                    {/* Form ganti password */}
                    <div className="bg-white dark:bg-[#1e232e] rounded-2xl border border-slate-200 dark:border-[#282e39] p-6">
                        <h2 className="font-bold text-lg mb-1">Ganti Password</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                            Setelah berhasil, Anda akan diminta login ulang dengan password baru.
                        </p>

                        {success ? (
                            <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                Password berhasil diganti. Mengarahkan ke halaman login...
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Password Saat Ini <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Password Baru <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Konfirmasi Password Baru <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={showPasswords}
                                        onChange={(e) => setShowPasswords(e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-600"
                                    />
                                    Tampilkan password
                                </label>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                                    className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Menyimpan...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[18px]">lock_reset</span>Ganti Password</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
