export function AnalyticsDescription() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
            <div className="max-w-3xl w-full">
                {/* Main Content */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-6xl text-blue-500">analytics</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        Analytics & Reporting
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-[#9ca6ba] font-medium">
                        Analisis Data & Laporan Komprehensif
                    </p>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-2xl p-8 md:p-10 mb-10">
                    <p className="text-lg text-slate-700 dark:text-[#c5d0f0] leading-relaxed mb-6">
                        Modul Analytics & Reporting menyediakan analisis mendalam dan laporan komprehensif mengenai konsumsi energi di seluruh kampus. Dapatkan insight berharga dari data historis untuk mengidentifikasi tren, pola penggunaan, dan peluang optimisasi.
                    </p>
                    <p className="text-lg text-slate-700 dark:text-[#c5d0f0] leading-relaxed">
                        Visualisasi data yang intuitif memudahkan pengambilan keputusan strategis terkait manajemen energi, perencanaan anggaran, dan inisiatif keberlanjutan kampus.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Metrik Utama yang Dipantau</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0">bolt</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Total Konsumsi Energi</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Jumlah energi listrik total yang dikonsumsi dalam periode tertentu, dengan perbandingan tren bulanan dan tahunan.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-200 dark:border-orange-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-orange-600 dark:text-orange-400 flex-shrink-0">warning</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Peak Demand (Permintaan Puncak)</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Beban maksimum yang dikonsumsi pada waktu tertentu, penting untuk perencanaan kapasitas dan manajemen biaya puncak.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200 dark:border-green-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400 flex-shrink-0">trending_up</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Power Factor</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Efisiensi penggunaan daya, dengan target 0.95 atau lebih tinggi untuk operasional optimal dan penghematan biaya reaktif.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-200 dark:border-purple-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400 flex-shrink-0">attach_money</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Estimasi Biaya</h3>
                                    <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Proyeksi biaya energi listrik berdasarkan tarif dan pola konsumsi, membantu forecasting anggaran operasional.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Types */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Jenis Laporan</h2>
                    <div className="space-y-3">
                        <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-xl p-5 flex gap-4">
                            <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0">calendar_today</span>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Laporan Harian</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Detail konsumsi per jam untuk setiap hari, mengidentifikasi periode beban tinggi dan rendah.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-xl p-5 flex gap-4">
                            <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0">date_range</span>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Laporan Mingguan & Bulanan</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Ringkasan konsumsi untuk periode mingguan dan bulanan dengan analisis tren dan perbandingan historis.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-xl p-5 flex gap-4">
                            <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0">domain</span>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Laporan Per Gedung/Departemen</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Breakdown konsumsi energi per bangunan atau departemen untuk akuntabilitas dan optimisasi targeted.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-xl p-5 flex gap-4">
                            <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0">download</span>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Export Data (PDF & CSV)</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Download laporan dalam format PDF untuk presentasi atau CSV untuk analisis lebih lanjut di spreadsheet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visualization Types */}
                <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-2xl p-8 md:p-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Visualisasi Data</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl text-primary">bar_chart</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Chart Konsumsi Harian</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Visualisasi bar chart yang menunjukkan pola konsumsi energi per jam dalam sehari, membantu identifikasi jam-jam puncak.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl text-primary">trending_up</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Tren Konsumsi</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Line chart untuk visualisasi tren jangka panjang, memudahkan identifikasi perubahan pola konsumsi dari waktu ke waktu.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl text-primary">pie_chart</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Breakdown Departemen</h3>
                                <p className="text-sm text-slate-600 dark:text-[#9ca6ba]">Pie chart yang menampilkan proporsi konsumsi energi oleh setiap departemen atau gedung untuk analisis alokasi.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-slate-500 dark:text-[#9ca6ba]">
                        Halaman Analytics akan menampilkan data lengkap dan laporan komprehensif ketika data historis tersedia dari monitor real-time kampus.
                    </p>
                </div>
            </div>
        </main>
    );
}
