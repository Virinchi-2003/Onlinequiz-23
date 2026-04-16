import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Mail, Lock, User, ArrowRight, Loader2, ShieldPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await register({ name, email, password, role: 'STUDENT' });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-blue-100/50">
                {/* Left Side - Welcome */}
                <div className="md:w-1/2 bg-blue-600 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                            <ShieldPlus className="w-7 h-7" />
                        </div>
                        <h1 className="text-4xl font-black mb-4 leading-tight font-serif">Join the Future of Learning.</h1>
                        <p className="text-blue-100 text-lg leading-relaxed font-medium">
                            Create your free student account today and start your journey towards excellence.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                        <p className="text-sm font-bold italic">"QuizFlow helped me land my dream job by validating my skills with industry-standard exams."</p>
                        <div className="mt-4 flex items-center gap-3">
                            <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-white/20" alt="Testimonial" />
                            <div>
                                <p className="text-xs font-black">Sarah Jenkins</p>
                                <p className="text-[10px] text-blue-200">Fullstack Developer</p>
                            </div>
                        </div>
                    </div>

                    {/* Background Ornaments */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-800">Create Account</h2>
                        <p className="text-slate-500 mt-2 font-medium">Fill in the details to get started</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="input pl-11 shadow-sm"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    className="input pl-11 shadow-sm"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Secure Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    className="input pl-11 shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn bg-slate-900 text-white hover:bg-green-600 py-4 flex items-center justify-center gap-2 group shadow-xl shadow-slate-100"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create My Account 
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Already have an account? {' '}
                            <Link to="/login" className="text-blue-600 font-black hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlertCircle = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

export default Register;
