import { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Users, 
    BookOpen, 
    BarChart3, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Trophy,
    Target,
    Download
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/admin/analytics');
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleExportPDF = () => {
        if (!data) return;
        setExporting(true);
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleString();

            // Header - Large Stylish Title
            doc.setFontSize(28);
            doc.setTextColor(34, 197, 94); // Green-600
            doc.text('QuizFlow Intelligence', 14, 25);
            
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.text(`Official Performance Report | ${date}`, 14, 32);
            doc.line(14, 38, 196, 38);

            // Summary Stats Section
            doc.setFontSize(18);
            doc.setTextColor(30, 41, 59); // Slate-800
            doc.text('Executive Metrics', 14, 52);

            const summaryBody = [
                ['Completion Rate', `${data.summary.completionRate}%`],
                ['Average Class Score', `${data.summary.avgScore}%`],
                ['Total Student Engagement', data.summary.activeUsers],
                ['Successful Submissions', data.summary.examsTaken],
                ['Qualifying Pass Rate', `${data.summary.passRate}%`]
            ];

            autoTable(doc, {
                startY: 58,
                head: [['Performance Indicator', 'Real-time Value']],
                body: summaryBody,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
                styles: { fontSize: 11, cellPadding: 5 }
            });

            // Exam Performance Breakdown
            const nextY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(18);
            doc.text('Subject Wise Distribution', 14, nextY);
            
            const examRows = data.examDistribution.map(e => [
                e.title,
                e.count,
                `${Math.round(e.avg_score || 0)}%`,
                Math.round(e.avg_score || 0) >= 50 ? 'EXPERT' : 'REMEDIATION'
            ]);

            autoTable(doc, {
                startY: nextY + 8,
                head: [['Exam Title', 'Total Samples', 'Observed Avg', 'Evaluation']],
                body: examRows,
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] }, // Slate-900
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    3: { halign: 'center' }
                }
            });

            // Footer branding
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(148, 163, 184);
                doc.text(`Doc Ref: QF-ANL-${new Date().getTime().toString().slice(-6)}`, 14, 285);
                doc.text(`Page ${i} of ${pageCount}`, 170, 285);
            }

            doc.save(`QuizFlow_Intelligence_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error("CRITICAL PDF EXPORT ERROR:", err);
            alert("Report generation failed. Please check data sync.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Aggregating Global Exam Intelligence...</p>
            </div>
        );
    }

    const { summary, examDistribution, engagement } = data;

    const stats = [
        { label: 'Completion Rate', value: `${summary.completionRate}%`, status: 'Active', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Average Score', value: `${summary.avgScore}%`, status: 'Performance', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Participated', value: summary.activeUsers, status: 'Unique Users', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Completed Tests', value: summary.examsTaken, status: 'Total Attempts', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const distributionData = {
        labels: examDistribution.map(e => e.title),
        datasets: [
            {
                label: 'Average Score (%)',
                data: examDistribution.map(e => Math.round(e.avg_score || 0)),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderRadius: 12,
                borderSkipped: false,
            }
        ]
    };

    const engagementData = {
        labels: engagement.length > 0 ? engagement.map(e => e.day).reverse() : ['No Data'],
        datasets: [
            {
                label: 'Exams Completed',
                data: engagement.length > 0 ? engagement.map(e => e.count).reverse() : [0],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 3,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { weight: 'bold' } } }
        }
    };

    return (
        <div className="space-y-8 animate-slide-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Advanced Analytics</h1>
                    <p className="text-slate-500 font-medium italic">Deep-dive assessment metrics and student performance intelligence.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Calendar className="w-5 h-5" />
                        Real-time Data
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="bg-slate-900 border-2 border-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Export Performance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((s, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:-translate-y-2 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                                {s.status}
                            </div>
                        </div>
                        <h3 className="text-slate-500 font-black text-xs uppercase tracking-wider">{s.label}</h3>
                        <p className="text-4xl font-black text-slate-800 mt-2 tracking-tighter">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">Score Distribution</h3>
                            <p className="text-sm font-bold text-slate-400">Average performance across all exams</p>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="h-72">
                        <Bar data={distributionData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">Student Engagement</h3>
                            <p className="text-sm font-bold text-slate-400">Total exams completed over time</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="h-72">
                        <Line data={engagementData} options={chartOptions} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">Top Performing Exams</h3>
                        <p className="text-sm font-bold text-slate-400">Ranking based on student success rates</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Title</th>
                                <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attempts</th>
                                <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Score</th>
                                <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {examDistribution.map((exam, idx) => (
                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 font-black text-slate-800">{exam.title}</td>
                                    <td className="py-5">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                                            {exam.count} Students
                                        </span>
                                    </td>
                                    <td className="py-5 text-slate-600 font-bold">{Math.round(exam.avg_score || 0)}%</td>
                                    <td className="py-5">
                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${Math.round(exam.avg_score || 0) > 70 ? 'bg-green-500' : 'bg-orange-400'}`}
                                                style={{ width: `${exam.avg_score || 0}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
