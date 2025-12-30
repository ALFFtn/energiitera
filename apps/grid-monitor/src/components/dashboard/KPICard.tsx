
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface KPICardProps {
    title: string;
    value: string;
    unit?: string;
    icon: string;
    iconColor: string;
    trend?: {
        value: string;
        isPositive: boolean; // true for up, false for down? Or just sentiment?
        // In the HTML: 
        // Card 1: trending_up, rose-500 (bad?)
        // Card 3: trending_down, emerald-500 (good?) (projected saving)
        // So color logic depends on context.
        colorClass: string;
        bgClass: string;
        iconName: string;
    };
    footer?: {
        icon: string;
        text: string;
    };
}

export function KPICard({ title, value, unit, icon, iconColor, trend, footer }: KPICardProps) {
    return (
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-slate-200 dark:border-border-dark shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className={clsx("material-symbols-outlined text-[64px]", iconColor)}>{icon}</span>
            </div>
            <div className="flex flex-col gap-1 z-10 relative">
                <span className="text-slate-500 dark:text-[#9ca6ba] text-sm font-medium">{title}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</span>
                    {unit && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
                </div>
                {trend && (
                    <div className={twMerge("flex items-center gap-1 mt-2 w-fit px-2 py-0.5 rounded text-xs font-bold", trend.colorClass, trend.bgClass)}>
                        <span className="material-symbols-outlined text-[16px]">{trend.iconName}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
                {footer && (
                    <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[16px]">{footer.icon}</span>
                        <span>{footer.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
