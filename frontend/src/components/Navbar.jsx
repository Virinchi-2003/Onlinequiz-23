import { useAuth } from '../context/authContext';
import { LogOut, User, Bell, Search, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-50 rounded-lg">
                    <Menu className="w-6 h-6 text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Q</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-none">QuizFlow</h1>
                        <p className="text-xs text-slate-500 font-medium">Exam Platform</p>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search exams, results, students..." 
                    className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{user?.role}</p>
                    </div>
                    <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                        {user?.profile_photo ? (
                            <img src={user.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-slate-400" />
                        )}
                    </button>
                    <button 
                        onClick={logout}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
