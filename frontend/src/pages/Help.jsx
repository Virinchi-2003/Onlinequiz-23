import { HelpCircle, MessageCircle, FileText, Search, ExternalLink, Mail } from 'lucide-react';

const HelpCenter = () => {
    const faqs = [
        { q: 'How do I reset my password?', a: 'You can reset your password by clicking on the "Forgot Password" link on the login page.' },
        { q: 'Can I retake an exam?', a: 'Exam retakes depend on the policy set by the administrator for that specific exam.' },
        { q: 'How are coding questions evaluated?', a: 'Coding questions are evaluated using an automated test suit that checks for output correctness and logic.' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-green-600 rounded-[2rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black mb-6">How can we help?</h1>
                    <div className="relative mt-8">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search for articles, guides, or issues..."
                            className="w-full bg-white rounded-2xl py-5 pl-16 pr-8 text-slate-800 font-medium focus:outline-none shadow-2xl"
                        />
                    </div>
                </div>
                {/* Abstract Background */}
                <HelpCircle className="absolute -left-12 -bottom-12 w-64 h-64 text-white opacity-10" />
                <MessageCircle className="absolute -right-12 -top-12 w-48 h-48 text-white opacity-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card hover:border-green-100 transition-all text-center group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Documentation</h3>
                    <p className="text-slate-500 mt-2">Comprehensive guides and API references for developers.</p>
                    <button className="mt-6 text-blue-600 font-bold flex items-center gap-1 mx-auto hover:underline">
                        Explore Docs <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
                <div className="card hover:border-green-100 transition-all text-center group">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
                        <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Live Support</h3>
                    <p className="text-slate-500 mt-2">Chat with our dedicated support team in real-time.</p>
                    <button className="mt-6 text-green-600 font-bold flex items-center gap-1 mx-auto hover:underline">
                        Start Chatting <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
                <div className="card hover:border-green-100 transition-all text-center group">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Email Support</h3>
                    <p className="text-slate-500 mt-2">Get detailed responses within 24 hours via email.</p>
                    <button className="mt-6 text-purple-600 font-bold flex items-center gap-1 mx-auto hover:underline">
                        Send Ticket <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Frequently Asked Questions</h2>
                <div className="space-y-4 max-w-3xl">
                    {faqs.map((faq, i) => (
                        <div key={i} className="card">
                            <h4 className="font-bold text-slate-800">{faq.q}</h4>
                            <p className="text-slate-500 mt-2 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HelpCenter;
