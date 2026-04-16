import { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    UserPlus, 
    MoreHorizontal, 
    Mail, 
    Calendar, 
    Shield, 
    Trash2, 
    History,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    BookOpen,
    ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [examHistory, setExamHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
    const [formMsg, setFormMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setFormMsg({ type: 'loading', text: 'Creating profile...' });
        try {
            await api.post('/admin/students', newStudent);
            setFormMsg({ type: 'success', text: 'Student onboarded successfully!' });
            setNewStudent({ name: '', email: '', password: '' });
            fetchStudents();
            setTimeout(() => setShowAddModal(false), 2000);
        } catch (err) {
            setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add student' });
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm('Are you sure you want to remove this student? All their history will be lost.')) return;
        try {
            await api.delete(`/admin/students/${id}`);
            fetchStudents();
        } catch (err) {
            alert('Failed to delete student');
        }
    };

    const viewHistory = async (student) => {
        setSelectedStudent(student);
        setShowHistoryModal(true);
        setHistoryLoading(true);
        try {
            const res = await api.get(`/admin/students/${student.id}/history`);
            setExamHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-slide-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Student Directory</h1>
                    <p className="text-slate-500 font-medium italic">Manage and monitor all platform students.</p>
                </div>
                <button 
                    onClick={() => { setShowAddModal(true); setFormMsg({ type: '', text: '' }); }}
                    className="bg-green-600 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
                >
                    <UserPlus className="w-6 h-6" />
                    Add New Student
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-green-500/10 font-bold text-slate-700 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <span className="px-6 py-4 bg-slate-50 text-slate-400 font-black rounded-[1.5rem] border border-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Total: {students.length}
                    </span>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                                <th className="text-left px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                                <th className="text-left px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance</th>
                                <th className="text-center px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                                        <p className="font-black text-slate-400 italic">Syncing with database...</p>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="font-black text-slate-400">No students found matching your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center border border-green-100 font-black text-xl shadow-inner uppercase">
                                                    {student.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-lg group-hover:text-green-600 transition-colors uppercase tracking-tight">{student.name}</p>
                                                    <p className="text-sm text-slate-400 font-bold flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 items-center">
                                            <div className="flex items-center gap-2 text-slate-500 font-black text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(student.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <button 
                                                onClick={() => viewHistory(student)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <History className="w-4 h-4" />
                                                View History
                                            </button>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Onboard Student</h3>
                                <p className="text-sm font-bold text-slate-400">Register a new student to the platform.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-slate-600 shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-10 space-y-6">
                            {formMsg.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold border ${formMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : formMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {formMsg.type === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : formMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    {formMsg.text}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Student Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="input h-16 bg-slate-50 border-transparent font-bold focus:bg-white"
                                    placeholder="Enter full name"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    className="input h-16 bg-slate-50 border-transparent font-bold focus:bg-white"
                                    placeholder="student@example.com"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Default Password</label>
                                <input 
                                    type="password" 
                                    required
                                    className="input h-16 bg-slate-50 border-transparent font-bold focus:bg-white"
                                    placeholder="••••••••"
                                    value={newStudent.password}
                                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-slate-900 text-white h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center justify-center gap-3"
                            >
                                <Shield className="w-6 h-6" />
                                Confirm Registration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scale-up">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                                    <History className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{selectedStudent?.name} - Exam Portfolio</h3>
                                    <p className="text-sm font-bold text-slate-400 tracking-wide">Historical assessment data and performance metrics.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-slate-600 shadow-sm transition-all hover:rotate-90">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                            {historyLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                                    <p className="font-black text-slate-400 italic">Retrieving assessment history...</p>
                                </div>
                            ) : examHistory.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <BookOpen className="w-12 h-12 text-slate-200" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800">No History Found</h4>
                                    <p className="text-slate-400 font-bold max-w-xs mx-auto mt-2">This student hasn't attempted any published exams yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {examHistory.map((exam, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${exam.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                    {exam.status}
                                                </div>
                                                <div className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(exam.start_time).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">{exam.title}</h4>
                                            
                                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessment Score</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-slate-800">{exam.score || 0}</span>
                                                        <span className="text-sm font-bold text-slate-400 tracking-tighter">/ {exam.total_marks || 0}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${exam.score && exam.total_marks && (exam.score / exam.total_marks >= 0.5) ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                                    {exam.score && exam.total_marks && (exam.score / exam.total_marks >= 0.5) ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                                                </div>
                                            </div>
                                            <div className="mt-4 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${exam.score && exam.total_marks && (exam.score / exam.total_marks >= 0.5) ? 'bg-green-500' : 'bg-red-500'}`}
                                                    style={{ width: `${(exam.score / exam.total_marks) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Efficiency</p>
                                    <p className="text-lg font-black text-slate-800">
                                        {Math.round(examHistory.reduce((acc, curr) => acc + (curr.score / curr.total_marks || 0), 0) / (examHistory.length || 1) * 100)}%
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-slate-200"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank Group</p>
                                    <p className="text-lg font-black text-blue-600">ALPHA</p>
                                </div>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-green-600 transition-all">
                                Close Portfolio
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
