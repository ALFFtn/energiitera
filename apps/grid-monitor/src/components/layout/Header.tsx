

export function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] bg-background-light dark:bg-background-dark px-6 py-3 lg:px-10">
            <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="size-8 text-primary">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_6_319)">
                            <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                        </g>
                        <defs>
                            <clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath>
                        </defs>
                    </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">GridMonitor</h2>
            </div>
            <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
                <div className="flex gap-2">
                    <button className="group flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-200 dark:bg-[#282e39] text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-[#3b4354] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    <button className="group flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-200 dark:bg-[#282e39] text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-[#3b4354] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                    </button>
                </div>
                <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20" data-alt="User profile avatar" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMlzr-YHYBFa3STtJ9tRakiIvw97sjUXBt3xN6YPh-Mh8HlJ-3FmDXapwgIRcqgoPIt_qR8p87GToTMwHbVaSUsrHe2-G5Woxbvo9Ls_umtiOO_ERM92mLlG6OBiY7VUM8flZThknSWIZEDecdIYhMaDdVIRZiFHNCfeAGoVR-lbaXAWuxF6mM5er3WVt8Nr_e8G_s8O5i7SVA835gWiEUKCA9Y16iPl41q2uynjJS3ZHYyGbhF8G3kakH7FsDAdv48QSXkoW78KXf")' }}></div>
            </div>
        </header>
    );
}
