import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  HelpCircle,
  X,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const { toggleTheme, isDark } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const adminEmail = "kartikey.pandey@radora.tech";

  const handleCopyAdminEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedEmail(true);
    addToast('Admin email copied to clipboard!', 'info', 2000);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const hubLogoUrl = "https://res.cloudinary.com/dcilrqmox/image/upload/v1788804756/ChatGPT_Image_Sep_7_2026_11_37_40_PM_r3gs2x.png";
  const companyLogoUrl = "https://res.cloudinary.com/dcilrqmox/image/upload/v1785686879/radora_office_-_Copy_sigbnd.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your work email or username and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await login(identifier.trim(), password);
      addToast(`Welcome back, ${loggedUser.name}!`, 'success', 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden selection:bg-radora-500/20 selection:text-radora-600">
      
      {/* Background Decorative Ambient Meshes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-radora-600/15 to-indigo-600/10 dark:from-radora-600/20 dark:to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-600/10 to-radora-500/10 dark:from-purple-600/15 dark:to-radora-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-indigo-600/10 to-emerald-500/10 dark:from-indigo-600/15 dark:to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between z-20">
        {/* Brand Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-radora-600/20 border border-radora-500/30 bg-slate-950 flex items-center justify-center">
            <img src={hubLogoUrl} alt="Radora Hub" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enterprise Portal
          </span>
        </div>

        {/* Theme Toggle */}
        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              if (isDark) {
                toggleTheme();
                addToast('Light Mode Active ☀️', 'info', 1000);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
              !isDark
                ? 'bg-white text-amber-600 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Light Mode"
          >
            <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline text-[11px]">Light</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isDark) {
                toggleTheme();
                addToast('Dark Mode Active 🌙', 'info', 1000);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
              isDark
                ? 'bg-slate-800 text-radora-400 shadow-sm font-bold scale-[1.02] border border-slate-700/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Dark Mode"
          >
            <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-radora-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline text-[11px]">Dark</span>
          </button>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8 z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl shadow-radora-600/25 border border-radora-500/30 bg-slate-950 p-1 mb-4 hover:scale-105 transition-transform duration-200">
            <img
              src={hubLogoUrl}
              alt="Radora Hub Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            RADORA <span className="text-radora-500">HUB</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Enterprise Project Architecture & Verification Suite
          </p>
        </div>

        {/* Main Sign-In Card */}
        <div className="bg-white/95 dark:bg-[#0e1628]/95 p-7 sm:p-9 shadow-2xl shadow-slate-900/10 dark:shadow-black/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/90 backdrop-blur-xl transition-all">
          
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your corporate credentials to access projects and checklists.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="name@company.com or username"
                  required
                  autoFocus
                  autoComplete="username"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 focus:ring-2 focus:ring-radora-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-[11px] font-semibold text-radora-600 dark:text-radora-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter your account password"
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 focus:ring-2 focus:ring-radora-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-radora-600 focus:ring-radora-500 dark:bg-slate-950 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Remember this device
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Need help?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-radora-600/30 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-radora-600 via-indigo-600 to-purple-600 hover:from-radora-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-radora-500 disabled:opacity-50 transition-all transform active:scale-[0.99] hover:scale-[1.01]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Authenticating Workspace...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Radora Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enterprise Security Highlights */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-radora-500 shrink-0" />
              <span>Role-Based Governance</span>
            </div>
          </div>

        </div>

      </div>

      {/* Production Footer Branding */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-20 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          
          <div className="text-center sm:text-left">
            <span>Radora Hub &copy; {new Date().getFullYear()} — Enterprise Project & Checklist Orchestration</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-500 dark:text-slate-400">Developed by</span>
            <a
              href="https://www.radora.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group transition-all"
              title="Visit Radora Tech (www.radora.tech)"
            >
              <img
                src={companyLogoUrl}
                alt="Radora Company"
                className="h-7 w-auto object-contain rounded transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-radora-600 dark:text-radora-400 group-hover:text-radora-500 dark:group-hover:text-radora-300 underline underline-offset-2 transition-colors">
                www.radora.tech
              </span>
            </a>
          </div>

        </div>
      </footer>

      {/* Access Help / Password Reset Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-radora-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Password Recovery & Access
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Radora Hub maintains strict corporate security. Member account credentials and password resets are managed directly by your <strong>Project Architect Admin</strong>.
              </p>

              {/* Admin Contact Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-radora-500/10 border border-radora-500/20 text-radora-600 dark:text-radora-400 flex items-center justify-center font-bold text-xs">
                      KP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        Kartikey Pandey
                      </div>
                      <div className="text-[10px] text-radora-600 dark:text-radora-400 font-medium">
                        Project Architect Admin
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Administrator
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${adminEmail}?subject=Radora%20Hub%20Password%20Reset%20Request`}
                      className="font-mono text-xs text-radora-600 dark:text-radora-400 hover:underline truncate font-semibold"
                      title="Send email to Chief Architect Admin"
                    >
                      {adminEmail}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAdminEmail}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    title="Copy administrator email"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                Please contact the administrator with your registered username to receive a temporary access key or password reset link.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`mailto:${adminEmail}?subject=Radora%20Hub%20Password%20Reset%20Request`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-radora-600 dark:text-radora-400 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Administrator</span>
              </a>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-radora-600 hover:bg-radora-500 shadow-md shadow-radora-600/20 transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
