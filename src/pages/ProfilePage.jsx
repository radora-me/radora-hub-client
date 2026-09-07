import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  Mail,
  Building,
  Briefcase,
  Phone,
  User,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Edit3,
  Save,
  X,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Hash,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const ProfilePage = ({ userId, onBack, onSelectMember }) => {
  const { user: currentUser, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordModalMember, setPasswordModalMember] = useState(null);

  // Form fields for editing
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'team_member',
    department: '',
    title: '',
    phone: '',
    status: 'active',
    notes: '',
  });

  const activeTargetId = userId || currentUser?._id || currentUser?.id;

  useEffect(() => {
    loadProfileAndRoster();
  }, [activeTargetId]);

  const loadProfileAndRoster = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      setIsEditing(false);

      // Fetch all users for switcher & directory
      const rosterRes = await authApi.getUsers();
      if (rosterRes.data.success) {
        setAllUsers(rosterRes.data.users || []);
      }

      // Fetch target user profile
      const userRes = await authApi.getUserById(activeTargetId);
      if (userRes.data.success && userRes.data.user) {
        const u = userRes.data.user;
        setProfileUser(u);
        setFormData({
          name: u.name || '',
          username: u.username || '',
          email: u.email || '',
          role: u.role || 'team_member',
          department: u.department || 'General Engineering',
          title: u.title || 'Team Member',
          phone: u.phone || '',
          status: u.status || 'active',
          notes: u.notes || '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      addToast('Permission denied: Only Project Architect Admin can edit profiles.', 'error');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim()) {
      addToast('Name, username, and email are required.', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const res = await authApi.updateUser(activeTargetId, formData);
      if (res.data.success) {
        setProfileUser(res.data.user);
        setIsEditing(false);
        addToast(`Profile for ${res.data.user.name} successfully updated in MongoDB Atlas!`, 'success');

        // Update in roster list
        setAllUsers(prev => prev.map(u => 
          (u._id === activeTargetId || u.id === activeTargetId) ? res.data.user : u
        ));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileUser) {
      setFormData({
        name: profileUser.name || '',
        username: profileUser.username || '',
        email: profileUser.email || '',
        role: profileUser.role || 'team_member',
        department: profileUser.department || 'General Engineering',
        title: profileUser.title || 'Team Member',
        phone: profileUser.phone || '',
        status: profileUser.status || 'active',
        notes: profileUser.notes || '',
      });
    }
    setIsEditing(false);
  };

  const isSelf = String(activeTargetId) === String(currentUser?._id || currentUser?.id);
  const isProfileAdmin = profileUser?.role === 'architect_admin';

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-9 h-9 animate-spin mx-auto text-radora-500 mb-3" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Loading team member profile...
        </p>
      </div>
    );
  }

  if (errorMsg || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Profile Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          {errorMsg || 'The requested team member profile could not be located.'}
        </p>
        <button
          onClick={onBack || (() => window.history.back())}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-radora-600 hover:bg-radora-500 shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* ========================================================================= */}
      {/* Top Header & Navigation Bar */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-radora-500/30 transition-all"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-radora-500/10 text-radora-600 dark:text-radora-400 border border-radora-500/20 uppercase tracking-wider">
                Personnel Profile
              </span>
              {isSelf && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Your Account
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {profileUser.name}
            </h1>
          </div>
        </div>

        {/* Member Switcher Dropdown */}
        {allUsers.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">Switch Member:</span>
            <div className="relative">
              <select
                value={activeTargetId}
                onChange={(e) => onSelectMember && onSelectMember(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-radora-500/30 focus:outline-none focus:ring-1 focus:ring-radora-500 transition-all shadow-xs cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.name} ({u.role === 'architect_admin' ? '👑 Admin' : '👤 Member'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Governance Security Notice Banner */}
      {/* ========================================================================= */}
      {!isAdmin ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5 text-amber-900 dark:text-amber-300">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed flex-1">
            <span className="font-bold block text-sm mb-0.5">
              Strict Role Governance: Read-Only Access
            </span>
            <span>
              Under institutional security compliance, team member profiles, assigned roles, departments, and credentials are governed and edited exclusively by the <strong>Project Architect Admin</strong> (Kartikey Pandey).
            </span>
            <div className="mt-2 flex items-center gap-3">
              <a
                href="mailto:kartikey.pandey@radora.tech?subject=Radora%20Hub%20Profile%20Update%20Request"
                className="inline-flex items-center gap-1.5 font-bold text-[11px] text-radora-600 dark:text-radora-400 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Admin (kartikey.pandey@radora.tech)</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3 text-indigo-900 dark:text-indigo-300 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-medium">
              <strong>Chief Architect Admin Mode:</strong> You have full governance authority to modify this team member profile, reassign departments, or reset credentials.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            Atlas Cloud Synced
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Hero Identity Card */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-radora-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Key Identifiers */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-radora-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-md">
                  {profileUser.name ? profileUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Status Indicator Pip */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs ${
                  profileUser.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={`Status: ${profileUser.status}`}
              >
                {profileUser.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              </div>
            </div>

            {/* Names & Badges */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profileUser.name}
                </h2>

                {/* Role Badge */}
                {isProfileAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-radora-600/15 to-indigo-600/15 text-radora-600 dark:text-radora-400 border border-radora-500/30">
                    👑 Project Architect Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    👤 Team Member
                  </span>
                )}

                {/* Active Status Badge */}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  profileUser.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}>
                  {profileUser.status === 'active' ? '● Active' : '○ Inactive'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="text-radora-600 dark:text-radora-400 font-bold">
                  @{profileUser.username}
                </span>
                <span>•</span>
                <span>{profileUser.email}</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {profileUser.title || 'Technical Specialist'} &mdash;{' '}
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  {profileUser.department || 'Platform Architecture & Governance'}
                </span>
              </p>
            </div>
          </div>

          {/* Admin Editing & Credential Controls */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-radora-600 hover:bg-radora-500 text-white shadow-md shadow-radora-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPasswordModalMember(profileUser)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 transition-colors"
                    title="Change password for this member"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Password</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* Profile Details & Form Section */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveProfile}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Identity & Professional Details Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-radora-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    General Identity & Contact
                  </h3>
                </div>
                {isEditing && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Editing Mode
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      {profileUser.name}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Username Handle {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                        required
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-mono text-radora-600 dark:text-radora-400 font-semibold">
                      @{profileUser.username}
                    </div>
                  )}
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Official Work Email {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                    />
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      <span className="truncate">{profileUser.email}</span>
                      <a
                        href={`mailto:${profileUser.email}`}
                        className="text-radora-600 dark:text-radora-400 hover:underline shrink-0 text-xs flex items-center gap-1 ml-2"
                        title="Send email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      {profileUser.phone || 'Not specified'}
                    </div>
                  )}
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Designation / Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Architecture Specialist"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      {profileUser.title || 'Technical Member'}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Department Unit
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                    >
                      <option value="Platform Architecture & Governance">Platform Architecture & Governance</option>
                      <option value="Core ERP Services">Core ERP Services</option>
                      <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                      <option value="Quality Assurance & Auditing">Quality Assurance & Auditing</option>
                      <option value="Security & Compliance">Security & Compliance</option>
                      <option value="Institutional Support & Onboarding">Institutional Support & Onboarding</option>
                      <option value="General Engineering">General Engineering</option>
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      {profileUser.department || 'General Engineering'}
                    </div>
                  )}
                </div>

              </div>

              {/* Administrative Notes / Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Governance Notes & Architecture Scope
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add organizational notes, clearance level, or project focus areas..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {profileUser.notes || 'No specialized governance notes recorded for this profile.'}
                  </div>
                )}
              </div>

            </div>

            {/* Editing Action Bar */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Edits will immediately sync to MongoDB Atlas cluster.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save to Cloud</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Column 3: Security, Roles & Telemetry Sidebar */}
          <div className="space-y-6">
            
            {/* Role & Access Permissions */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Shield className="w-4 h-4 text-radora-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Access & Governance
                </h3>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform Role
                </label>
                {isEditing ? (
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                  >
                    <option value="architect_admin">👑 Project Architect Admin</option>
                    <option value="team_member">👤 Team Member</option>
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isProfileAdmin ? '👑 Project Architect Admin' : '👤 Team Member'}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  {isProfileAdmin 
                    ? 'Full authority over checklist modules, team accounts, and configurations.' 
                    : 'Authorized to execute checklist items and contribute in team channels.'}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="inactive">Inactive (Suspended)</option>
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${profileUser.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">
                      {profileUser.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Password Action */}
              {isAdmin && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalMember(profileUser)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Member Password</span>
                  </button>
                </div>
              )}

            </div>

            {/* Telemetry & Audit Logs */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-radora-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Audit Telemetry
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Member ID:</span>
                  <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">
                    {(profileUser._id || profileUser.id || '').substring(0, 16)}...
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Created:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : 'System Seed'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Last Login:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {profileUser.lastLoginAt ? new Date(profileUser.lastLoginAt).toLocaleString() : 'Never'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Provisioned By:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {profileUser.createdBy === 'system' ? 'Architect Admin' : profileUser.createdBy || 'Administrator'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </form>

      {/* ========================================================================= */}
      {/* Team Roster Quick Switcher Grid */}
      {/* ========================================================================= */}
      {allUsers.length > 1 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-radora-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Team Directory ({allUsers.length} members)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Click any member to view their profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allUsers.map((member) => {
              const mId = member._id || member.id;
              const isSelected = String(mId) === String(activeTargetId);

              return (
                <div
                  key={mId}
                  onClick={() => onSelectMember && onSelectMember(mId)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-radora-500/10 border-radora-500 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-radora-500/40 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-radora-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {member.name ? member.name.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        @{member.username} &bull; {member.role === 'architect_admin' ? '👑 Admin' : '👤 Member'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-radora-500 text-white shrink-0">
                      Viewing
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      <ChangePasswordModal
        isOpen={!!passwordModalMember}
        onClose={() => setPasswordModalMember(null)}
        member={passwordModalMember}
        onPasswordChanged={(updatedUser) => {
          if (updatedUser) setProfileUser(prev => ({ ...prev, ...updatedUser }));
        }}
      />

    </div>
  );
};
