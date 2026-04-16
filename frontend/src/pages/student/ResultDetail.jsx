import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    Trophy, 
    CheckCircle, 
    XCircle, 
    ArrowLeft, 
    Clock, 
    Target,
    BarChart,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const ResultDetail = () => {
    const { attemptId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await api.get(`/student/attempts/${attemptId}/result`);
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId]);

    if (loading) return <div>Loading results...</div>;

    const { attempt, questions } = data;
    const score = questions.reduce((acc, q) => acc + (q.marks_awarded || 0), 0);
    const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0);
    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= attempt.passing_score;

    return (
        <div className="space-y-8 pb-20">
            <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>

            {/* Hero Result Section */}
            <div className={`rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl
                ${passed ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-green-100' : 'bg-gradient-to-r from-red-600 to-red-700 shadow-red-100'}`}>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest border border-white/20">
                            Exam Result
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black">{passed ? 'Congratulations!' : 'Keep Practicing'}</h1>
                        <p className="text-white/80 text-lg font-medium">
                            {passed 
                                ? `You've successfully cleared the ${attempt.title}. Exceptional performance!` 
                                : `You didn't reach the passing score of ${attempt.passing_score}%. Review your weak areas below.`}
                        </p>
                    </div>
                    
                    <div className="md:w-72 h-72 bg-white rounded-[2.5rem] flex flex-col items-center justify-center p-8 shadow-2xl text-slate-800 relative group animate-in zoom-in-50 duration-500">
                        <div className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-2 font-serif">Final Score</div>
                        <div className="text-7xl font-black leading-none mb-1 text-slate-900">{percentage}%</div>
                        <div className="text-slate-500 font-bold">{score} / {totalMarks} pts</div>
                        <div className={`mt-6 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2
                            ${passed ? 'bg-green-50 border-green-500 text-green-600' : 'bg-red-50 border-red-500 text-red-600'}`}>
                            {passed ? 'Passed' : 'Failed'}
                        </div>
                        <Trophy className={`absolute -top-6 -right-6 w-20 h-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform rotate-12
                            ${passed ? 'text-yellow-500' : 'text-slate-300'}`} />
                    </div>
                </div>
                
                {/* Decorative BG */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card flex items-center lg:items-start flex-col gap-1">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2"><Clock className="w-6 h-6" /></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Time Taken</p>
                    <p className="text-xl font-black text-slate-800">12:45 <span className="text-xs text-slate-400 font-bold">mins</span></p>
                </div>
                <div className="card flex items-center lg:items-start flex-col gap-1">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-2"><CheckCircle className="w-6 h-6" /></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Correct Answers</p>
                    <p className="text-xl font-black text-slate-800">{questions.filter(q => q.is_correct).length} / {questions.length}</p>
                </div>
                <div className="card flex items-center lg:items-start flex-col gap-1">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-2"><Download className="w-6 h-6" /></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Certificate</p>
                    <button 
                        onClick={() => {
                            if (!passed) {
                                alert('Please reach the passing score to unlock your certificate!');
                                return;
                            }
                            const doc = new jsPDF({ orientation: 'landscape' });
                            
                            // Background & Border
                            doc.setDrawColor(22, 163, 74);
                            doc.setLineWidth(2);
                            doc.rect(10, 10, 277, 190);
                            doc.setLineWidth(0.5);
                            doc.rect(12, 12, 273, 186);

                            // Header
                            doc.setTextColor(22, 163, 74);
                            doc.setFontSize(40);
                            doc.setFont('helvetica', 'bold');
                            doc.text('CERTIFICATE OF EXCELLENCE', 148.5, 50, { align: 'center' });
                            
                            doc.setTextColor(100);
                            doc.setFontSize(16);
                            doc.setFont('helvetica', 'normal');
                            doc.text('This is to certify that', 148.5, 75, { align: 'center' });

                            // Student Name
                            doc.setTextColor(30);
                            doc.setFontSize(32);
                            doc.setFont('helvetica', 'bold');
                            doc.text(attempt.user_name || 'Valued Candidate', 148.5, 95, { align: 'center' });

                            // Description
                            doc.setTextColor(100);
                            doc.setFontSize(16);
                            doc.setFont('helvetica', 'normal');
                            doc.text(`has successfully completed the assessment for`, 148.5, 115, { align: 'center' });

                            doc.setTextColor(22, 163, 74);
                            doc.setFontSize(24);
                            doc.setFont('helvetica', 'bold');
                            doc.text(attempt.title?.toUpperCase() || 'EXAMINATION', 148.5, 130, { align: 'center' });

                            // Stats
                            doc.setTextColor(80);
                            doc.setFontSize(14);
                            doc.text(`Completed on: ${new Date(attempt.submit_time).toLocaleDateString()}`, 148.5, 150, { align: 'center' });
                            doc.text(`Score Achieved: ${percentage}% (${score}/${totalMarks} Marks)`, 148.5, 160, { align: 'center' });

                            // Seal Placeholder
                            doc.setDrawColor(200);
                            doc.setLineWidth(1);
                            doc.circle(240, 165, 15);
                            doc.setTextColor(150);
                            doc.setFontSize(8);
                            doc.text('OFFICIAL', 240, 164, { align: 'center' });
                            doc.text('SEAL', 240, 168, { align: 'center' });

                            doc.save(`${attempt.user_name || 'Candidate'}_Certificate.pdf`);
                        }}
                        className={`text-sm font-bold hover:underline transition-all ${passed ? 'text-orange-600' : 'text-slate-300 cursor-not-allowed'}`}
                    >
                        {passed ? 'Download PDF' : 'Locked'}
                    </button>
                </div>
            </div>

            {/* Answer Key */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <BarChart className="text-green-600" /> Answer Analysis
                </h2>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0
                                        ${q.is_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {idx + 1}
                                    </div>
                                    <p className="font-bold text-slate-700 line-clamp-1">{q.question_text}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {q.is_correct ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    {expandedQuestion === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </button>

                            {expandedQuestion === idx && (
                                <div className="px-8 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-2">
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Answer</p>
                                            <p className={`font-bold ${q.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                                {q.student_answer || '<Empty Answer>'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Answer</p>
                                            <p className="font-bold text-slate-800">{q.correct_answer}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><HelpCircle className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
                                            <p className="text-slate-600 text-sm leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultDetail;
