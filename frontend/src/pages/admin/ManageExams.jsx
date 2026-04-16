import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Trash2, 
    Edit, 
    Eye, 
    Upload,
    CheckCircle,
    XCircle,
    FileSpreadsheet,
    Clock,
    Target,
    HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 30,
        passing_score: 50,
        start_time: '',
        end_time: '',
        is_published: false
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/admin/exams');
            setExams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExam) {
                await api.put(`/admin/exams/${editingExam.id}`, formData);
            } else {
                await api.post('/admin/exams', formData);
            }
            setShowModal(false);
            setEditingExam(null);
            setFormData({ title: '', description: '', duration: 30, passing_score: 50, is_published: false });
            fetchExams();
        } catch (err) {
            alert('Error saving exam');
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            await api.post(`/admin/exams/${id}/publish`, { is_published: !currentStatus });
            fetchExams();
        } catch (err) {
            alert('Error publishing/unpublishing exam');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await api.delete(`/admin/exams/${id}`);
                fetchExams();
            } catch (err) {
                alert('Error deleting exam');
            }
        }
    };

    const openEditModal = (exam) => {
        setEditingExam(exam);
        setFormData({
            title: exam.title,
            description: exam.description || '',
            duration: exam.duration,
            passing_score: exam.passing_score,
            start_time: exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : '',
            end_time: exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : '',
            is_published: !!exam.is_published
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Exams</h1>
                    <p className="text-slate-500 font-medium">Create and manage your examination papers.</p>
                </div>
                <button 
                    onClick={() => { setEditingExam(null); setShowModal(true); }}
                    className="btn btn-primary px-6 py-3 flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create New Exam
                </button>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" placeholder="Search by name, category..." className="input pl-12" />
                </div>
                <button className="bg-white border border-slate-200 px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-slate-600 hover:bg-slate-50">
                    <Filter className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {/* Exams Table */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Passing Score</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">Loading exams...</td></tr>
                        ) : exams.length === 0 ? (
                            <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">No exams found. Start by creating one!</td></tr>
                        ) : exams.map((exam) => (
                            <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-bold text-slate-800">{exam.title}</p>
                                        <p className="text-xs text-slate-400 line-clamp-1">{exam.description || 'No description provided'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-semibold">{exam.duration}m</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Target className="w-4 h-4" />
                                        <span className="text-sm font-semibold">{exam.passing_score}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => togglePublish(exam.id, exam.is_published)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1
                                            ${exam.is_published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                                    >
                                        {exam.is_published ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {exam.is_published ? 'Published' : 'Draft'}
                                    </button>
                                </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            to={`/admin/exams/${exam.id}/questions`}
                                            title="Manage Questions"
                                            className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-green-600 transition-all"
                                        >
                                            <HelpCircle className="w-4 h-4" />
                                        </Link>
                                        <button 
                                            onClick={() => navigate(`/student/take-exam/${exam.id}?preview=true`)}
                                            title="Preview Exam"
                                            className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-purple-600 transition-all"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(exam)} 
                                            disabled={exam.is_published}
                                            className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-blue-500 disabled:opacity-30 transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(exam.id)} className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-red-500 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-slate-800 transition-all">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Exam Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="input" 
                                        placeholder="e.g. React Advanced Patterns"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    <textarea 
                                        className="input min-h-[100px]" 
                                        placeholder="Describe what this exam covers..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Duration (mins)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            className="input"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Passing Score (%)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            className="input"
                                            value={formData.passing_score}
                                            onChange={(e) => setFormData({...formData, passing_score: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Scheduled Start</label>
                                        <input 
                                            type="datetime-local" 
                                            className="input"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Scheduled End</label>
                                        <input 
                                            type="datetime-local" 
                                            className="input"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 btn btn-primary py-3 font-bold"
                                    >
                                        {editingExam ? 'Update Exam' : 'Create Exam'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageExams;
