
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { API_URL, getAuthHeaders } from '../../config/api';
import { formatTimeWIB } from '../../config/datetime';

interface Alert {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'acknowledged' | 'resolved';
    title: string;
    message: string;
    triggeredAt: string;
    building?: { name: string } | null;
    panel?: { name: string } | null;
}

const severityConfig: Record<string, { border: string; badge: string; badgeBg: string; text: string; label: string }> = {
    critical: { border: 'border-danger', badge: 'text-danger', badgeBg: 'bg-danger/10 border-danger/20', text: 'group-hover:text-danger', label: 'CRITICAL' },
    warning: { border: 'border-warning', badge: 'text-warning', badgeBg: 'bg-warning/10 border-warning/20', text: 'group-hover:text-warning', label: 'WARNING' },
    info: { border: 'border-primary', badge: 'text-primary', badgeBg: 'bg-primary/10 border-primary/20', text: '', label: 'INFO' },
};

const statusConfig: Record<string, { border: string; badge: string; badgeBg: string; label: string }> = {
    resolved: { border: 'border-success', badge: 'text-success', badgeBg: 'bg-success/10 border-success/20', label: 'RESOLVED' },
    acknowledged: { border: 'border-slate-500', badge: 'text-slate-400', badgeBg: 'bg-slate-700/30 border-slate-600/20', label: 'ACK' },
};

export function AlertFeed() {
    const { socket } = useSocket();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [newCount, setNewCount] = useState(0);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/alerts?limit=10`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (json.success) {
                setAlerts(json.data);
                setNewCount(json.data.filter((a: Alert) => a.status === 'active').length);
            }
        } catch {
            // keep stale data
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 15000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    // Listen for real-time new alerts
    useEffect(() => {
        if (!socket) return;
        const handler = (alert: Alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 20));
            setNewCount(prev => prev + 1);
        };
        socket.on('alert:new', handler);
        return () => { socket.off('alert:new', handler); };
    }, [socket]);

    const handleAcknowledge = async (id: string) => {
        try {
            await fetch(`${API_URL}/api/alerts/${id}/acknowledge`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            });
            fetchAlerts();
        } catch {
            // silent fail
        }
    };

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        return formatTimeWIB(d, { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <aside className="w-full lg:w-80 flex flex-col bg-white dark:bg-surface-darker rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                    <span className="material-symbols-outlined text-danger text-[18px]">warning</span>
                    Alert Log
                </h3>
                {newCount > 0 && (
                    <span className="text-[10px] font-bold bg-danger text-white px-1.5 py-0.5 rounded">{newCount} NEW</span>
                )}
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 max-h-[500px]">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        <span className="material-symbols-outlined text-2xl mb-2 block">check_circle</span>
                        No alerts
                    </div>
                ) : (
                    alerts.map(alert => {
                        const isResolved = alert.status === 'resolved' || alert.status === 'acknowledged';
                        const cfg = isResolved
                            ? statusConfig[alert.status] || statusConfig.acknowledged
                            : severityConfig[alert.severity] || severityConfig.info;

                        return (
                            <div
                                key={alert.id}
                                className={`bg-slate-50 dark:bg-[#1f2937] border-l-4 ${cfg.border} p-3 rounded shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group ${isResolved ? 'opacity-60 hover:opacity-100' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-mono text-slate-400">{formatTime(alert.triggeredAt)}</span>
                                    <span className={`text-[10px] font-bold ${cfg.badge} ${cfg.badgeBg} px-1.5 py-0.5 rounded border`}>
                                        {'label' in cfg ? cfg.label : ''}
                                    </span>
                                </div>
                                <h4 className={`text-xs font-bold text-slate-900 dark:text-white mb-0.5 ${!isResolved && 'text' in cfg ? cfg.text : ''} transition-colors`}>
                                    {alert.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                    {alert.building?.name && <span>{alert.building.name} - </span>}
                                    {alert.message}
                                </p>
                                {alert.status === 'active' && alert.severity === 'critical' && (
                                    <div className="mt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id); }}
                                            className="flex-1 w-full bg-danger/10 hover:bg-danger text-danger hover:text-white text-[10px] font-bold py-1 rounded transition-colors"
                                        >
                                            ACKNOWLEDGE
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors uppercase">
                    View System Logs
                </button>
            </div>
        </aside>
    );
}
