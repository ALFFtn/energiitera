export function DashboardDescription() {
    return (
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="max-w-3xl w-full">
                {/* Main Content */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-6xl text-primary">bolt</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        PowerGrid OS
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-[#9ca6ba] font-medium">
                        Intelligent Campus Energy Management System
                    </p>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-2xl p-8 md:p-10 mb-10">
                    <p className="text-lg text-slate-700 dark:text-[#c5d0f0] leading-relaxed mb-6">
                        PowerGrid OS adalah platform monitoring dan manajemen energi terpadu untuk kampus. Sistem ini dirancang untuk memberikan visibilitas real-time terhadap konsumsi energi listrik di seluruh gedung dan zona, membantu mengidentifikasi peluang penghematan, dan mengoptimalkan efisiensi operasional.
                    </p>
                    <p className="text-lg text-slate-700 dark:text-[#c5d0f0] leading-relaxed">
                        Dengan teknologi IoT dan analitik canggih, PowerGrid OS memungkinkan administrator kampus untuk membuat keputusan berbasis data mengenai penggunaan energi, mengurangi biaya operasional, dan mendukung inisiatif keberlanjutan lingkungan.
                    </p>
                </div>

                {/* Features */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Fitur Utama</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0">dashboard</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Real-time Monitoring</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Pantau konsumsi energi secara real-time dengan update data per detik melalui sensor LVMDP (Low Voltage Monitoring & Distribution Panel).</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200 dark:border-green-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400 flex-shrink-0">apartment</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Multi-Building Management</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Kelola hingga ratusan gedung dengan pembagian zona berdasarkan lokasi geografis atau fungsi operasional.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-200 dark:border-orange-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-orange-600 dark:text-orange-400 flex-shrink-0">trending_up</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Advanced Analytics</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Analisis mendalam dengan visualisasi data, tren konsumsi, dan laporan komprehensif untuk mendukung pengambilan keputusan strategis.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-200 dark:border-red-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400 flex-shrink-0">warning</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Smart Alerts & Anomalies</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Deteksi otomatis pada voltage sag/swell, THD tinggi, power factor rendah, dan anomali lainnya untuk maintenance proaktif.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How to Use */}
                <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-2xl p-8 md:p-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Cara Menggunakan</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">1</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Menu Buildings</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba] mt-1">Lihat daftar semua gedung yang terdaftar, diorganisir berdasarkan zona di kampus.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">2</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Pilih Gedung (Click Building Card)</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba] mt-1">Klik pada kartu gedung untuk melihat detail monitoring dan data sensor real-time.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">3</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Analisis Data</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba] mt-1">Kunjungi menu Analytics untuk melihat laporan komprehensif dan tren historis konsumsi energi.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">4</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Monitoring Alerts</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba] mt-1">Pantau alert dan anomali sistem untuk identifikasi dini potensi masalah operasional atau maintenance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-slate-500 dark:text-[#9ca6ba]">
                        Dashboard content tersedia melalui menu navigasi. Mulai dengan menu <span className="font-semibold">Buildings</span> untuk melihat overview kampus.
                    </p>
                </div>
            </div>
        </div>
    );
}
