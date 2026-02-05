import React from 'react';
import { Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentList = ({ appointments }) => {
   return (
      <div className="space-y-4">
         {appointments.map((apt) => (
            <div
               key={apt.id}
               className="flex items-start p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow group"
            >
               <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-light text-brand-deep flex flex-col items-center justify-center font-bold">
                  <span className="text-xs uppercase">{format(new Date(apt.date), 'MMM')}</span>
                  <span className="text-lg">{format(new Date(apt.date), 'dd')}</span>
               </div>

               <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{apt.patientName}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                     <Clock size={12} className="mr-1" />
                     {apt.time}
                     <span className="mx-2">•</span>
                     <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${apt.type === 'Check-up' ? 'bg-blue-50 text-blue-600' :
                        apt.type === 'Emergency' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                        {apt.type}
                     </span>
                  </div>
               </div>

               <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={16} />
               </button>
            </div>
         ))}

         {appointments.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
               No upcoming appointments
            </div>
         )}
      </div>
   );
};

export default AppointmentList;
