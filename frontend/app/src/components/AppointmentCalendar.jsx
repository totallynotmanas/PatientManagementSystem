import React, { useState } from 'react';
import {
   format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
   eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
   isToday, parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, User, AlertCircle, CheckCircle, Calendar as CalendarIcon, X } from 'lucide-react';
import Button from './common/Button';
import Badge from './common/Badge';

const AppointmentCalendar = ({ appointments }) => {
   const [currentMonth, setCurrentMonth] = useState(new Date());
   const [selectedDate, setSelectedDate] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Calendar Navigation
   const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
   const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
   const onDateClick = (day) => {
      setSelectedDate(day);
      setIsModalOpen(true);
   };

   // Calendar Grid Generation
   const monthStart = startOfMonth(currentMonth);
   const monthEnd = endOfMonth(monthStart);
   const startDate = startOfWeek(monthStart);
   const endDate = endOfWeek(monthEnd);

   const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
   });

   const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

   // Helper to get appointments for a day
   const getDailyAppointments = (date) => {
      return appointments.filter(appt => isSameDay(parseISO(appt.date), date));
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Confirmed': return 'bg-blue-500';
         case 'Follow-up': return 'bg-green-500'; // Assuming Type maps to color broadly
         case 'Pending': return 'bg-orange-500';
         case 'Urgent': return 'bg-red-500';
         default: return 'bg-blue-500';
      }
   };

   // Custom logic for requested color coding by Type instead of Status if needed, 
   // but prompt said "Blue for regular, Green for follow-ups, Orange for urgent"
   const getTypeColorClass = (type) => {
      if (type.toLowerCase().includes('follow')) return 'bg-green-100 text-green-700 border-green-200';
      if (type.toLowerCase().includes('urgent') || type.toLowerCase().includes('emergency')) return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-blue-100 text-blue-700 border-blue-200';
   };

   const getDotColor = (type) => {
      if (type.toLowerCase().includes('follow')) return 'bg-green-500';
      if (type.toLowerCase().includes('urgent') || type.toLowerCase().includes('emergency')) return 'bg-orange-500';
      return 'bg-blue-500';
   }


   return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         {/* Header */}
         <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
               <CalendarIcon className="w-5 h-5 mr-2 text-brand-medium" />
               {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
               <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600">
                  <ChevronLeft size={20} />
               </button>
               <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-sm font-medium text-brand-medium hover:bg-brand-light rounded-md transition">
                  Today
               </button>
               <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600">
                  <ChevronRight size={20} />
               </button>
            </div>
         </div>

         {/* Days Header */}
         <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {weekDays.map(day => (
               <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {day}
               </div>
            ))}
         </div>

         {/* Calendar Grid */}
         <div className="grid grid-cols-7 auto-rows-fr bg-white">
            {calendarDays.map((day, dayIdx) => {
               const dayAppointments = getDailyAppointments(day);
               const isSelectedMonth = isSameMonth(day, monthStart);
               const isCurrentDay = isToday(day);

               return (
                  <div
                     key={day.toString()}
                     onClick={() => onDateClick(day)}
                     className={`
                        min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-colors hover:bg-gray-50
                        ${!isSelectedMonth ? 'bg-gray-50/30 text-gray-400' : 'bg-white'}
                        ${isCurrentDay ? 'bg-blue-50/30' : ''}
                    `}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <span className={`
                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                            ${isCurrentDay ? 'bg-brand-medium text-white shadow-md' : 'text-gray-700'}
                        `}>
                           {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                           <span className="text-[10px] font-bold text-gray-500">{dayAppointments.length}</span>
                        )}
                     </div>

                     <div className="space-y-1 mt-1">
                        {dayAppointments.slice(0, 3).map((appt) => (
                           <div
                              key={appt.id}
                              className="flex items-center text-[10px] truncate px-1.5 py-0.5 rounded-sm border-l-2 bg-gray-50 border-gray-200"
                           >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getDotColor(appt.type)}`}></span>
                              <span className="truncate flex-1 font-medium text-gray-600">{appt.patientName}</span>
                           </div>
                        ))}
                        {dayAppointments.length > 3 && (
                           <div className="text-[10px] text-gray-400 pl-2">
                              + {dayAppointments.length - 3} more
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Details Modal */}
         {isModalOpen && selectedDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                     <h3 className="font-bold text-lg text-gray-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-brand-medium" />
                        {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                     </h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                     {getDailyAppointments(selectedDate).length > 0 ? (
                        <div className="space-y-3">
                           {getDailyAppointments(selectedDate).map(appt => (
                              <div key={appt.id} className={`p-3 rounded-lg border ${getTypeColorClass(appt.type)}`}>
                                 <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold">{appt.patientName}</div>
                                    <Badge type={appt.status === 'Confirmed' ? 'green' : 'yellow'}>{appt.status}</Badge>
                                 </div>
                                 <div className="text-sm space-y-1 opacity-90">
                                    <div className="flex items-center">
                                       <Clock size={14} className="mr-2" />
                                       {appt.time}
                                    </div>
                                    <div className="flex items-center">
                                       <User size={14} className="mr-2" />
                                       Patient ID: {appt.patientId}
                                    </div>
                                    <div className="flex items-center">
                                       <AlertCircle size={14} className="mr-2" />
                                       {appt.type}
                                    </div>
                                 </div>
                                 <div className="mt-3 pt-2 border-t border-black/5 flex justify-end">
                                    <Button variant="outline" className="text-xs py-1 h-auto bg-white/50 hover:bg-white">View Details</Button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-8 text-gray-400">
                           <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                           <p>No appointments scheduled for this day.</p>
                           <Button className="mt-4" onClick={() => alert('New Appointment')}>+ Add Appointment</Button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AppointmentCalendar;
