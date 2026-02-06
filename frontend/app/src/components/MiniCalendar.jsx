import React, { useState } from 'react';
import {
   format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
   eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
   isToday, parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

const MiniCalendar = ({ appointments }) => {
   const [currentMonth, setCurrentMonth] = useState(new Date());
   const [selectedDate, setSelectedDate] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
   const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

   const monthStart = startOfMonth(currentMonth);
   const monthEnd = endOfMonth(monthStart);
   const startDate = startOfWeek(monthStart);
   const endDate = endOfWeek(monthEnd);

   const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
   });

   const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

   const getDailyAppointments = (date) => {
      return appointments.filter(appt => isSameDay(parseISO(appt.date), date));
   };

   const onDateClick = (day) => {
      setSelectedDate(day);
      setIsModalOpen(true);
   };

   const getTypeColorClass = (type) => {
      if (type.toLowerCase().includes('follow')) return 'bg-green-50 border-green-100 text-green-700';
      if (type.toLowerCase().includes('urgent') || type.toLowerCase().includes('emergency')) return 'bg-orange-50 border-orange-100 text-orange-800';
      return 'bg-blue-50 border-blue-100 text-blue-700';
   };

   return (
      <>
         <div className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden p-4">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-gray-800">
                  {format(currentMonth, 'MMMM yyyy')}
               </h2>
               <div className="flex space-x-1">
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500">
                     <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500">
                     <ChevronRight size={16} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
               {weekDays.map(day => (
                  <div key={day} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                     {day}
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
               {calendarDays.map((day, dayIdx) => {
                  const dayAppointments = getDailyAppointments(day);
                  const isSelectedMonth = isSameMonth(day, monthStart);
                  const isCurrentDay = isToday(day);
                  const hasAppointments = dayAppointments.length > 0;

                  return (
                     <div
                        key={day.toString()}
                        onClick={() => onDateClick(day)}
                        className={`
                        h-8 w-8 flex flex-col items-center justify-center rounded-full text-xs cursor-pointer transition-colors
                        ${!isSelectedMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                        ${isCurrentDay ? 'bg-brand-medium text-white font-bold hover:bg-brand-deep' : ''}
                    `}
                     >
                        <span>{format(day, 'd')}</span>
                        {hasAppointments && !isCurrentDay && isSelectedMonth && (
                           <span className="w-1 h-1 rounded-full bg-brand-medium mt-0.5"></span>
                        )}
                        {hasAppointments && isCurrentDay && (
                           <span className="w-1 h-1 rounded-full bg-white mt-0.5"></span>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Details Modal */}
         {isModalOpen && selectedDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                     <h3 className="font-bold text-base text-gray-800 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-brand-medium" />
                        {format(selectedDate, 'MMM do, yyyy')}
                     </h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="p-4 max-h-[50vh] overflow-y-auto">
                     {getDailyAppointments(selectedDate).length > 0 ? (
                        <div className="space-y-3">
                           {getDailyAppointments(selectedDate).map(appt => (
                              <div key={appt.id} className={`p-3 rounded-lg border ${getTypeColorClass(appt.type)}`}>
                                 <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-sm">{appt.patientName}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{appt.status}</span>
                                 </div>
                                 <div className="text-xs space-y-1 opacity-90">
                                    <div className="flex items-center">
                                       <Clock size={12} className="mr-1.5" />
                                       {appt.time}
                                    </div>
                                    <div className="flex items-center">
                                       <AlertCircle size={12} className="mr-1.5" />
                                       {appt.type}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-6 text-gray-400">
                           <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                           <p className="text-sm">No appointments.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default MiniCalendar;
