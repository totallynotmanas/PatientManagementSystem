import React, { useState, useEffect, useRef } from 'react';
import { format, startOfDay, isSameDay, parse, differenceInMinutes, setHours, setMinutes } from 'date-fns';
import MiniCalendar from './MiniCalendar';

const SchedulerView = ({ appointments, onAppointmentClick, selectedDate, onDateChange }) => {
   // Time Constants
   const START_HOUR = 7; // 7 AM
   const END_HOUR = 21; // 9 PM
   const PIXELS_PER_MINUTE = 2;
   const SLOT_HEIGHT = 30 * PIXELS_PER_MINUTE; // 30 min slots

   // Scroll to 8 AM on load
   const scrollRef = useRef(null);
   useEffect(() => {
      if (scrollRef.current) {
         // Calculate scroll position to show 8 AM based on constants
         scrollRef.current.scrollTop = (8 - START_HOUR) * 60 * PIXELS_PER_MINUTE;
      }
   }, []);

   // Current Time Indicator Logic
   const [currentTime, setCurrentTime] = useState(new Date());
   useEffect(() => {
      const interval = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
      return () => clearInterval(interval);
   }, []);

   // Generate Time Slots
   const timeSlots = [];
   for (let i = START_HOUR; i < END_HOUR; i++) {
      timeSlots.push(setMinutes(setHours(new Date(), i), 0));
      timeSlots.push(setMinutes(setHours(new Date(), i), 30));
   }

   // Filter appointments for selected day
   const dayAppointments = appointments.filter(appt => isSameDay(parse(appt.date, 'yyyy-MM-dd', new Date()), selectedDate));

   // Calculate Position
   const getAppointmentStyle = (appt) => {
      const startTime = parse(appt.time, 'hh:mm aa', new Date()); // e.g., '09:00 AM'
      const startMinutes = differenceInMinutes(startTime, startOfDay(startTime)); // Minutes from midnight

      // Adjust for scheduler start time (7 AM = 420 mins)
      const displayStartMinutes = startMinutes - (START_HOUR * 60);

      const top = displayStartMinutes * PIXELS_PER_MINUTE;
      const height = appt.duration * PIXELS_PER_MINUTE;

      // Basic conflict handling width (naive)
      // Ideally we check overlaps and divide width
      return {
         top: `${Math.max(0, top)}px`,
         height: `${height}px`,
         position: 'absolute',
         width: '95%',
         right: 0
      };
   };

   const getCurrentTimeTop = () => {
      const mins = differenceInMinutes(currentTime, startOfDay(currentTime)) - (START_HOUR * 60);
      return mins * PIXELS_PER_MINUTE;
   };

   // Check if current time is within view range
   const isCurrentTimeVisible = () => {
      const currentHour = currentTime.getHours();
      return currentHour >= START_HOUR && currentHour < END_HOUR && isSameDay(currentTime, selectedDate);
   };

   const getTypeColorRaw = (type) => {
      if (type.toLowerCase().includes('follow')) return '#22c55e'; // green-500
      if (type.toLowerCase().includes('urgent') || type.toLowerCase().includes('emergency')) return '#ef4444'; // red-500
      return '#3b82f6'; // blue-500
   };

   return (
      <div className="flex h-[calc(100vh-200px)] flex-col md:flex-row gap-6">
         {/* Sidebar with Mini Calendar */}
         <div className="w-full md:w-64 space-y-6 flex-shrink-0">
            <MiniCalendar appointments={appointments} />

            {/* Legend/Filters (Static Mock) */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-soft">
               <h3 className="font-bold text-gray-800 text-sm mb-3">Filters</h3>
               <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                     <input type="checkbox" defaultChecked className="rounded text-brand-medium focus:ring-brand-medium" />
                     <span>All Providers</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                     <input type="checkbox" defaultChecked className="rounded text-brand-medium focus:ring-brand-medium" />
                     <span>Confirmed</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                     <input type="checkbox" defaultChecked className="rounded text-brand-medium focus:ring-brand-medium" />
                     <span>Pending</span>
                  </label>
               </div>
            </div>
         </div>

         {/* Main Scheduler Area */}
         <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-soft flex flex-col overflow-hidden relative">
            {/* Header - Day Column */}
            <div className="h-12 border-b border-gray-200 flex items-center pl-16 bg-gray-50/50">
               <div className="font-semibold text-gray-700">
                  {format(selectedDate, 'EEEE, MMMM do')}
               </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto relative" ref={scrollRef}>
               <div className="relative min-h-[1680px]" style={{ height: (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE }}>

                  {/* Time Grid Lines */}
                  {timeSlots.map((time, index) => (
                     <div key={index} className="flex absolute w-full" style={{ top: index * SLOT_HEIGHT, height: SLOT_HEIGHT }}>
                        {/* Time Label */}
                        <div className="w-16 text-right pr-3 text-xs text-gray-400 -mt-2.5 font-medium select-none">
                           {format(time, 'hh:mm aa')}
                        </div>
                        {/* Divider Line */}
                        <div className={`flex-1 border-t ${index % 2 === 0 ? 'border-gray-200' : 'border-gray-100 border-dashed'}`}></div>
                     </div>
                  ))}

                  {/* Current Time Indicator */}
                  {isCurrentTimeVisible() && (
                     <div
                        className="absolute w-full flex items-center z-10 pointer-events-none"
                        style={{ top: getCurrentTimeTop() }}
                     >
                        <div className="w-16 text-right pr-2 text-xs font-bold text-red-500">
                           {format(currentTime, 'hh:mm')}
                        </div>
                        <div className="flex-1 h-px bg-red-500 relative">
                           <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                     </div>
                  )}

                  {/* Appointment Blocks */}
                  <div className="absolute left-16 right-0 h-full">
                     {dayAppointments.map(appt => {
                        const borderColor = getTypeColorRaw(appt.type);
                        return (
                           <div
                              key={appt.id}
                              onClick={() => onAppointmentClick(appt)}
                              style={{
                                 ...getAppointmentStyle(appt),
                                 borderLeft: `4px solid ${borderColor}`
                              }}
                              className="bg-white rounded hover:shadow-md border border-gray-200 border-l-4 p-2 text-xs transition-shadow cursor-pointer group overflow-hidden hover:z-20"
                           >
                              <div className="font-bold text-gray-800 truncate leading-tight">
                                 {appt.patientName}
                              </div>
                              <div className="text-gray-500 truncate mt-0.5">
                                 {appt.time} - {appt.type}
                              </div>
                              {appt.room && (
                                 <div className="text-gray-400 font-medium truncate mt-1 text-[10px] flex items-center">
                                    {appt.room}
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>

               </div>
            </div>
         </div>
      </div>
   );
};

export default SchedulerView;
