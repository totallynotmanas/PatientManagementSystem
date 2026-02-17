import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

import Login from './pages/login.jsx';
import CreateAccount from './pages/createAccount.jsx';
import TwoFactorAuth from './pages/TwoFactorAuth.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import DashboardLayout from './layouts/DashboardLayout.jsx';
import DoctorDashboard from './pages/doctor/Dashboard.jsx';
import PatientDetail from './pages/doctor/PatientDetail.jsx';
import Patients from './pages/doctor/Patients.jsx';
import DoctorAppointments from './pages/doctor/Appointments.jsx';

import DoctorMessages from './pages/doctor/Messages.jsx';
import DoctorLabResults from './pages/doctor/LabResults.jsx';
import DoctorPrescriptions from './pages/doctor/Prescriptions.jsx';
import DoctorReports from './pages/doctor/Reports.jsx';
import PatientDashboard from './pages/patient/Dashboard.jsx';
import PatientAppointments from './pages/patient/Appointments.jsx';
import PatientLabResults from './pages/patient/LabResults.jsx';
import PatientMedicalHistory from './pages/patient/MedicalHistory.jsx';
import PatientMedications from './pages/patient/Medications.jsx';
import PatientPrescriptions from './pages/patient/Prescriptions.jsx';
import NurseDashboard from './pages/nurse/Dashboard.jsx';
import NurseVitals from './pages/nurse/Vitals.jsx';
import LabDashboard from './pages/lab/Dashboard.jsx';
import LabOrders from './pages/lab/Orders.jsx';
import LabOrderDetail from './pages/lab/OrderDetail.jsx';
import UploadResults from './pages/lab/UploadResults.jsx';
import LabHistory from './pages/lab/History.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';

function App() {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.full_name || user?.email || 'User';
  const roleMap = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    ADMIN: 'admin',
    LAB_TECH: 'lab',
  };

  const RoleGuard = ({ expectedRole, children }) => {
    const userRole = (user?.role || '').toLowerCase();
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (userRole !== expectedRole) {
      const routeRole = roleMap[(user?.role || 'PATIENT').toUpperCase()] || 'patient';
      return <Navigate to={`/dashboard/${routeRole}`} replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreateAccount />} />
        <Route path="/verify-2fa" element={<TwoFactorAuth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Doctor Dashboard */}
        <Route path="/dashboard/doctor/*" element={
          <RoleGuard expectedRole="doctor">
            <DashboardLayout role="doctor" userName={displayName} />
          </RoleGuard>
        }>

          <Route path="" element={<DoctorDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patient/:id" element={<PatientDetail />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="messages" element={<DoctorMessages />} />
          <Route path="labs" element={<DoctorLabResults />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="reports" element={<DoctorReports />} />
        </Route>

        {/* Patient Dashboard */}
        <Route path="/dashboard/patient/*" element={
          <RoleGuard expectedRole="patient">
            <DashboardLayout role="patient" userName={displayName} />
          </RoleGuard>
        }>
          <Route path="" element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="labs" element={<PatientLabResults />} />
          <Route path="history" element={<PatientMedicalHistory />} />
          <Route path="medications" element={<PatientMedications />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
        </Route>

        {/* Nurse Dashboard */}
        <Route path="/dashboard/nurse/*" element={
          <RoleGuard expectedRole="nurse">
            <DashboardLayout role="nurse" userName={displayName} />
          </RoleGuard>
        }>
          <Route path="" element={<NurseDashboard />} />
          <Route path="vitals" element={<NurseVitals />} />
        </Route>

        {/* Lab Dashboard */}
        <Route path="/dashboard/lab/*" element={
          <RoleGuard expectedRole="lab">
            <DashboardLayout role="lab" userName={displayName} />
          </RoleGuard>
        }>
          <Route path="" element={<LabDashboard />} />
          <Route path="orders" element={<LabOrders />} />
          <Route path="orders/:id" element={<LabOrderDetail />} />
          <Route path="upload" element={<UploadResults />} />
          <Route path="history" element={<LabHistory />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/dashboard/admin/*" element={
          <RoleGuard expectedRole="admin">
            <DashboardLayout role="admin" userName={displayName} />
          </RoleGuard>
        }>
          <Route path="" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
