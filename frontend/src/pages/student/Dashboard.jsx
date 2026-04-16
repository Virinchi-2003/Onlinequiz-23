import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/authContext';
import { 
    Calendar, 
    ArrowRight, 
    Clock, 
    Target, 
    PlayCircle,
    History,
    FileText,
    Trophy,
    Award,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [stats, setStats] = useState({ passedCount: 0, avgScore: 0, rank: 42 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, statsRes] = await Promise.all([
                    api.get('/student/exams/available'),
                    api.get('/student/dashboard/stats')
                ]);
                setExams(examsRes.data.slice(0, 3));
                setStats(statsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-green-200">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Hello, {user?.name}! 👋</h1>
                    <p className="text-green-100 text-lg mb-8 font-medium">Ready to test your skills? We have new exams curated just for you. Keep up the great work!</p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/student/available-exams" className="bg-white text-green-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-green-50 transition-all flex items-center gap-2">
                            Browse Exams <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/student/planner" className="bg-green-500/30 backdrop-blur-md border border-green-400/30 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-500/40 transition-all">
                            View Study Planner
                        </Link>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <AcademicIcon className="absolute -right-20 -bottom-20 w-80 h-80 text-white/10 rotate-12" />
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Exams */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                             <PlayCircle className="text-green-600" /> Active Exams
                        </h2>
                        <Link to="/student/available-exams" className="text-green-600 font-bold hover:underline flex items-center gap-1">
                            Explore All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exams.length === 0 ? (
                            <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400 font-bold font-serif">
                                No exams currently available for you. Check back later!
                            </div>
                        ) : exams.map((exam) => (
                            <div key={exam.id} className="card group hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                                        Skill Test
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{exam.title}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                    {exam.description || 'Master your knowledge in this comprehensive examination covering core fundamentals and advanced patterns.'}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <div className="flex items-center gap-1 text-xs font-bold">
                                            <Clock className="w-4 h-4 text-green-500" /> {exam.duration}m
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold">
                                            <Target className="w-4 h-4 text-blue-500" /> {exam.passing_score}%
                                        </div>
                                    </div>
                                    <Link to={`/student/take-exam/${exam.id}`} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-green-200">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Award className="text-blue-600" /> Your Progress
                    </h2>
                    <div className="card space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-100">
                                <Trophy className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Global Rank</p>
                                <p className="text-2xl font-black text-slate-800">#{stats.rank} <span className="text-xs text-green-500 font-bold ml-1">↑3</span></p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-600">
                                <span>Level Progress</span>
                                <span>{stats.avgScore}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-1000 shadow-lg shadow-green-100" style={{ width: `${stats.avgScore}%` }}></div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-800">{stats.passedCount}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-800">{stats.avgScore}%</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg score</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-blue-600 rounded-[2rem] text-white flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold">Next Milestone</p>
                            <p className="text-xs text-blue-100">2 days to go! Prep now.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AcademicIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

export default StudentDashboard;
