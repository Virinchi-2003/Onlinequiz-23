import { useState, useEffect } from 'react';
import { 
    History as HistoryIcon, 
    Calendar, 
    Clock, 
    Target, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight,
    Loader2,
    FileText,
    Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/student/history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                <p className="text-slate-500 font-black italic animate-pulse">Retrieving your assessment records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <HistoryIcon className="text-green-600 w-8 h-8" /> Assessment History
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Track your performance across all completed examinations.</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Exams</p>
                            <p className="text-lg font-black text-slate-800">{history.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">No History Yet</h3>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto mt-2 leading-relaxed">
                        You haven't completed any examinations yet. Head over to Available Exams to start your journey!
                    </p>
                    <Link to="/student/available-exams" className="btn btn-primary mt-8 inline-flex items-center gap-2 px-10 py-4 shadow-green-200">
                        View Available Exams <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {history.map((record) => (
                        <Link 
                            key={record.id}
                            to={`/student/results/${record.id}`}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 hover:shadow-2xl transition-all group"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-all">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${record.score / record.total_marks >= 0.5 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {record.score / record.total_marks >= 0.5 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {record.score / record.total_marks >= 0.5 ? 'Passed' : 'Review Required'}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-1 group-hover:text-green-600 transition-colors uppercase tracking-tight">
                                {record.title}
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</span>
                                    <span className="text-slate-700">{new Date(record.submit_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Finish Time</span>
                                    <span className="text-slate-700">{new Date(record.submit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-800">{record.score}</span>
                                        <span className="text-sm font-bold text-slate-400 tracking-tighter">/ {record.total_marks}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                                    <p className="text-2xl font-black text-green-600">
                                        {Math.round((record.score / record.total_marks) * 100)}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${record.score / record.total_marks >= 0.5 ? 'bg-green-500' : 'bg-orange-500'}`}
                                    style={{ width: `${(record.score / record.total_marks) * 100}%` }}
                                ></div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyHistory;
