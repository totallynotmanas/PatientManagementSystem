import React from 'react';
import { X, Calendar, Clock, MapPin, User, FileText, Activity, Phone, Mail } from 'lucide-react';
import Button from './common/Button';
import Badge from './common/Badge';

const AppointmentSidePanel = ({ appointment, onClose, onAction }) => {
   if (!appointment) return null;

   return (
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-100 flex flex-col">
         {/* Header */}
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Appointment Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
               <X size={20} />
            </button>
         </div>

         {/* Content - Scrollable */}
         <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Patient Card */}
            <div className="flex items-start space-x-4">
               <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand-deep font-bold text-xl border border-brand-medium/20">
                  {appointment.patientName.split(' ').map(n => n[0]).join('')}
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-900">{appointment.patientName}</h2>
                  <div className="text-sm text-gray-500 mb-2">ID: {appointment.patientId}</div>
                  <Badge type={appointment.status === 'Confirmed' ? 'green' : appointment.status === 'Pending' ? 'yellow' : 'red'}>
                     {appointment.status}
                  </Badge>
               </div>
            </div>

            {/* Appointment Info */}
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Session Info</h4>

               <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="font-medium">{appointment.date}</span>
               </div>

               <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="font-medium">{appointment.time} ({appointment.duration} min)</span>
               </div>

               <div className="flex items-center text-gray-700">
                  <Activity className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="font-medium">{appointment.type}</span>
               </div>

               <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="font-medium">{appointment.room || 'Not assigned'}</span>
               </div>
               <div className="flex items-center text-gray-700">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="font-medium">{appointment.doctorName}</span>
               </div>
            </div>

            {/* Contact (Mock Data) */}
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Patient Contact</h4>
               <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3" />
                  <span className="text-sm">555-0123</span>
               </div>
               <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-3" />
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">patient@example.com</span>
               </div>
            </div>

            {/* Patient History / Notes */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
               <div className="flex items-center mb-2">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 className="font-bold text-blue-800 text-sm">Last Visit Note</h4>
               </div>
               <p className="text-sm text-blue-900/80 leading-relaxed">
                  Patient reported mild improvement in symptoms. Prescribed dosage was adjusted. Scheduled for follow-up in 2 weeks.
               </p>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
            <Button className="w-full justify-center" onClick={() => onAction('start')}>Start Consultation</Button>
            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" className="justify-center bg-white" onClick={() => onAction('reschedule')}>Reschedule</Button>
               <Button variant="danger" className="justify-center bg-white border-red-200 text-red-600 hover:bg-red-50" onClick={() => onAction('cancel')}>Cancel</Button>
            </div>
         </div>
      </div>
   );
};

export default AppointmentSidePanel;
