import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';
import { mockAppointments } from '../../mocks/appointments';

const PatientAppointments = () => {
   const patientId = 'P001';
   const [appointments, setAppointments] = useState(
      mockAppointments.filter(a => a.patientId === patientId)
   );
   const [activeTab, setActiveTab] = useState('upcoming');
   const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

   // Form State
   const [requestForm, setRequestForm] = useState({
      doctor: '',
      date: '',
      reason: '',
      timePreference: 'Morning'
   });

   const filteredAppointments = appointments.filter(a => {
      const isPast = ['Completed', 'Cancelled'].includes(a.status);
      return activeTab === 'upcoming' ? !isPast : isPast;
   });

   const handleRequestSubmit = (e) => {
      e.preventDefault();
      alert('Appointment request sent successfully! Our team will confirm shortly.');
      setIsRequestModalOpen(false);
      setRequestForm({ doctor: '', date: '', reason: '', timePreference: 'Morning' });
   };

   const handleCancel = (id) => {
      if (window.confirm('Are you sure you want to cancel this appointment?')) {
         setAppointments(appointments.map(a =>
            a.id === id ? { ...a, status: 'Cancelled' } : a
         ));
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
            <Button onClick={() => setIsRequestModalOpen(true)}>
               <Plus className="w-4 h-4 mr-2" /> Request New
            </Button>
         </div>

         {/* Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               {['upcoming', 'history'].map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                                ${activeTab === tab
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                  >
                     {tab}
                  </button>
               ))}
            </nav>
         </div>

         {/* List */}
         <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
               filteredAppointments.map(appt => (
                  <Card key={appt.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition">
                     <div className="flex items-start space-x-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-600 text-center min-w-[80px]">
                           <p className="text-xs font-bold uppercase tracking-wider">{appt.date.split('-')[1]}</p>
                           {/* Naive date parsing for demo */}
                           <p className="text-xl font-bold">{appt.date.split('-')[2]}</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-800 text-lg">{appt.type}</h4>
                           <div className="flex flex-col space-y-1 mt-1 text-sm text-gray-500">
                              <div className="flex items-center">
                                 <Calendar className="w-4 h-4 mr-2" /> {appt.doctorName}
                              </div>
                              <div className="flex items-center">
                                 <Clock className="w-4 h-4 mr-2" /> {appt.time} ({appt.duration} mins)
                              </div>
                              <div className="flex items-center">
                                 <MapPin className="w-4 h-4 mr-2" /> {appt.room || 'Main Clinic'}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                        <Badge type={appt.status === 'Confirmed' ? 'green' : appt.status === 'Pending' ? 'yellow' : 'red'}>
                           {appt.status}
                        </Badge>
                        {activeTab === 'upcoming' && appt.status !== 'Cancelled' && (
                           <div className="flex space-x-2 pt-2">
                              <Button variant="outline" className="text-xs py-1" onClick={() => alert('Add to Calendar')}>Add to Cal</Button>
                              <Button variant="danger" className="text-xs py-1 bg-white border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleCancel(appt.id)}>Cancel</Button>
                           </div>
                        )}
                     </div>
                  </Card>
               ))
            ) : (
               <div className="p-12 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No {activeTab} appointments found.</p>
               </div>
            )}
         </div>

         {/* Request Modal */}
         <Modal
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            title="Request Appointment"
         >
            <form onSubmit={handleRequestSubmit} className="space-y-4">
               <Alert type="info" message="Our team will review your request and contact you to confirm the exact time." />

               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Preferred Doctor</label>
                  <select
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={requestForm.doctor}
                     onChange={e => setRequestForm({ ...requestForm, doctor: e.target.value })}
                     required
                  >
                     <option value="">Select a Doctor</option>
                     <option value="Dr. Smith">Dr. Smith</option>
                     <option value="Dr. Jones">Dr. Jones</option>
                  </select>
               </div>

               <Input
                  type="date"
                  label="Preferred Date"
                  value={requestForm.date}
                  onChange={e => setRequestForm({ ...requestForm, date: e.target.value })}
                  required
               />

               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Time Preference</label>
                  <select
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={requestForm.timePreference}
                     onChange={e => setRequestForm({ ...requestForm, timePreference: e.target.value })}
                  >
                     <option value="Morning">Morning (8am - 12pm)</option>
                     <option value="Afternoon">Afternoon (1pm - 5pm)</option>
                  </select>
               </div>

               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                  <textarea
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                     value={requestForm.reason}
                     onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                     placeholder="Briefly describe your symptoms..."
                     required
                  />
               </div>

               <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit Request</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
};

export default PatientAppointments;
