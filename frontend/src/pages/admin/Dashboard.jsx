import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Users, 
    BookOpen, 
    GraduationCap, 
    TrendingUp, 
    Plus,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ exams: 0, students: 0, totalAttempts: 0 });
    const [recentExams, setRecentExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, examsRes] = await Promise.all([
                    api.get('/admin/dashboard-stats'),
                    api.get('/admin/exams')
                ]);
                setStats(statsRes.data);
                setRecentExams(examsRes.data.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { title: 'Total Exams', value: stats.exams, icon: BookOpen, color: 'bg-blue-500', trend: '+12%', isUp: true },
        { title: 'Total Students', value: stats.students, icon: Users, color: 'bg-green-500', trend: '+5%', isUp: true },
        { title: 'Total Submissions', value: stats.totalAttempts, icon: GraduationCap, color: 'bg-purple-500', trend: '+18%', isUp: true },
        { title: 'Avg. Success Rate', value: `${stats.successRate}%`, icon: TrendingUp, color: 'bg-orange-500', trend: 'Live', isUp: true },
    ];

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back, manager! Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/exams" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Calendar className="w-5 h-5" />
                        Schedule 
                    </Link>
                    <Link to="/admin/exams" className="btn btn-primary px-6 py-3 flex items-center gap-2 shadow-green-200">
                        <Plus className="w-5 h-5" />
                        Create New Exam
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="card group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">{stat.title}</h3>
                            <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
                        </div>
                        {/* Abstract Background Element */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Exams List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Recently Created Exams</h2>
                        <Link to="/admin/exams" className="text-green-600 text-sm font-bold hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentExams.map((exam) => (
                            <div key={exam.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{exam.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {exam.duration} mins • {exam.passing_score} passing score • {new Date(exam.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${exam.is_published ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {exam.is_published ? 'Published' : 'Draft'}
                                    </span>
                                    <Link 
                                        to={`/admin/exams/${exam.id}/results`}
                                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
                    <div className="card space-y-3">
                        <Link to="/admin/students" className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-100 group">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-700">Invite Students</span>
                        </Link>
                        <Link to="/admin/analytics" className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-100 group">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-700">Analytics Report</span>
                        </Link>
                        <Link to="/admin/exams" className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-100 group">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-700">Batch Scheduling</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
