import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    BarChart3, 
    Settings, 
    HelpCircle,
    Trophy,
    History,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/authContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const adminLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Manage Exams', icon: BookOpen, path: '/admin/exams' },
        { name: 'Students', icon: Users, path: '/admin/students' },
        { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    ];

    const studentLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
        { name: 'Available Exams', icon: ClipboardList, path: '/student/available-exams' },
        { name: 'My History', icon: History, path: '/student/history' },
        { name: 'Leaderboards', icon: Trophy, path: '/student/leaderboards' },
    ];

    const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transition-transform duration-300 transform
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
                        <nav className="space-y-1">
                            {links.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => onClose()}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                                        ${isActive 
                                            ? 'bg-green-50 text-green-600 shadow-sm border border-green-100' 
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                                    `}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-slate-100">
                        <nav className="space-y-1">
                            <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                                <Settings className="w-5 h-5" />
                                Settings
                            </NavLink>
                            <NavLink to="/help" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                                <HelpCircle className="w-5 h-5" />
                                Help Center
                            </NavLink>
                        </nav>
                        
                        <div className="mt-6 p-4 bg-blue-600 rounded-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-white font-bold text-sm">Need Help?</p>
                                <p className="text-blue-100 text-xs mt-1">Our support team is 24/7 available for you.</p>
                                <button className="mt-3 bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-blue-50 transition-colors">
                                    Contact Support
                                </button>
                            </div>
                            <HelpCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500 opacity-20" />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
