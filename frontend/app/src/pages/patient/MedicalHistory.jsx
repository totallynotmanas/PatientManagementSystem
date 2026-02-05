import React, { useState } from 'react';
import { FileText, Calendar, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { mockMedicalHistory } from '../../mocks/records';

const MedicalHistory = () => {
   const [filter, setFilter] = useState('All');

   const filters = ['All', 'Visit', 'Surgery', 'Immunization', 'Lab Work'];

   const filteredHistory = filter === 'All'
      ? mockMedicalHistory
      : mockMedicalHistory.filter(item => item.type === filter);

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold text-gray-800">Medical Timeline</h2>

         {/* Filter Bar */}
         <div className="flex space-x-2 overflow-x-auto pb-2">
            {filters.map(f => (
               <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                            px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                            ${filter === f
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                        `}
               >
                  {f}
               </button>
            ))}
         </div>

         {/* Timeline */}
         <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
               {filteredHistory.length > 0 ? (
                  filteredHistory.map((record) => (
                     <div key={record.id} className="relative pl-16">
                        {/* Timeline Dot */}
                        <div className="absolute left-3.5 top-5 w-5 h-5 rounded-full border-4 border-white bg-blue-500 shadow-sm z-10"></div>

                        <Card className="p-6 transition hover:shadow-lg">
                           <div className="flex flex-col md:flex-row justify-between md:items-center mb-3">
                              <div className="flex items-center space-x-3">
                                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    {record.type === 'Surgery' ? <FileText size={20} /> : <Calendar size={20} />}
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{record.type}</h3>
                                    <p className="text-sm text-gray-500">{record.date}</p>
                                 </div>
                              </div>
                              <div className="mt-2 md:mt-0">
                                 <Badge type="gray">Completed</Badge>
                              </div>
                           </div>

                           <div className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <p>{record.note}</p>
                           </div>

                           {record.doctor && (
                              <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500 flex items-center">
                                 <span className="font-medium mr-2">Provider:</span> {record.doctor}
                              </div>
                           )}
                        </Card>
                     </div>
                  ))
               ) : (
                  <div className="p-12 text-center text-gray-400">
                     <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
                     <p>No records found for this category.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default MedicalHistory;
