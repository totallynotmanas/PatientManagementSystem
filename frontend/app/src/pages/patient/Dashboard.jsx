import React, { useState } from 'react';
import { Activity, Calendar, Pill, AlertCircle, Clock, Stethoscope, Scale, AlertTriangle, RefreshCw, CalendarClock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { mockAppointments } from '../../mocks/appointments';
import { mockPrescriptions, mockLabs, mockDiagnoses } from '../../mocks/records';
import { getPatientById } from '../../mocks/patients';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const patientId = user?.id || 1;

   // State with Mock Fallbacks
   const [patient, setPatient] = useState(getPatientById(patientId));
   const [appointments, setAppointments] = useState(mockAppointments);
   const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
   const [labs, setLabs] = useState(mockLabs);
   const [diagnoses, setDiagnoses] = useState(mockDiagnoses);

   // Fetch API Data
   React.useEffect(() => {
      const fetchData = async () => {
         try {
            const pData = await api.patients.getById(patientId);
            if (pData && pData.id) {
               pData.name = pData.firstName && pData.lastName ? `${pData.firstName} ${pData.lastName}` : pData.name;
               setPatient(pData);
            }
         } catch (e) { console.log('Using mock patient data'); }

         try {
            const aData = await api.appointments.getByPatient(patientId);
            if (Array.isArray(aData)) {
               const mappedAppts = aData.map(a => ({
                  id: a.appointmentId,
                  patientId: patientId,
                  doctorName: a.doctor?.fullName || 'Assigned Doctor',
                  date: a.appointmentDate ? a.appointmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
                  time: a.appointmentDate ? a.appointmentDate.split('T')[1].substring(0, 5) : '12:00',
                  type: a.reasonForVisit || 'General Visit',
                  status: a.status === 'SCHEDULED' ? 'Scheduled' : a.status === 'COMPLETED' ? 'Completed' : a.status === 'CANCELLED' ? 'Cancelled' : a.status
               }));
               setAppointments([...mappedAppts, ...mockAppointments]); // append mocks so dashboard doesn't look empty for demo if it fails
            }
         } catch (e) { console.log('Using mock appointment data'); }

         try {
            const rData = await api.prescriptions.getByPatient(patientId);
            if (Array.isArray(rData)) {
               const mappedPresc = rData.map(r => ({
                  id: r.prescriptionId,
                  name: r.medicationName,
                  active: r.status === 'ACTIVE',
                  dosage: r.dosage,
                  frequency: r.frequency,
                  refills: 0
               }));
               setPrescriptions([...mappedPresc, ...mockPrescriptions]);
            }
         } catch (e) { console.log('Using mock prescription data'); }

         try {
            const lData = await api.labResults.getByPatient(patientId);
            if (Array.isArray(lData)) {
               const mappedLabs = lData.map(l => ({
                  id: l.testId,
                  status: l.status === 'PENDING' ? 'Pending' : l.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
                  type: l.testName,
                  date: l.orderedAt
               }));
               setLabs([...mappedLabs, ...mockLabs]);
            }
         } catch (e) { console.log('Using mock lab data'); }

         try {
            const mData = await api.medicalRecords.getByPatient(patientId);
            if (Array.isArray(mData)) {
               const mappedDiag = mData.map(m => ({
                  id: m.recordId,
                  name: m.diagnosis,
                  date: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                  doctor: m.doctor?.fullName || 'Attending Physician',
                  severity: 'Moderate' // Default mapping
               }));
               setDiagnoses([...mappedDiag, ...mockDiagnoses]);
            }
         } catch (e) { console.log('Using mock diagnoses data'); }
      };

      fetchData();
   }, [patientId]);

   if (!patient) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading patient data...</div>;

   // --- Data Preparation ---
   const upcomingAppointments = appointments
      .filter(a => a.status !== 'Completed' && a.status !== 'Cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);

   const pendingLabs = labs.filter(l => l.status === 'Pending' || l.type === 'Pending');
   const activeMedications = prescriptions.filter(p => p.active);
   const recentDiagnoses = diagnoses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);



   return (
      <div className="space-y-4">
         {/* Header - Compact */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
               <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Patient Dashboard</h2>
               <p className="text-sm text-gray-500 dark:text-slate-400">Welcome back, {user?.fullName || user?.full_name || patient.name}</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/patient/appointments')}>
                  My Appointments
               </Button>
               <Button size="sm" onClick={() => navigate('/dashboard/patient/records')}>
                  View Records
               </Button>
            </div>
         </div>

         {/* Pending Labs Alert - High Visibility */}
         {pendingLabs.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm flex items-start sm:items-center gap-4 animate-fade-in">
               <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
               </div>
               <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">Action Required</h4>
                  <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">
                     You have <span className="font-bold text-orange-700 dark:text-orange-300">{pendingLabs.length} pending lab results</span> waiting for your review.
                  </p>
               </div>
               <Button className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md shadow-orange-500/20 font-semibold px-6 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95" onClick={() => navigate('/dashboard/patient/labs')}>
                  <span>Review Now</span>
                  <FileText className="w-4 h-4" />
               </Button>
            </div>
         )}



         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column (2/3) - Main Content */}
            <div className="lg:col-span-2 space-y-4">

               {/* Upcoming Appointments - Compact */}
               <Card className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                     <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        Upcoming Appointments
                     </h3>
                     <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium" onClick={() => navigate('/dashboard/patient/appointments')}>
                        View All
                     </button>
                  </div>

                  {upcomingAppointments.length > 0 ? (
                     <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                        {upcomingAppointments.map((appt) => (
                           <div key={appt.id} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="flex-shrink-0 w-10 text-center">
                                    <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">{new Date(appt.date).getDate()}</div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</div>
                                 </div>
                                 <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                                 <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{appt.doctorName}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                                       <span className="flex items-center gap-1"><Clock size={12} /> {appt.time}</span>
                                       <span>•</span>
                                       <span>{appt.type}</span>
                                    </div>
                                 </div>
                              </div>
                              <button className="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400" title="Reschedule">
                                 <CalendarClock className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-6 text-center">
                        <Calendar className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400">No upcoming appointments</p>
                        <Button size="sm" className="mt-3" onClick={() => navigate('/dashboard/patient/appointments')}>Schedule Now</Button>
                     </div>
                  )}
               </Card>

               {/* Recent Diagnoses - Compact list */}
               <Card className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                     <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        Recent Diagnoses
                     </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                     {recentDiagnoses.map((dx) => (
                        <div key={dx.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex justify-between items-center">
                           <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{dx.name}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">{dx.date} • {dx.doctor}</div>
                           </div>
                           <Badge size="sm" type={dx.severity === 'High' ? 'red' : dx.severity === 'Moderate' ? 'yellow' : 'green'}>
                              {dx.severity}
                           </Badge>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>

            {/* Right Column (1/3) - Sidebar */}
            <div className="space-y-4">
               {/* Active Meds - Compact */}
               <Card>
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                     <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        Active Meds
                     </h3>
                     <button className="text-xs text-blue-600 dark:text-blue-400 font-medium" onClick={() => navigate('/dashboard/patient/prescriptions')}>View All</button>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                     {activeMedications.map(rx => (
                        <div key={rx.id} className="group p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center justify-between">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                 <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{rx.name}</span>
                                    {rx.refills <= 1 && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                                 </div>
                                 <div className="text-xs text-gray-500 dark:text-slate-400">{rx.dosage} • {rx.frequency}</div>
                              </div>
                           </div>
                           <button className="w-7 h-7 rounded hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Request Refill">
                              <RefreshCw className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400" />
                           </button>
                        </div>
                     ))}
                     {activeMedications.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No active medications.</p>}
                  </div>
               </Card>

               {/* Quick Help - Compact */}
               {/* Patient Support - High Visibility */}
               <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 shadow-md">
                  <div className="p-5">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                           <Activity className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Need Help?</h3>
                           <p className="text-sm text-gray-500 dark:text-slate-400">24/7 Support Center</p>
                        </div>
                     </div>

                     <p className="text-sm text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
                        If you are experiencing symptoms or need urgent advice, contact your care team immediately.
                     </p>

                     <div className="space-y-3">
                        <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform transform active:scale-95">
                           <Stethoscope className="w-5 h-5" />
                           <span>Contact Doctor</span>
                        </button>
                        <button className="w-full py-3 px-4 bg-white dark:bg-slate-700 border-2 border-gray-100 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                           <Scale className="w-5 h-5 text-gray-400" />
                           <span>Symptom Checker</span>
                        </button>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
};

export default PatientDashboard;
