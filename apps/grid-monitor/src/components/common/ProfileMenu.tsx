
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleMenu}
                className="relative size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
                <img
                    alt="Profile"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpYHiDiqa9BmD7yCRq2Sv9Z-KcYl2sL1Xhls_2hvoIhQe8GaXd3c_JosoHvDB5A7JeZUVxEf-PC05VyjjrhdhPRakcbDz1TU1ehR6fFMz43fL0kKIL4Iua1Et8KUxD8i_O54AcAICqEwh9i4w9luEqpac1G-AN6i5eNpketyJ5pc4ZohrtrUZfGeKsSJeYDpGKUfpoApEi17zzcM5LSz33ARzvj4KyDtaz2f2Ybc_Pi4EiS4-dofToG1LDTsZm4ix443Q-Sl9prThY"
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e232e] rounded-lg shadow-xl border border-slate-200 dark:border-[#282e39] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-[#282e39]">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@gridmonitor.iot</p>
                    </div>
                    <div className="py-1">
                        <a href="#" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            Profile Settings
                        </a>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
