import React, { useState } from 'react';
import { User, Mail, Lock, Stethoscope, Briefcase, FileText, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const ROLES = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
  { value: 'ADMIN', label: 'Administrator' },
];

export default function StaffAccountCreation() {
  const [role, setRole] = useState('DOCTOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setLicenseNumber('');
    setSpecialization('');
    setDepartment('');
    setRole('DOCTOR');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    if (role === 'DOCTOR' && !licenseNumber) {
      setError('License number is required for doctors.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        role,
        full_name: fullName,
        ...(role === 'DOCTOR' && { license_number: licenseNumber, specialization }),
        ...(( role === 'NURSE' || role === 'LAB_TECHNICIAN') && { department }),
      };

      await api.admin.createStaff(payload);
      setSuccess(`Staff account for ${fullName} (${email}) created successfully. A welcome email with login credentials has been sent to ${email}.`);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to create staff account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-admin-primary/10 rounded-lg">
          <UserPlus size={22} className="text-admin-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Staff Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Provision login credentials for a new staff member</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Role Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Staff Role <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    role === value
                      ? 'bg-admin-primary text-white border-admin-primary shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-admin-primary/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                placeholder="Dr. Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                placeholder="staff@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {role === 'DOCTOR' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">License Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                    placeholder="LIC-12345"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                    placeholder="Cardiology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {(role === 'NURSE' || role === 'LAB_TECHNICIAN') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Department / Unit</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                  placeholder="e.g. ICU, Pathology Lab"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                  placeholder="Min 12 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-admin-primary outline-none"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2FA notice for Doctor/Admin */}
          {(role === 'DOCTOR' || role === 'ADMIN') && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
              Two-Factor Authentication will be automatically enabled for this account.
            </p>
          )}

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-700">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-700">
              <CheckCircle size={14} />
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-admin-primary text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create Staff Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
