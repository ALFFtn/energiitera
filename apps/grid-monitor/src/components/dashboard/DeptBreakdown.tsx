

export function DeptBreakdown() {
    const data = [
        { name: "Research Labs", value: "45%", color: "bg-primary" },
        { name: "Student Dormitories", value: "28%", color: "bg-indigo-500" },
        { name: "Administration", value: "15%", color: "bg-cyan-500" },
        { name: "Sports Complex", value: "12%", color: "bg-amber-500" },
    ];

    return (
        <div className="xl:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-border-dark">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Usage by Department</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Consumption distribution</p>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4 justify-center">
                {data.map((item, index) => (
                    <div key={index} className="group">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-200 font-medium">{item.name}</span>
                            <span className="text-slate-500 dark:text-slate-400">{item.value}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-background-dark rounded-full h-3">
                            <div className={`h-3 rounded-full ${item.color}`} style={{ width: item.value }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
