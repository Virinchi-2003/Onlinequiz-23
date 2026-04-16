import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import * as xlsx from 'xlsx';
import { 
    Plus, 
    Trash2, 
    Upload, 
    FileSpreadsheet, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle,
    Code,
    Type,
    ListChecks,
    HelpCircle,
    Save,
    Loader2,
    Download,
    Beaker,
    Play
} from 'lucide-react';

const QuestionManagement = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [newQuestion, setNewQuestion] = useState({
        type: 'MCQ',
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        marks: 1,
        test_cases: [{ input: '', output: '' }]
    });

    useEffect(() => {
        fetchExamDetails();
    }, [examId]);

    const fetchExamDetails = async () => {
        try {
            const [examRes, questionsRes] = await Promise.all([
                api.get(`/admin/exams`),
                api.get(`/admin/exams/${examId}/questions`)
            ]);
            const currentExam = examRes.data.find(e => e.id === parseInt(examId));
            setExam(currentExam);
            setQuestions(questionsRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            // For coding questions, store test cases in options as JSON
            const finalQuestion = { ...newQuestion };
            if (finalQuestion.type === 'CODING') {
                finalQuestion.options = JSON.stringify({ test_cases: finalQuestion.test_cases });
            } else if (finalQuestion.type === 'MCQ') {
                finalQuestion.options = JSON.stringify(finalQuestion.options);
            }

            const payload = {
                examId: parseInt(examId),
                questions: [finalQuestion]
            };
            await api.post('/admin/questions', payload);
            setShowAddForm(false);
            setNewQuestion({
                type: 'MCQ',
                question_text: '',
                options: ['', '', '', ''],
                correct_answer: '',
                explanation: '',
                marks: 1,
                test_cases: [{ input: '', output: '' }]
            });
            fetchExamDetails();
        } catch (err) {
            alert('Error adding question');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('examId', examId);

        setIsUploading(true);
        try {
            await api.post('/admin/questions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchExamDetails();
            alert('Questions uploaded successfully!');
        } catch (err) {
            alert('Error uploading file');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                type: 'MCQ',
                question_text: 'What is the capital of France?',
                options: 'Paris, London, Berlin, Madrid',
                correct_answer: 'Paris',
                explanation: 'Paris is the capital and most populous city of France.',
                marks: 1
            },
            {
                type: 'CODING',
                question_text: 'Write a function sum(a, b) that returns the sum of two numbers.',
                options: JSON.stringify({ test_cases: [{ input: '2 3', output: '5' }] }),
                correct_answer: 'function sum(a, b) { return a + b; }',
                explanation: 'A simple addition function.',
                marks: 5
            }
        ];

        const worksheet = xlsx.utils.json_to_sheet(templateData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Questions Template");
        xlsx.writeFile(workbook, "exam_questions_template.xlsx");
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to remove this question? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            fetchExamDetails();
            alert('Question deleted successfully');
        } catch (err) {
            alert('Error deleting question');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
    );

    return (
        <div className="space-y-8 animate-slide-in">
            <button 
                onClick={() => navigate('/admin/exams')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Exams
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Question Bank</span>
                    <h1 className="text-3xl font-black text-slate-800 mt-2">{exam?.title}</h1>
                    <p className="text-slate-500 mt-1">{questions.length} Questions currently assigned</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadTemplate} className="btn bg-slate-50 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2 px-6 py-3">
                        <Download className="w-5 h-5" />
                        Download Template
                    </button>
                    <label className="btn bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center gap-2 px-6 py-3">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                        Bulk Upload
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary px-6 py-3 flex items-center gap-2 shadow-green-100">
                        <Plus className="w-5 h-5" />
                        Add Question
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {questions.length === 0 ? (
                    <div className="card text-center py-24 bg-slate-50/50 border-dashed border-2 border-slate-200 rounded-[3rem]">
                        <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 tracking-tight">Zero Questions in Bank</h3>
                        <p className="text-slate-400 mt-2">Start your exam by adding questions manually or using Excel.</p>
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <div key={q.id} className="card group hover:border-green-100 transition-all duration-300 rounded-[2.5rem] p-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                                        {idx + 1}
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                        ${q.type === 'MCQ' ? 'bg-blue-50 text-blue-600' : q.type === 'CODING' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {q.type}
                                    </span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{q.marks} Tokens</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <h4 className="text-xl font-black text-slate-800 leading-tight mb-8">{q.question_text}</h4>
                            
                            {q.type === 'MCQ' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(Array.isArray(JSON.parse(q.options || '[]')) ? JSON.parse(q.options || '[]') : (q.options?.split(',') || [])).map((opt, i) => (
                                        <div key={i} className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all
                                            ${opt === q.correct_answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50/50 border-slate-100 text-slate-600'}`}>
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black
                                                ${opt === q.correct_answer ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-500'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="font-bold text-lg">{opt}</span>
                                            {opt === q.correct_answer && <CheckCircle2 className="w-5 h-5 ml-auto text-green-600" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'CODING' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden group/code shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Code className="w-4 h-4" /> Boilerplate / Reference
                                            </span>
                                        </div>
                                        <pre className="text-green-400 font-mono text-sm leading-relaxed overflow-x-auto">
                                            {q.correct_answer}
                                        </pre>
                                    </div>
                                    
                                    {/* Show Test Cases */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(q.options || '{"test_cases":[]}');
                                                return (parsed.test_cases || []).map((tc, tid) => (
                                                    <div key={tid} className="p-6 bg-white border border-slate-100 rounded-3xl flex gap-4 items-center">
                                                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                                                            {tid + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In: {tc.input}</p>
                                                            <p className="text-sm font-bold text-slate-800">Expected: {tc.output}</p>
                                                        </div>
                                                        <Beaker className="w-5 h-5 text-slate-200" />
                                                    </div>
                                                ));
                                            } catch (e) {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {q.explanation && (
                                <div className="mt-8 pt-8 border-t border-slate-50 flex gap-4 italic text-slate-400 text-sm font-medium">
                                    <HelpCircle className="w-5 h-5 flex-shrink-0 text-slate-300" />
                                    <p><b className="text-slate-500 font-black uppercase tracking-widest mr-2">Rationale:</b> {q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Comprehensive Add Form */}
            {showAddForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-10 md:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Architect Question</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Design a new assessment challenge.</p>
                                </div>
                                <button onClick={() => setShowAddForm(false)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all">
                                    <XCircle className="w-8 h-8" />
                                </button>
                            </div>

                            <form onSubmit={handleAddQuestion} className="space-y-8">
                                <div className="flex gap-3">
                                    {[
                                        { id: 'MCQ', icon: ListChecks, label: 'Selection' },
                                        { id: 'SHORT', icon: Type, label: 'Written' },
                                        { id: 'CODING', icon: Code, label: 'Engineering' },
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setNewQuestion({...newQuestion, type: type.id})}
                                            className={`flex-1 p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all
                                                ${newQuestion.type === type.id 
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <type.icon className="w-7 h-7" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assessment Descriptor</label>
                                    <textarea 
                                        className="input min-h-[140px] bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-green-500/10" 
                                        required 
                                        placeholder="Formulate your question clearly..."
                                        value={newQuestion.question_text}
                                        onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                                    ></textarea>
                                </div>

                                {newQuestion.type === 'MCQ' && (
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Response Matrix</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            {newQuestion.options.map((opt, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <input 
                                                        type="text" 
                                                        className="input bg-slate-50 border-transparent h-14" 
                                                        placeholder={`Alternative ${String.fromCharCode(65 + i)}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...newQuestion.options];
                                                            newOpts[i] = e.target.value;
                                                            setNewQuestion({...newQuestion, options: newOpts});
                                                        }}
                                                        required
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setNewQuestion({...newQuestion, correct_answer: opt})}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all
                                                            ${newQuestion.correct_answer === opt && opt !== ''
                                                                ? 'bg-green-600 text-white shadow-xl shadow-green-200' 
                                                                : 'bg-slate-100 text-slate-300 hover:bg-green-50 hover:text-green-500'}`}
                                                    >
                                                        <CheckCircle2 className="w-7 h-7" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {newQuestion.type === 'CODING' && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Starter Code / Solution Template</label>
                                            <textarea 
                                                className="input font-mono text-sm min-h-[160px] bg-slate-900 text-green-400 border-none rounded-[2rem] p-8" 
                                                required 
                                                placeholder="def solution():\n    # code here"
                                                value={newQuestion.correct_answer}
                                                onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                                            ></textarea>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Verification Matrix (Test Cases)</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewQuestion({...newQuestion, test_cases: [...newQuestion.test_cases, {input: '', output: ''}]})}
                                                    className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Case
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {newQuestion.test_cases.map((tc, tid) => (
                                                    <div key={tid} className="flex gap-3 items-center">
                                                        <input 
                                                            className="input bg-slate-50 border-transparent h-12 flex-1" 
                                                            placeholder="Input (e.g. 2 3)" 
                                                            value={tc.input} 
                                                            onChange={(e) => {
                                                                const ntc = [...newQuestion.test_cases];
                                                                ntc[tid].input = e.target.value;
                                                                setNewQuestion({...newQuestion, test_cases: ntc});
                                                            }}
                                                        />
                                                        <input 
                                                            className="input bg-slate-50 border-transparent h-12 flex-1" 
                                                            placeholder="Expected Output" 
                                                            value={tc.output}
                                                            onChange={(e) => {
                                                                const ntc = [...newQuestion.test_cases];
                                                                ntc[tid].output = e.target.value;
                                                                setNewQuestion({...newQuestion, test_cases: ntc});
                                                            }}
                                                        />
                                                        {newQuestion.test_cases.length > 1 && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => setNewQuestion({...newQuestion, test_cases: newQuestion.test_cases.filter((_, i) => i !== tid)})}
                                                                className="p-3 text-red-400 hover:text-red-600"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {newQuestion.type === 'SHORT' && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Evaluation Key</label>
                                        <textarea 
                                            className="input font-bold bg-orange-50/50 border-transparent h-20 text-orange-900 placeholder:text-orange-300" 
                                            required 
                                            placeholder="Keywords required for marking..."
                                            value={newQuestion.correct_answer}
                                            onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                                        ></textarea>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mark Allocation</label>
                                        <input 
                                            type="number" 
                                            className="input h-16 bg-slate-50 border-transparent font-black" 
                                            value={newQuestion.marks}
                                            onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Conceptual Explanation</label>
                                        <input 
                                            type="text" 
                                            className="input h-16 bg-slate-50 border-transparent font-bold" 
                                            placeholder="Context for correct logic..."
                                            value={newQuestion.explanation}
                                            onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-green-600 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                    >
                                        <Save className="w-6 h-6" />
                                        Commit Question
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

export default QuestionManagement;
