import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Search, 
    Filter, 
    BookOpen, 
    Clock, 
    Target, 
    ArrowRight,
    Play,
    Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AvailableExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/student/exams/available');
                setExams(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = exams.filter(e => 
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Available Exams</h1>
                    <p className="text-slate-500 font-medium">Browse through our library of specialized skill tests.</p>
                </div>
            </div>

            {/* Browser Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by exam title..." 
                        className="input pl-12"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-slate-600 hover:bg-slate-50">
                    <Filter className="w-5 h-5" />
                    Categories
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>)}
                </div>
            ) : filteredExams.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 italic font-bold text-slate-400 text-xl font-serif">
                    No matching exams found. Try a different search!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredExams.map((exam) => (
                        <div key={exam.id} className="card group relative flex flex-col hover:-translate-y-2">
                            <div className="absolute top-0 right-0 p-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                <button className="w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 flex items-start gap-4">
                                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shrink-0 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{exam.title}</h3>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">Published</span>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed">
                                {exam.description || 'Test your proficiency in this structured examination environment. Designed for both beginners and advanced learners.'}
                            </p>

                            <div className="mt-auto pt-6 border-t border-slate-50 grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                        <Clock className="w-4 h-4 text-green-500" /> {exam.duration}m
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Score</p>
                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                        <Target className="w-4 h-4 text-blue-500" /> {exam.passing_score}%
                                    </div>
                                </div>
                            </div>

                            <Link 
                                to={`/student/take-exam/${exam.id}`}
                                className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 group/btn"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Start Exam Session</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableExams;
