import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    Trophy, 
    ChevronLeft, 
    Search, 
    Medal, 
    Crown,
    Star,
    ArrowUp,
    Clock,
    Target,
    Loader2,
    History
} from 'lucide-react';

const GlobalLeaderboard = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [players, setPlayers] = useState([]);
    const [personalHistory, setPersonalHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/student/exams/available');
                setExams(res.data);
                if (res.data.length > 0) {
                    setSelectedExam(res.data[0].id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchExams();
    }, []);

    useEffect(() => {
        if (!selectedExam) return;
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [playersRes, historyRes] = await Promise.all([
                    api.get(`/student/leaderboard/${selectedExam}`),
                    api.get(`/student/leaderboard/${selectedExam}/personal`)
                ]);
                setPlayers(playersRes.data);
                setPersonalHistory(historyRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedExam]);

    return (
        <div className="space-y-8 pb-20 animate-slide-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
                        <Trophy className="text-yellow-500 w-10 h-10" /> Hall of Fame
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Real-time competitive rankings synced with database intelligence.</p>
                </div>

                <div className="flex items-center bg-white border-2 border-slate-100 rounded-[2rem] px-6 py-4 shadow-xl shadow-slate-200/50 min-w-[350px]">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <select 
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-black text-slate-700 w-full cursor-pointer"
                    >
                        {exams.length === 0 && <option value="">No Active Exams</option>}
                        {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Podium View */}
            {!loading && players.length >= 3 && (
                <div className="grid grid-cols-3 gap-6 items-end max-w-3xl mx-auto pt-10 pb-12">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4 group scale-90 translate-y-4">
                            <div className="w-20 h-20 bg-slate-100 border-4 border-slate-300 rounded-2xl flex items-center justify-center font-black text-slate-400 text-3xl shadow-xl overflow-hidden uppercase">
                                {players[1].name[0]}
                            </div>
                            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-400 text-white rounded-2xl flex items-center justify-center font-black text-sm border-4 border-white shadow-lg">2</div>
                        </div>
                        <div className="bg-slate-200/50 w-full rounded-t-[2.5rem] p-8 text-center border-t-4 border-slate-300 backdrop-blur-sm self-stretch">
                           <p className="text-sm font-black text-slate-800 truncate mb-1">{players[1].name}</p>
                           <p className="text-2xl font-black text-slate-900">{players[1].percentage}%</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{players[1].score}/{players[1].total_marks} Marks</p>
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center">
                        <Crown className="text-yellow-500 w-12 h-12 mb-4 drop-shadow-lg animate-bounce duration-[3000ms]" />
                        <div className="relative mb-6 group">
                            <div className="absolute inset-0 bg-yellow-400 rounded-3xl animate-pulse opacity-20 scale-110"></div>
                            <div className="w-28 h-28 bg-yellow-50 border-4 border-yellow-400 rounded-3xl flex items-center justify-center font-black text-yellow-600 text-5xl shadow-2xl relative z-10 overflow-hidden uppercase">
                                {players[0].name[0]}
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-400 text-white rounded-2xl flex items-center justify-center font-black text-lg border-4 border-white shadow-xl z-20">
                                1
                            </div>
                        </div>
                        <div className="bg-white w-full rounded-t-[3rem] p-10 text-center shadow-2xl border-t-4 border-yellow-400 border-x border-slate-50 self-stretch">
                           <p className="text-lg font-black text-slate-800 truncate mb-1">{players[0].name}</p>
                           <p className="text-4xl font-black text-green-600 tracking-tighter">{players[0].percentage}%</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 font-black">{players[0].score}/{players[0].total_marks} Marks</p>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4 group scale-90 translate-y-8">
                            <div className="w-20 h-20 bg-orange-50 border-4 border-orange-200 rounded-2xl flex items-center justify-center font-black text-orange-400 text-3xl shadow-xl overflow-hidden uppercase">
                                {players[2].name[0]}
                            </div>
                            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-orange-400 text-white rounded-2xl flex items-center justify-center font-black text-sm border-4 border-white shadow-lg">3</div>
                        </div>
                        <div className="bg-orange-50/50 w-full rounded-t-[2.5rem] p-8 text-center border-t-4 border-orange-200 backdrop-blur-sm self-stretch">
                           <p className="text-sm font-black text-slate-800 truncate mb-1">{players[2].name}</p>
                           <p className="text-2xl font-black text-slate-900">{players[2].percentage}%</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{players[2].score}/{players[2].total_marks} Marks</p>
                        </div>
                    </div>
                </div>
            )}

            {/* List View */}
            {/* List View */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-800 text-2xl tracking-tight">Ranking Matrix</h3>
                        <p className="text-sm font-bold text-slate-400 tracking-wide">Live performance data of all participants.</p>
                    </div>
                    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl border border-yellow-100 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" /> Database Synced
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                                <th className="px-10 py-6">Global Rank</th>
                                <th className="px-6 py-6 font-black">Student Participant</th>
                                <th className="px-6 py-6">Efficiency (Mains/Time)</th>
                                <th className="px-6 py-6 text-center">Score (Raw)</th>
                                <th className="px-10 py-6 text-right">Performance Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-32 text-center font-bold text-slate-300 italic">
                                        <Loader2 className="w-12 h-12 text-slate-200 animate-spin mx-auto mb-4" />
                                        Computing live matrix...
                                    </td>
                                </tr>
                            ) : players.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-32 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Trophy className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h4 className="font-black text-slate-400">No attempts detected for this exam.</h4>
                                    </td>
                                </tr>
                            ) : players.map((player) => (
                                <tr key={player.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <span className="text-2xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">#{player.rank.toString().padStart(2, '0')}</span>
                                            {player.rank === 1 && <Crown className="w-6 h-6 text-yellow-500 drop-shadow-sm" />}
                                            {player.rank === 2 && <Medal className="w-6 h-6 text-slate-300" />}
                                            {player.rank === 3 && <Medal className="w-6 h-6 text-orange-300" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100 group-hover:bg-green-600 group-hover:text-white transition-all uppercase">
                                                {player.name[0]}
                                            </div>
                                            <span className="font-black text-slate-800 text-lg uppercase tracking-tighter">{player.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-3 text-slate-500 font-black text-xs uppercase bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 inline-flex">
                                            <Clock className="w-4 h-4 text-blue-500" /> 
                                            {Math.floor(player.time_taken / 60)}m {player.time_taken % 60}s
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-slate-800 tracking-tighter">{player.score}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ {player.total_marks} PTS</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-5">
                                            <div className="flex flex-col items-end mr-4">
                                                <span className="text-3xl font-black text-green-600 tracking-tighter group-hover:scale-110 transition-transform">{player.percentage}%</span>
                                            </div>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${player.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Personal Rank History Section */}
            {!loading && players.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <History className="text-green-600" /> My Personal Ranking Trajectory
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {personalHistory.length === 0 ? (
                            <div className="col-span-full p-8 bg-slate-50 rounded-3xl text-slate-400 font-bold italic text-center border-2 border-dashed border-slate-100">
                                No personal attempt history found for this exam.
                            </div>
                        ) : personalHistory.map((attempt, idx) => (
                            <div key={attempt.id} className="card bg-white border border-slate-100 p-6 flex items-center gap-5 hover:border-green-200 transition-all">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg
                                    ${idx === 0 ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-400'}`}>
                                    #{attempt.rank_in_attempt}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempt rank</p>
                                    <p className="font-black text-slate-800 truncate">Score: {attempt.score} pts</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">Attempt #{personalHistory.length - idx}</p>
                                </div>
                                {idx < personalHistory.length - 1 && attempt.rank_in_attempt < personalHistory[idx+1].rank_in_attempt && (
                                    <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                                        <ArrowUp className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalLeaderboard;
