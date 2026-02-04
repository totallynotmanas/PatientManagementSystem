import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/login.jsx';
import CreateAccount from './pages/createAccount.jsx';

import DashboardLayout from './layouts/DashboardLayout.jsx';
import DoctorDashboard from './pages/doctor/Dashboard.jsx';
import PatientDetail from './pages/doctor/PatientDetail.jsx';
import Patients from './pages/doctor/Patients.jsx';
import Appointments from './pages/doctor/Appointments.jsx';
import Profile from './pages/doctor/Profile.jsx';
import ParentDashboard from './pages/parent/Dashboard.jsx';
import NurseDashboard from './pages/nurse/Dashboard.jsx';
import LabDashboard from './pages/lab/Dashboard.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<CreateAccount />} />

        {/* Dashboards */}
        <Route path="/dashboard/doctor/*" element={<DashboardLayout role="doctor" userName="Dr. Smith" />}>
          <Route path="" element={<DoctorDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patient/:id" element={<PatientDetail />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/dashboard/parent/*" element={<DashboardLayout role="parent" userName="John Doe" />}>
          <Route path="" element={<ParentDashboard />} />
        </Route>

        <Route path="/dashboard/nurse/*" element={<DashboardLayout role="nurse" userName="Nurse Joy" />}>
          <Route path="" element={<NurseDashboard />} />
        </Route>

        <Route path="/dashboard/lab/*" element={<DashboardLayout role="lab" userName="Tech Mike" />}>
          <Route path="" element={<LabDashboard />} />
        </Route>

        <Route path="/dashboard/admin/*" element={<DashboardLayout role="admin" userName="Admin User" />}>
          <Route path="" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;