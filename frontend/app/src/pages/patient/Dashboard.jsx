import React from 'react';
import { Activity, Calendar, FileText, Pill, AlertCircle, ArrowRight, Clock, MapPin, Stethoscope, Thermometer, Heart, Wind, Scale, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { mockAppointments } from '../../mocks/appointments';
import { mockPrescriptions, mockLabs, mockDiagnoses, mockVitalsHistory } from '../../mocks/records';
import { getPatientById } from '../../mocks/patients';

const PatientDashboard = () => {
   const navigate = useNavigate();
   const patientId = 'P001';
   const patient = getPatientById(patientId);

   if (!patient) return <div className="p-8 text-center text-gray-500">Loading patient data...</div>;

   // --- Data Preparation ---
   const upcomingAppointments = mockAppointments
      .filter(a => a.patientId === patientId && a.status !== 'Completed' && a.status !== 'Cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3); // Top 2-3

   const pendingLabs = mockLabs.filter(l => l.status === 'Pending' || l.type === 'Pending');

   const activeMedications = mockPrescriptions.filter(p => p.active);

   const recentDiagnoses = mockDiagnoses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

   const latestVitals = mockVitalsHistory[0] || {};
   const previousVitals = mockVitalsHistory[1] || {};

   // Helper for trend arrows
   const renderTrend = (current, previous, label) => {
      if (!current || !previous) return null;
      if (current > previous) return <span className="text-red-500 text-xs ml-1">↑</span>; // Simplistic logic: up is bad for BP/HR ideally contextual
      if (current < previous) return <span className="text-green-500 text-xs ml-1">↓</span>;
      return <span className="text-gray-400 text-xs ml-1">-</span>;
   };

   return (
      <div className="space-y-6 max-w-7xl mx-auto">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
            <div>
               <h2 className="text-3xl font-bold text-gray-900">Welcome back, {patient.name.split(' ')[0]}</h2>
               <p className="text-gray-500 mt-1">Here is your daily health summary.</p>
            </div>
            <div className="text-right hidden md:block">
               <p className="text-sm font-medium text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
         </div>

         {/* 1. Pending Lab Results Notification */}
         {pendingLabs.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm flex items-start justify-between">
               <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                  <div>
                     <h3 className="font-bold text-orange-800">Pending Lab Results ({pendingLabs.length})</h3>
                     <ul className="mt-1 space-y-1">
                        {pendingLabs.map(lab => (
                           <li key={lab.id} className="text-sm text-orange-700">
                              • <span className="font-medium">{lab.name}</span> - Expected by {lab.expectedDate}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
               <Button variant="outline" className="text-xs bg-white text-orange-600 border-orange-200 hover:bg-orange-100" onClick={() => navigate('/dashboard/patient/labs')}>
                  View Details
               </Button>
            </div>
         )}

         {/* 2. Latest Vital Signs */}
         <section>
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800 text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-brand-medium" />
                  Latest Vitals
                  <span className="text-xs font-normal text-gray-400 ml-2">Recorded on {latestVitals.date}</span>
               </h3>
               <Button variant="link" className="text-sm p-0 h-auto" onClick={() => alert('View Vitals History')}>See Trends</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {/* BP */}
               <Card className="p-3 text-center hover:shadow-md transition border-t-4 border-blue-500">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Blood Pressure</p>
                  <p className="text-lg font-bold text-gray-800 mt-1 flex justify-center items-center">
                     {latestVitals.bp}
                     {/* Note: renderTrend logic for string BP needs specific parsing, skipping arrow for now or just mocked */}
                  </p>
                  <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-2 inline-block">Normal</span>
               </Card>
               {/* HR */}
               <Card className="p-3 text-center hover:shadow-md transition border-t-4 border-red-500">
                  <div className="flex justify-center mb-1 text-red-100"><Heart size={16} className="text-red-500" /></div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Heart Rate</p>
                  <p className="text-lg font-bold text-gray-800 flex justify-center items-center">
                     {latestVitals.hr} <span className="text-xs font-normal ml-1">bpm</span>
                     {renderTrend(latestVitals.hr, previousVitals.hr)}
                  </p>
               </Card>
               {/* SpO2 */}
               <Card className="p-3 text-center hover:shadow-md transition border-t-4 border-cyan-500">
                  <div className="flex justify-center mb-1"><Wind size={16} className="text-cyan-500" /></div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">SpO2</p>
                  <p className="text-lg font-bold text-gray-800 flex justify-center items-center">
                     {latestVitals.spo2}%
                     {renderTrend(latestVitals.spo2, previousVitals.spo2)}
                  </p>
               </Card>
               {/* Resp */}
               <Card className="p-3 text-center hover:shadow-md transition border-t-4 border-indigo-500">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Resp. Rate</p>
                  <p className="text-lg font-bold text-gray-800 flex justify-center items-center">
                     {latestVitals.resp} <span className="text-xs font-normal">/min</span>
                     {renderTrend(latestVitals.resp, previousVitals.resp)}
                  </p>
               </Card>
               {/* Temp */}
               <Card className="p-3 text-center hover:shadow-md transition border-t-4 border-orange-500">
                  <div className="flex justify-center mb-1"><Thermometer size={16} className="text-orange-500" /></div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Temp</p>
                  <p className="text-lg font-bold text-gray-800 flex justify-center items-center">
                     {latestVitals.temp}°F
                     {renderTrend(latestVitals.temp, previousVitals.temp)}
                  </p>
               </Card>
               {/* Weight */}
               <Card className="p-3 text-center hover:shadow-md transition border-t-4 border-green-500">
                  <div className="flex justify-center mb-1"><Scale size={16} className="text-green-500" /></div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weight</p>
                  <p className="text-lg font-bold text-gray-800 flex justify-center items-center">
                     {latestVitals.weight} <span className="text-xs font-normal">kg</span>
                     {renderTrend(latestVitals.weight, previousVitals.weight)}
                  </p>
               </Card>
            </div>
         </section>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">

               {/* 3. Upcoming Appointments */}
               <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="font-bold text-gray-800 flex items-center text-lg">
                        <Calendar className="w-5 h-5 mr-2 text-brand-medium" />
                        Upcoming Appointments
                     </h3>
                     <Button variant="outline" className="text-xs h-8" onClick={() => navigate('/dashboard/patient/appointments')}>View All</Button>
                  </div>
                  <div className="divide-y divide-gray-100">
                     {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(appt => (
                           <div key={appt.id} className="p-5 hover:bg-gray-50 transition group">
                              <div className="flex flex-col md:flex-row justify-between md:items-center">
                                 <div className="flex items-start space-x-4 mb-4 md:mb-0">
                                    <div className="bg-blue-100 text-blue-700 w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-inner">
                                       <span className="text-xs font-bold uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                                       <span className="text-xl font-bold">{new Date(appt.date).getDate()}</span>
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-gray-900 text-lg">{appt.doctorName}</h4>
                                       <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                                          <span className="flex items-center"><Clock size={14} className="mr-1" /> {appt.time}</span>
                                          <span className="flex items-center"><MapPin size={14} className="mr-1" /> {appt.room || 'Clinic 1'}</span>
                                       </div>
                                       <p className="text-sm text-brand-medium font-medium mt-1">{appt.type}</p>
                                    </div>
                                 </div>
                                 {/* Actions */}
                                 <div className="flex items-center space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" className="text-xs py-2">Reschedule</Button>
                                    <Button variant="outline" className="text-xs py-2 text-red-500 hover:bg-red-50 border-red-200">Cancel</Button>
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-10 text-center">
                           <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Calendar className="w-8 h-8 text-gray-400" />
                           </div>
                           <h4 className="font-bold text-gray-700 mb-2">No Upcoming Appointments</h4>
                           <p className="text-gray-500 text-sm mb-4">You have no appointments scheduled for the next 30 days.</p>
                           <Button onClick={() => navigate('/dashboard/patient/appointments')}>Schedule Now</Button>
                        </div>
                     )}
                  </div>
               </Card>

               {/* 4. Recent Diagnoses */}
               <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="font-bold text-gray-800 flex items-center text-lg">
                        <Stethoscope className="w-5 h-5 mr-2 text-brand-medium" />
                        Recent Diagnoses
                     </h3>
                     <Button variant="link" className="text-xs" onClick={() => navigate('/dashboard/patient/history')}>Full History</Button>
                  </div>
                  <div className="p-5">
                     <div className="space-y-4">
                        {recentDiagnoses.map((dx, idx) => (
                           <div key={dx.id} className="relative pl-6 pb-4 border-l border-gray-200 last:border-0 last:pb-0">
                              <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-brand-medium rounded-full border-2 border-white"></div>
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h4 className="font-bold text-gray-800">{dx.name}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Diagnosed on {dx.date} by {dx.doctor}</p>
                                 </div>
                                 <Badge type={dx.severity === 'High' ? 'red' : dx.severity === 'Moderate' ? 'yellow' : 'green'}>
                                    {dx.severity}
                                 </Badge>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </Card>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8">

               {/* 5. Active Medications */}
               <Card className="p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <Pill size={150} />
                  </div>

                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-800 text-lg flex items-center">
                        <Pill className="w-5 h-5 mr-2 text-brand-medium" />
                        Active Meds
                     </h3>
                     <ArrowRight className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500" onClick={() => navigate('/dashboard/patient/prescriptions')} />
                  </div>

                  <div className="space-y-4 relative z-10">
                     {activeMedications.map(rx => (
                        <div key={rx.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h4 className="font-bold text-gray-800">{rx.name}</h4>
                                 <p className="text-sm text-brand-medium font-medium">{rx.dosage}</p>
                              </div>
                              {rx.refills <= 1 && (
                                 <div className="text-red-500" title="Low Refills">
                                    <AlertCircle size={16} />
                                 </div>
                              )}
                           </div>

                           <div className="text-xs text-gray-500 space-y-1 mb-3">
                              <p>Frequency: {rx.frequency}</p>
                              <p>Prescriber: {rx.prescribedBy}</p>
                              <p className={`${rx.refills === 0 ? 'text-red-500 font-bold' : ''}`}>Refills: {rx.refills}</p>
                           </div>

                           <Button className="w-full text-xs py-2 bg-brand-light text-brand-deep hover:bg-brand-medium hover:text-white border-transparent">
                              Request Refill
                           </Button>
                        </div>
                     ))}
                     {activeMedications.length === 0 && <p className="text-gray-500 italic">No active medications.</p>}
                  </div>
                  <Button variant="outline" className="w-full mt-4 text-sm" onClick={() => navigate('/dashboard/patient/prescriptions')}>View All Medications</Button>
               </Card>

               {/* Quick Links Card */}
               <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                  <p className="text-blue-100 text-sm mb-6">Quickly access common actions.</p>
                  <div className="space-y-3">
                     <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none justify-start">
                        <FileText className="w-4 h-4 mr-2" /> View Reports
                     </Button>
                     <Button className="w-full bg-blue-500 text-white border-blue-400 hover:bg-blue-400 justify-start">
                        <Activity className="w-4 h-4 mr-2" /> Symptom Checker
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
};

export default PatientDashboard;
