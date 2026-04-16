import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const user = await login(email, password);
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-green-100/50">
                {/* Left Side - Welcome */}
                <div className="md:w-1/2 bg-green-600 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 leading-tight">Welcome back to QuizFlow.</h1>
                        <p className="text-green-100 text-lg leading-relaxed">
                            Access your personalized dashboard, manage exams, and track your progress all in one place.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="flex -space-x-3 mb-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-green-600 bg-green-100 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-green-600 bg-green-500 flex items-center justify-center text-xs font-bold">
                                +2k
                            </div>
                        </div>
                        <p className="text-sm font-medium text-green-100">Joined by 2,000+ students this month</p>
                    </div>

                    {/* Background Ornaments */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-800">Login</h2>
                        <p className="text-slate-500 mt-2">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    className="input pl-11"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">Password</label>
                                <a href="#" className="text-sm font-bold text-green-600 hover:text-green-700">Forgot?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    className="input pl-11"
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
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In 
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account? {' '}
                            <Link to="/register" className="text-green-600 font-bold hover:underline">Create Account</Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Demo Access</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-600">Admin</p>
                                <p className="text-[10px] text-slate-500">admin@exam.com | Admin123!</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-600">Student</p>
                                <p className="text-[10px] text-slate-500">student@exam.com | Student123!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
