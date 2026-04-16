import { useState, useEffect } from 'react';
import { 
    User, 
    Bell, 
    Lock, 
    Globe, 
    Shield, 
    Save, 
    CheckCircle2, 
    Key, 
    MessageSquare,
    Smartphone,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import api from '../services/api';

const GeneralSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState({ name: '', email: '', role: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    const showToast = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const res = await api.put('/auth/update-profile', { name: userData.name });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            showToast('Profile information updated successfully!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return showToast('New passwords do not match', 'error');
        }
        if (passwords.new.length < 6) {
            return showToast('Password must be at least 6 characters', 'error');
        }

        setLoading(true);
        try {
            await api.put('/auth/change-password', { 
                currentPassword: passwords.current, 
                newPassword: passwords.new 
            });
            showToast('Security credentials updated successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-10 animate-fade-in">
                        <section className="relative z-10">
                            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 uppercase font-black">
                                    {userData.name?.[0] || '?'}
                                </div>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="input h-16 bg-slate-50 border-transparent focus:bg-white font-bold text-slate-700" 
                                        value={userData.name} 
                                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="input h-16 bg-slate-50 border-transparent text-slate-400 font-bold" 
                                        value={userData.email} 
                                        disabled 
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-50" />

                        <div className="flex justify-end relative z-10">
                            <button 
                                onClick={handleUpdateProfile}
                                disabled={loading}
                                className="bg-slate-900 hover:bg-green-600 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                Save Profile Changes
                            </button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-8 animate-fade-in relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                                <Bell className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Communication Prefs</h3>
                                <p className="text-sm font-bold text-slate-400">Decide how you want to be notified.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'Exam Reminders', desc: 'Get notified 1 hour before scheduled exams.', active: true },
                                { title: 'Results Available', desc: 'Alert when your exam has been graded.', active: true },
                                { title: 'SMS Notifications', desc: 'Critical alerts via text message.', active: false },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-black text-slate-800">{item.title}</p>
                                            <p className="text-xs text-slate-400 font-bold">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-green-500' : 'bg-slate-200'} flex ${item.active ? 'justify-end' : 'justify-start'}`}>
                                        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-8 animate-fade-in relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                                <Lock className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Security Credentials</h3>
                                <p className="text-sm font-bold text-slate-400">Protect your account with a strong password.</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative group">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-500" />
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        required
                                        className="input pl-14 h-16 bg-slate-50 border-transparent focus:bg-white font-bold"
                                        placeholder="••••••••"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                                    >
                                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        className="input h-16 bg-slate-50 border-transparent focus:bg-white font-bold"
                                        placeholder="••••••••"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        className="input h-16 bg-slate-50 border-transparent focus:bg-white font-bold"
                                        placeholder="••••••••"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-purple-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                                Update Security Details
                            </button>
                        </form>
                    </div>
                );
            case 'language':
                return (
                    <div className="space-y-8 animate-fade-in relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100">
                                <Globe className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Language & Region</h3>
                                <p className="text-sm font-bold text-slate-400">Customize the platform display language.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'English (US)', flag: '🇺🇸', active: true },
                                { name: 'Hindi', flag: '🇮🇳', active: false },
                                { name: 'Spanish', flag: '🇪🇸', active: false },
                                { name: 'French', flag: '🇫🇷', active: false },
                            ].map((lang, idx) => (
                                <button 
                                    key={idx} 
                                    className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all group ${lang.active ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{lang.flag}</span>
                                        <span className={`font-black ${lang.active ? 'text-orange-600' : 'text-slate-600'}`}>{lang.name}</span>
                                    </div>
                                    {lang.active && <CheckCircle2 className="w-6 h-6 text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-slide-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h1>
                    <p className="text-slate-500 font-medium italic">Configure your profile, security, and preferences.</p>
                </div>
                {msg.text && (
                    <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 animate-slide-in font-bold border ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        {msg.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-3">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-5 py-5 rounded-2xl font-black flex items-center gap-4 transition-all ${activeTab === 'profile' ? 'bg-green-600 text-white shadow-xl shadow-green-100 translate-x-3' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'}`}
                    >
                        <User className="w-6 h-6" />
                        Profile Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full text-left px-5 py-5 rounded-2xl font-black flex items-center gap-4 transition-all ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-3' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'}`}
                    >
                        <Bell className="w-6 h-6" />
                        Notifications
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-5 py-5 rounded-2xl font-black flex items-center gap-4 transition-all ${activeTab === 'security' ? 'bg-purple-600 text-white shadow-xl shadow-purple-100 translate-x-3' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'}`}
                    >
                        <Lock className="w-6 h-6" />
                        Security Setup
                    </button>
                    <button 
                        onClick={() => setActiveTab('language')}
                        className={`w-full text-left px-5 py-5 rounded-2xl font-black flex items-center gap-4 transition-all ${activeTab === 'language' ? 'bg-orange-600 text-white shadow-xl shadow-orange-100 translate-x-3' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'}`}
                    >
                        <Globe className="w-6 h-6" />
                        System Language
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden flex flex-col min-h-[500px]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-bl-[8rem] -z-0 opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50 rounded-tr-[4rem] -z-0 opacity-40"></div>
                    
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
