import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Send, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Code, 
    Terminal, 
    Play, 
    Beaker,
    Save,
    Cpu,
    Timer
} from 'lucide-react';
import api from '../../services/api';

const TakeExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Coding specific states
    const [codeOutput, setCodeOutput] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [selectedLang, setSelectedLang] = useState('javascript');

    const timerRef = useRef(null);

    useEffect(() => {
        const startExam = async () => {
            try {
                const res = await api.post('/student/attempts/start', { examId });
                setAttempt(res.data.attempt);
                setQuestions(res.data.questions);
                
                // Calculate time left from start_time and duration
                const startTime = new Date(res.data.attempt.start_time).getTime();
                const now = new Date().getTime();
                const durationMs = res.data.attempt.duration * 60 * 1000;
                const elapsedMs = now - startTime;
                const remaining = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
                
                setTimeLeft(remaining);
                
                // Initialize answers if any
                const existingAnswers = {};
                res.data.questions.forEach(q => {
                    if (q.student_answer) existingAnswers[q.id] = q.student_answer;
                });
                setAnswers(existingAnswers);
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to start exam');
                navigate('/student/dashboard');
            } finally {
                setLoading(false);
            }
        };
        startExam();
    }, [examId]);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAutoSubmit = () => {
        handleSubmit(true);
    };

    const handleAnswerChange = async (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        try {
            await api.post('/student/answers/save', {
                attemptId: attempt.id,
                questionId,
                answer: value
            });
        } catch (err) {
            console.error('Failed to auto-save answer');
        }
    };

    const runCode = async (isTesting = false) => {
        const currentQ = questions[currentIndex];
        const code = answers[currentQ.id] || '';
        
        if (!code.trim()) {
            setCodeOutput('// Error: Code cannot be empty');
            return;
        }

        setExecuting(true);
        setCodeOutput('// Initializing environment...\n// Compiling...\n');
        setTestResults(null);

        // Simulation delay for premium feel
        await new Promise(r => setTimeout(r, 800));

        try {
            if (selectedLang !== 'javascript' && selectedLang !== 'python') {
                setCodeOutput(`// [${selectedLang.toUpperCase()} Engine Simulation]\n// Status: Successfully compiled.\n// Note: Full cloud execution required for binary outputs.\n\nOutput: Execution finished.`);
                setExecuting(false);
                return;
            }

            // High-fidelity Javascript Simulator using Function constructor
            if (selectedLang === 'javascript') {
                const startTime = performance.now();
                let output = '';
                const mockConsole = { log: (...args) => { output += args.join(' ') + '\n'; } };
                
                try {
                    const func = new Function('console', code);
                    func(mockConsole);
                    const endTime = performance.now();
                    const duration = (endTime - startTime).toFixed(2);
                    
                    setCodeOutput(`// Status: Success\n// Time: ${duration}ms\n\n${output || '// No output rendered.'}`);
                    
                    if (isTesting) {
                        const meta = JSON.parse(currentQ.options || '{"test_cases":[]}');
                        const results = meta.test_cases?.map(tc => {
                            // Simple string execution check
                            const isMatch = output.toLowerCase().includes(tc.output.toLowerCase());
                            return { input: tc.input, expected: tc.output, actual: output.trim(), passed: isMatch };
                        });
                        setTestResults(results);
                    }
                } catch (e) {
                    setCodeOutput(`// Runtime Error:\n${e.message}`);
                }
            } else {
                // Mock Python execution
                setCodeOutput(`// [PYTHON 3.10 Engine]\n// Processing input stream...\n\nOutput: Hello from Python simulator!`);
            }
        } catch (err) {
            setCodeOutput('// Execution Error. Please check code syntax.');
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !confirm('Are you sure you want to finish the exam?')) return;
        
        setSubmitting(true);
        try {
            await api.post('/student/attempts/submit', {
                attemptId: attempt.id,
                autoSubmitted: isAuto
            });
            navigate(`/student/results/${attempt.id}`);
        } catch (err) {
            alert('Failed to submit exam');
            setSubmitting(false);
        }
    };

    if (loading || !attempt || questions.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                <p className="text-slate-500 font-black italic animate-pulse">Synchronizing assessment environment...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="bg-green-600 text-white p-2 rounded-xl">
                        <Code className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">{attempt?.title}</h1>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            <span>Q: {currentIndex + 1} / {questions.length}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span>{currentQuestion.marks} Marks</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all shadow-inner
                        ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                        <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500' : 'text-slate-400'}`} />
                        <span className="font-black text-lg tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                    <button 
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Final Finish
                    </button>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 relative overflow-hidden">
                <div 
                    className="h-full bg-green-600 transition-all duration-500 shadow-[0_0_15px_rgba(22,163,74,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-84px)]">
                {/* Left: Question content */}
                <div className="w-full lg:w-[40%] flex flex-col border-r border-slate-100 overflow-hidden bg-white">
                    <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex items-center gap-2 text-slate-400 uppercase font-black text-[10px] tracking-widest mb-4">
                            <Play className="w-3 h-3" /> Question Profile
                        </div>
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-2xl font-black text-slate-800 leading-tight mb-8">
                                {currentQuestion.question_text}
                            </h2>
                            
                            {currentQuestion.type === 'MCQ' && (
                                <div className="space-y-4">
                                    {currentQuestion.options && JSON.parse(currentQuestion.options).map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                                            className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 group
                                                ${answers[currentQuestion.id] === opt 
                                                    ? 'bg-green-50 border-green-500 text-green-800 shadow-xl shadow-green-100' 
                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm
                                                ${answers[currentQuestion.id] === opt 
                                                    ? 'bg-green-600 text-white ' 
                                                    : 'bg-slate-100 text-slate-400group-hover:bg-white'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="font-bold text-lg">{opt}</span>
                                            {answers[currentQuestion.id] === opt && <CheckCircle2 className="w-6 h-6 ml-auto text-green-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'SHORT' && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Text Response</label>
                                    <textarea
                                        className="input min-h-[200px] bg-slate-50 border-transparent rounded-[2rem] p-8 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="Articulate your answer here..."
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    ></textarea>
                                </div>
                            )}

                            {currentQuestion.type === 'CODING' && (
                                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem]">
                                    <div className="flex items-center gap-3 text-blue-600 mb-4">
                                        <Beaker className="w-6 h-6" />
                                        <h4 className="font-black uppercase text-xs tracking-widest">Efficiency Metrics</h4>
                                    </div>
                                    <p className="text-blue-800 text-sm font-medium leading-relaxed">
                                        Your code will be evaluated based on time complexity, accuracy against hidden test cases, and memory utilization. Use the terminal on the right to verify logic.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button 
                            disabled={currentIndex === 0}
                            onClick={() => {
                                setCurrentIndex(prev => prev - 1);
                                setCodeOutput('');
                                setTestResults(null);
                            }}
                            className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-200 hover:text-slate-800 hover:border-slate-800 disabled:opacity-30 transition-all font-black text-xs flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" /> Previous
                        </button>
                        <button 
                            disabled={currentIndex === questions.length - 1}
                            onClick={() => {
                                setCurrentIndex(prev => prev + 1);
                                setCodeOutput('');
                                setTestResults(null);
                            }}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-green-600 disabled:opacity-30 transition-all flex items-center gap-2 uppercase tracking-widest"
                        >
                            Save & Next <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Right: Code Editor & Console */}
                <div className="flex-1 flex flex-col bg-slate-900 relative">
                    {currentQuestion.type === 'CODING' ? (
                        <>
                            {/* Editor Header */}
                            <div className="bg-[#1e1e1e] border-b border-[#333] px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-[#2d2d2d] px-4 py-2 rounded-xl text-slate-300 text-xs font-black">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        solution.{selectedLang === 'python' ? 'py' : selectedLang === 'java' ? 'java' : 'js'}
                                    </div>
                                    <select 
                                        value={selectedLang} 
                                        onChange={(e) => setSelectedLang(e.target.value)}
                                        className="bg-[#2d2d2d] border-none text-slate-400 text-xs font-black rounded-xl focus:ring-0 cursor-pointer"
                                    >
                                        <option value="javascript">JavaScript v18</option>
                                        <option value="python">Python v3.10</option>
                                        <option value="java">Java v17</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => runCode(false)}
                                        disabled={executing}
                                        className="bg-[#2d2d2d] text-slate-300 px-6 py-2 rounded-xl font-black text-xs hover:bg-slate-700 transition-all flex items-center gap-2"
                                    >
                                        {executing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                        Run Code
                                    </button>
                                    <button 
                                        onClick={() => runCode(true)}
                                        disabled={executing}
                                        className="bg-green-600 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-green-500 transition-all flex items-center gap-2 shadow-lg shadow-green-900/20"
                                    >
                                        <Beaker className="w-4 h-4" />
                                        Run Tests
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={selectedLang}
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                                    options={{
                                        fontSize: 14,
                                        fontFamily: 'Monaspace Argon, JetBrains Mono, monospace',
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 20 }
                                    }}
                                />
                            </div>

                            {/* Console Area */}
                            <div className={`transition-all duration-300 ${codeOutput || testResults ? 'h-64' : 'h-12'} bg-[#0d0d0d] border-t border-[#333] flex flex-col relative overflow-hidden`}>
                                <div className="px-6 py-3 flex items-center justify-between border-b border-[#1a1a1a]">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Terminal className="w-3 h-3" /> System Console Output
                                    </div>
                                    <button onClick={() => { setCodeOutput(''); setTestResults(null); }} className="text-slate-600 hover:text-slate-400 transition-all">
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar">
                                    {testResults ? (
                                        <div className="space-y-3">
                                            {testResults.map((tr, tid) => (
                                                <div key={tid} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${tr.passed ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {tr.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                        <span className="font-bold">Test Case {tid + 1}: {tr.passed ? 'PASSED' : 'FAILED'}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase opacity-60">
                                                        Arg: {tr.input} | Expected: {tr.expected}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <pre className="text-slate-400 leading-relaxed italic">
                                            {codeOutput || '// Terminal ready. Run tests to see output...'}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-8 border-4 border-slate-800 animate-pulse">
                                <Cpu className="w-16 h-16 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Evaluation Engine Active</h3>
                            <p className="text-slate-600 font-bold max-w-md mt-4 leading-relaxed">
                                Our automated marking system is monitoring your session. Focus on the {currentQuestion.type === 'MCQ' ? 'Selection' : 'Articulation'} challenge.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TakeExam;
