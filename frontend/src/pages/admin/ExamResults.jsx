import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    ArrowLeft, 
    Search, 
    Download, 
    Trophy,
    User,
    Calendar,
    Award
} from 'lucide-react';

const ExamResults = () => {
    const { id } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get(`/admin/exams/${id}/results`);
                setResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/exams" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Exam Results</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Viewing all student submissions for this session.</p>
                    </div>
                </div>
                <button className="btn btn-secondary px-6 py-3 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export to Excel
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
                    <p className="text-3xl font-black text-slate-800">{results.length}</p>
                </div>
                <div className="card text-center flex flex-col items-center border-green-100 bg-green-50/30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Score</p>
                    <p className="text-3xl font-black text-green-600">
                        {results.length > 0 ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0}%
                    </p>
                </div>
                <div className="card text-center flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Rate</p>
                    <p className="text-3xl font-black text-blue-600">82%</p>
                </div>
                <div className="card text-center flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion Time</p>
                    <p className="text-3xl font-black text-slate-800">14m</p>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submission Date</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Score</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Result</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-300">Loading submissions...</td></tr>
                        ) : results.length === 0 ? (
                            <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-300 italic">No submissions found yet.</td></tr>
                        ) : results.map((res, idx) => (
                            <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs
                                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                          idx === 1 ? 'bg-slate-200 text-slate-600' : 
                                          idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                                        {idx + 1}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{res.user_name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{res.user_email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(res.submit_time).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${res.score}%` }}></div>
                                        </div>
                                        <span className="font-black text-slate-800 text-sm">{res.score}%</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                                        <Award className="w-3 h-3" /> Certified
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamResults;
