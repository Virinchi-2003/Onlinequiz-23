import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Calendar, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Circle, 
    Clock, 
    Target,
    LayoutGrid,
    ChevronLeft,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudyPlanner = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState({
        task_text: '',
        exam_id: '',
        due_date: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plannerRes, examsRes] = await Promise.all([
                    api.get('/student/planner'),
                    api.get('/student/exams/available')
                ]);
                setTasks(plannerRes.data);
                setExams(examsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/student/planner', newTask);
            setNewTask({ task_text: '', exam_id: '', due_date: '' });
            setShowAddForm(false);
            const res = await api.get('/student/planner');
            setTasks(res.data);
        } catch (err) {
            alert('Failed to add task');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
        try {
            await api.patch(`/student/planner/${id}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (id) => {
        if (!confirm('Remove this mission from your planner?')) return;
        try {
            await api.delete(`/student/planner/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <span className="font-black text-slate-400 italic">Syncing your roadmap...</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-slide-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-slate-800 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Base
                    </button>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Study Planner</h1>
                    <p className="text-slate-500 font-medium">Design your strategy for academic excellence.</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary px-8 py-4 flex items-center gap-3 shadow-xl shadow-green-200"
                >
                    <Plus className="w-6 h-6" />
                    New Milestone
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics Panel */}
                <div className="space-y-6">
                    <div className="card bg-slate-900 text-white p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Mission Overview</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-3xl font-black tabular-nums">
                                            {Math.round((tasks.filter(t => t.status === 'COMPLETED').length / (tasks.length || 1)) * 100)}%
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">Target Ready</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 transition-all duration-1000"
                                            style={{ width: `${(tasks.filter(t => t.status === 'COMPLETED').length / (tasks.length || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</p>
                                        <p className="text-2xl font-black">{tasks.filter(t => t.status === 'PENDING').length}</p>
                                    </div>
                                    <div className="p-4 bg-green-500/10 rounded-2xl">
                                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Cleared</p>
                                        <p className="text-2xl font-black text-green-400">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <LayoutGrid className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                    </div>

                    {/* Upcoming Exams Quick Link */}
                    <div className="card space-y-4">
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4 text-red-500" /> Priorities
                        </h4>
                        <div className="space-y-3">
                            {exams.slice(0, 3).map(exam => (
                                <div key={exam.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group">
                                    <span className="font-bold text-slate-700 text-sm">{exam.title}</span>
                                    <Clock className="w-4 h-4 text-slate-300 group-hover:text-green-600 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task List Section */}
                <div className="lg:col-span-2 space-y-6">
                    {tasks.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                            <AlertCircle className="w-16 h-16 text-slate-200" />
                            <p className="text-slate-400 font-bold text-lg italic">Your planner is clear. Design your first mission.</p>
                            <button onClick={() => setShowAddForm(true)} className="text-green-600 font-black uppercase text-xs tracking-widest hover:underline">
                                Create Milestone +
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div 
                                    key={task.id} 
                                    className={`card group flex items-center gap-6 p-6 transition-all border-2
                                        ${task.status === 'COMPLETED' ? 'bg-slate-50/50 border-transparent opacity-60' : 'bg-white border-transparent hover:border-slate-100 shadow-sm'}`}
                                >
                                    <button 
                                        onClick={() => toggleStatus(task.id, task.status)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0
                                            ${task.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                                    >
                                        {task.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            {task.exam_title && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">{task.exam_title}</span>}
                                            {task.due_date && <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Clock className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}</span>}
                                        </div>
                                        <p className={`font-bold text-lg leading-tight transition-all ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                            {task.task_text}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => deleteTask(task.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Task Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">New Milestone</h3>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Define your next target.</p>
                                </div>
                                <button onClick={() => setShowAddForm(false)} className="text-slate-300 hover:text-slate-800 transition-colors">
                                    <Plus className="w-8 h-8 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTask} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Mission</label>
                                    <textarea 
                                        className="input bg-slate-50 border-none min-h-[100px] p-5 font-bold" 
                                        required 
                                        placeholder="What needs to be achieved?"
                                        value={newTask.task_text}
                                        onChange={(e) => setNewTask({...newTask, task_text: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associated Exam</label>
                                        <select 
                                            className="input bg-slate-50 border-none h-14"
                                            value={newTask.exam_id}
                                            onChange={(e) => setNewTask({...newTask, exam_id: e.target.value})}
                                        >
                                            <option value="">General Project</option>
                                            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                                        <input 
                                            type="date" 
                                            className="input bg-slate-50 border-none h-14"
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full btn btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 flex items-center justify-center gap-3">
                                    Commit to Roadmap
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlanner;
