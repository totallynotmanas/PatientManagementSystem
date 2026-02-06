import React, { useState } from 'react';
import { Pill, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { mockPrescriptions } from '../../mocks/records';

const PatientPrescriptions = () => {
   const activeRx = mockPrescriptions.filter(p => p.active);
   const historyRx = mockPrescriptions.filter(p => !p.active);

   const handleRefill = (medName) => {
      alert(`Refill request sent for ${medName}. Your pharmacy will be notified.`);
   };

   return (
      <div className="space-y-8">
         <h2 className="text-2xl font-bold text-gray-800">My Medications</h2>

         {/* Active Medications */}
         <div className="space-y-4">
            <h3 className="font-bold text-gray-600 uppercase tracking-wider text-sm flex items-center">
               <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
               Current Prescriptions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {activeRx.map(rx => (
                  <Card key={rx.id} className="p-6 border-l-4 border-green-500 space-y-4 hover:shadow-lg transition relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Pill size={120} />
                     </div>

                     <div>
                        <h4 className="text-xl font-bold text-gray-800">{rx.name}</h4>
                        <p className="text-green-600 font-medium">{rx.dosage}</p>
                     </div>

                     <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Frequency:</span>
                           <span className="font-medium text-gray-800">{rx.frequency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Next Refill:</span>
                           <span className="font-medium text-gray-800">In 5 days</span>
                        </div>
                     </div>

                     <div className="pt-2">
                        <Button className="w-full justify-center" onClick={() => handleRefill(rx.name)}>
                           <RefreshCw className="w-4 h-4 mr-2" /> Request Refill
                        </Button>
                     </div>
                  </Card>
               ))}
               {activeRx.length === 0 && <p className="text-gray-500 italic">No active prescriptions.</p>}
            </div>
         </div>

         {/* History */}
         <div className="space-y-4 pt-6 text-opacity-80">
            <h3 className="font-bold text-gray-600 uppercase tracking-wider text-sm flex items-center">
               <Clock className="w-4 h-4 mr-2 text-gray-400" />
               Past Medications
            </h3>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
               {historyRx.map((rx, idx) => (
                  <div key={rx.id} className={`p-4 flex justify-between items-center ${idx !== historyRx.length - 1 ? 'border-b border-gray-100' : ''}`}>
                     <div>
                        <h4 className="font-bold text-gray-700">{rx.name}</h4>
                        <p className="text-sm text-gray-500">{rx.dosage} • {rx.date}</p>
                     </div>
                     <Badge type="gray">Discontinued</Badge>
                  </div>
               ))}
               {historyRx.length === 0 && <div className="p-6 text-center text-gray-400">No history found.</div>}
            </div>
         </div>
      </div>
   );
};

export default PatientPrescriptions;
