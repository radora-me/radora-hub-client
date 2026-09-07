import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  Search,
  Building,
  Briefcase,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  User
} from 'lucide-react';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { CreateMemberModal } from '../components/CreateMemberModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const TeamManagementPage = ({ onViewProfile }) => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [passwordModalMember, setPasswordModalMember] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authApi.getUsers();
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      addToast('Failed to load team members: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const targetId = targetUser._id || targetUser.id;
    const currentId = currentUser._id || currentUser.id;

    if (String(targetId) === String(currentId)) {
      addToast('You cannot delete your own admin account.', 'warning');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete team member "${targetUser.name}" (@${targetUser.username})?`)) {
      try {
        await authApi.deleteUser(targetId);
        addToast(`Team member "${targetUser.name}" deleted.`, 'success');
        setUsers(prev => prev.filter(u => (u._id || u.id) !== targetId));
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete member', 'error');
      }
    }
  };

  const handleMemberCreated = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const handlePasswordChanged = (updatedUser) => {
    // Optionally trigger toast or refresh
  };

  // Filtered list
  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' || u.role === roleFilter;

    const matchesDept =
      departmentFilter === 'ALL' || u.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  const architectCount = users.filter(u => u.role === 'architect_admin').length;
  const memberCount = users.filter(u => u.role === 'team_member').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-radora-500/10 text-radora-600 dark:text-radora-400 border border-radora-500/20 uppercase tracking-wider">
              Governance & Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Team & Member Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provision team member profiles, assign architectural roles, and manage member credentials.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-radora-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Team Member</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Personnel</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</span>
            <span className="text-[11px] text-slate-500">accounts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Architect Admins</span>
            <div className="p-2 rounded-xl bg-radora-500/10 text-radora-600 dark:text-radora-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-radora-600 dark:text-radora-400">{architectCount}</span>
            <span className="text-[11px] text-slate-500">full access</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Team Members</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{memberCount}</span>
            <span className="text-[11px] text-slate-500">collaborators</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Departments</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{departments.length}</span>
            <span className="text-[11px] text-slate-500">active teams</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, @username, email, or title..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('architect_admin')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'architect_admin'
                  ? 'bg-white dark:bg-slate-800 text-radora-600 dark:text-radora-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              👑 Admins
            </button>
            <button
              onClick={() => setRoleFilter('team_member')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'team_member'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              👤 Members
            </button>
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchUsers}
            title="Refresh Roster"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Roster Cards / Table */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-radora-500 mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading team member roster...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No team members match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try resetting your search query or role filter, or add a new team member.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((member) => {
            const memberId = member._id || member.id;
            const isSelf = String(memberId) === String(currentUser?._id || currentUser?.id);
            const isAdminRole = member.role === 'architect_admin';

            return (
              <div
                key={memberId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-radora-500/40 dark:hover:border-radora-500/40 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Role badge + isSelf */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {isAdminRole ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-radora-500/10 text-radora-600 dark:text-radora-400 border border-radora-500/25">
                          👑 Project Architect Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          👤 Team Member
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          You
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-3.5 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-radora-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>

                    {/* Name & Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-radora-600 dark:text-radora-400 font-mono">
                        @{member.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                        {member.title || 'Team Member'}
                      </p>
                    </div>
                  </div>

                  {/* Details Pills */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 mb-4">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.department || 'General Engineering'}</span>
                    </div>

                    {member.lastLoginAt && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Last login: {new Date(member.lastLoginAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    ID: <span className="font-mono text-[10px]">{memberId.substring(0, 14)}...</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View Profile Button */}
                    {onViewProfile && (
                      <button
                        onClick={() => onViewProfile(member)}
                        title={`View and edit profile for ${member.name}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-radora-500/10 hover:bg-radora-500/20 text-radora-600 dark:text-radora-400 border border-radora-500/25 text-xs font-bold transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    )}

                    {/* Change Password Button */}
                    <button
                      onClick={() => setPasswordModalMember(member)}
                      title={`Change password for ${member.name}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-bold transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </button>

                    {/* Delete button (cannot delete self) */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(member)}
                        title={`Delete ${member.name}`}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Member Modal */}
      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMemberCreated={handleMemberCreated}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={!!passwordModalMember}
        onClose={() => setPasswordModalMember(null)}
        member={passwordModalMember}
        onPasswordChanged={handlePasswordChanged}
      />

    </div>
  );
};
