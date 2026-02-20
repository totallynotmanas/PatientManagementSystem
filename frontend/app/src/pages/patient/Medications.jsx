import React, { useState } from 'react';
import {
   Pill,
   Calendar,
   Download,
   AlertCircle,
   User,
   ChevronUp,
   Search,
   AlertTriangle,
   CheckCircle,
   RefreshCw,
   Info
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
   mockMedicationsData,
   mockDrugInteractions,
   mockMedicationStats
} from '../../mocks/medications';

const Medications = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('active');
   const [expandedMeds, setExpandedMeds] = useState({});
   const [showRefillModal, setShowRefillModal] = useState(false);
   const [selectedMed, setSelectedMed] = useState(null);

   const toggleExpand = (id) => {
      setExpandedMeds(prev => ({
         ...prev,
         [id]: !prev[id]
      }));
   };

   const handleRefillRequest = (medication) => {
      setSelectedMed(medication);
      setShowRefillModal(true);
   };

   const submitRefillRequest = () => {
      // TODO: Implement actual refill request
      alert(`Refill request submitted for ${selectedMed.name}`);
      setShowRefillModal(false);
      setSelectedMed(null);
   };

   const handleDownload = (medication) => {
      // TODO: Implement actual download
      alert(`Downloading prescription for ${medication.name}...`);
   };

   // Filter medications based on search
   const filteredMedications = (activeTab === 'active' ? mockMedicationsData.active : mockMedicationsData.history)
      .filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         med.prescribedBy.name.toLowerCase().includes(searchTerm.toLowerCase()));

   // Get medication type badge color
   const getFormBadge = (form) => {
      const colors = {
         'Tablet': 'bg-blue-100 text-blue-700',
         'Capsule': 'bg-green-100 text-green-700',
         'Liquid': 'bg-purple-100 text-purple-700',
         'Injection': 'bg-red-100 text-red-700'
      };
      return colors[form] || 'bg-gray-100 text-gray-700';
   };

   return (
      <div className="space-y-4">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
               <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">My Medications</h2>
               <p className="text-sm text-gray-500 dark:text-slate-400">Manage your prescriptions</p>
            </div>
            <Button variant="outline" size="sm" title="Download All Medications">
               <Download className="w-4 h-4" />
            </Button>
         </div>

         {/* Drug Interaction Warning */}
         {mockDrugInteractions.length > 0 && activeTab === 'active' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded-r-md">
               <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                     <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">Potential Drug Interaction</h3>
                     {mockDrugInteractions.map((interaction, idx) => (
                        <div key={idx} className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                           <span className="font-medium">{interaction.medication1} + {interaction.medication2}:</span> {interaction.description}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* Stats Cards - Compact */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 dark:text-slate-400">Active</p>
                     <p className="text-xl font-semibold text-gray-800 dark:text-slate-100">{mockMedicationStats.totalActive}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                     <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
               </div>
            </Card>

            <Card className="p-3">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 dark:text-slate-400">Need Refill</p>
                     <p className="text-xl font-semibold text-gray-800 dark:text-slate-100">{mockMedicationStats.needingRefill}</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-md flex items-center justify-center">
                     <RefreshCw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
               </div>
            </Card>

            <Card className="p-3">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 dark:text-slate-400">Expiring</p>
                     <p className="text-xl font-semibold text-gray-800 dark:text-slate-100">{mockMedicationStats.upcomingExpirations}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-center">
                     <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
               </div>
            </Card>

            <Card className="p-3">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 dark:text-slate-400">Adherence</p>
                     <p className="text-xl font-semibold text-gray-800 dark:text-slate-100">{mockMedicationStats.adherenceRate}%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-center">
                     <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
               </div>
            </Card>
         </div>

         {/* Search and Tabs - Compact */}
         <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
               <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
               <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
               />
            </div>
            <div className="flex gap-1">
               <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'active'
                     ? 'bg-blue-600 text-white'
                     : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                     }`}
               >
                  Active
               </button>
               <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'history'
                     ? 'bg-blue-600 text-white'
                     : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                     }`}
               >
                  History
               </button>
            </div>
         </div>

         {/* Medications Grid - Compact */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMedications.map((medication) => {
               const isExpanded = expandedMeds[medication.id];

               return (
                  <Card
                     key={medication.id}
                     className={`p-3 hover:border-gray-300 dark:hover:border-slate-600 ${medication.critical ? 'border-l-2 border-l-red-500' : ''
                        } ${medication.status === 'expiring-soon' ? 'border-l-2 border-l-orange-500' : ''}`}
                  >
                     {/* Medication Header - Compact */}
                     <div className="mb-2">
                        <div className="flex items-start justify-between mb-1">
                           <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{medication.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{medication.genericName}</p>
                           </div>
                           {medication.critical && (
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                           )}
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getFormBadge(medication.form)}`}>
                              {medication.form}
                           </span>
                           <span className="text-xs text-gray-700 dark:text-slate-200">{medication.strength}</span>
                        </div>
                     </div>

                     {/* Dosage Info - Compact */}
                     <div className="space-y-1 mb-2 text-xs text-gray-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                           <Pill className="w-3 h-3 text-gray-400" />
                           <span>{medication.dosage}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <User className="w-3 h-3 text-gray-400" />
                           <span>{medication.prescribedBy.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-3 h-3 text-gray-400" />
                           <span>Since {new Date(medication.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        </div>
                     </div>

                     {/* Status and Refills - Compact */}
                     {activeTab === 'active' && (
                        <div className="mb-2 p-2 bg-gray-50 dark:bg-slate-800/50 rounded text-xs">
                           <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-slate-400">Refills:</span>
                              <Badge size="sm" type={medication.refillsRemaining <= 1 ? 'yellow' : 'green'}>
                                 {medication.refillsRemaining}/{medication.totalRefills}
                              </Badge>
                           </div>
                           {medication.expiryWarning && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{medication.expiryWarning}</p>
                           )}
                        </div>
                     )}

                     {/* History Status - Compact */}
                     {activeTab === 'history' && (
                        <div className="mb-2">
                           <Badge size="sm" type={medication.status === 'completed' ? 'gray' : 'red'}>
                              {medication.status}
                           </Badge>
                           {medication.discontinuedReason && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Reason: {medication.discontinuedReason}</p>
                           )}
                        </div>
                     )}

                     {/* Purpose - Compact */}
                     <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Purpose:</span>
                        <span className="text-blue-800 dark:text-blue-300 ml-1">{medication.purpose}</span>
                     </div>

                     {/* Expanded Details - Compact */}
                     {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 space-y-2 text-xs">
                           <div>
                              <p className="font-medium text-gray-600 dark:text-slate-400">Instructions</p>
                              <p className="text-gray-700 dark:text-slate-200">{medication.instructions}</p>
                           </div>

                           {medication.sideEffects && medication.sideEffects.length > 0 && (
                              <div>
                                 <p className="font-medium text-gray-600 dark:text-slate-400">Side Effects</p>
                                 <div className="flex flex-wrap gap-1 mt-0.5">
                                    {medication.sideEffects.map((effect, idx) => (
                                       <span key={idx} className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded">
                                          {effect}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {medication.interactions && medication.interactions.length > 0 && (
                              <div>
                                 <p className="font-medium text-red-600 dark:text-red-400">Interactions</p>
                                 <div className="flex flex-wrap gap-1 mt-0.5">
                                    {medication.interactions.map((interaction, idx) => (
                                       <span key={idx} className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">
                                          {interaction}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {medication.warnings && medication.warnings.length > 0 && (
                              <div>
                                 <p className="font-medium text-orange-600 dark:text-orange-400">Warnings</p>
                                 <ul className="text-orange-700 dark:text-orange-400">
                                    {medication.warnings.map((warning, idx) => (
                                       <li key={idx}>• {warning}</li>
                                    ))}
                                 </ul>
                              </div>
                           )}

                           <div className="text-gray-500 dark:text-slate-400">
                              <p>Rx #: {medication.prescriptionNumber} | {medication.pharmacy}</p>
                           </div>
                        </div>
                     )}

                     {/* Action Buttons - Compact */}
                     <div className="mt-2 flex gap-1.5">
                        <button
                           onClick={() => toggleExpand(medication.id)}
                           className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 inline-flex items-center justify-center"
                        >
                           {isExpanded ? <><ChevronUp className="w-3 h-3 mr-1" />Less</> : <><Info className="w-3 h-3 mr-1" />Details</>}
                        </button>
                        {activeTab === 'active' && medication.canRefill && (
                           <button
                              onClick={() => handleRefillRequest(medication)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 inline-flex items-center justify-center whitespace-nowrap shrink-0"
                           >
                              <RefreshCw className="w-3 h-3 mr-1" />Refill
                           </button>
                        )}
                        <button
                           onClick={() => handleDownload(medication)}
                           className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded text-xs hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        >
                           <Download className="w-3 h-3" />
                        </button>
                     </div>
                  </Card>
               );
            })}
         </div>

         {/* Empty State - Compact */}
         {filteredMedications.length === 0 && (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
               <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
               <p className="text-sm">No medications found matching your search.</p>
            </div>
         )}

         {/* Refill Request Modal - Compact */}
         {showRefillModal && selectedMed && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <Card className="max-w-md w-full p-4">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-3">Request Refill</h3>

                  <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded text-sm">
                     <p className="font-medium text-gray-800 dark:text-slate-100">{selectedMed.name} {selectedMed.strength}</p>
                     <p className="text-gray-600 dark:text-slate-300 text-xs">{selectedMed.dosage}</p>
                     <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">
                        Refills: {selectedMed.refillsRemaining}/{selectedMed.totalRefills}
                     </p>
                  </div>

                  <div className="space-y-3 mb-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1">Pharmacy</label>
                        <select className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
                           <option>{selectedMed.pharmacy}</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1">Pickup Method</label>
                        <div className="flex gap-3 text-sm">
                           <label className="flex items-center">
                              <input type="radio" name="pickup" value="pickup" defaultChecked className="mr-1.5" />
                              Pickup
                           </label>
                           <label className="flex items-center">
                              <input type="radio" name="pickup" value="delivery" className="mr-1.5" />
                              Delivery
                           </label>
                        </div>
                     </div>

                     <label className="flex items-center text-xs text-gray-700 dark:text-slate-200">
                        <input type="checkbox" defaultChecked className="mr-1.5" />
                        I confirm this is for the same dosage
                     </label>
                  </div>

                  <div className="flex gap-2">
                     <Button onClick={submitRefillRequest} className="flex-1" size="sm">Submit</Button>
                     <Button variant="outline" onClick={() => setShowRefillModal(false)} className="flex-1" size="sm">Cancel</Button>
                  </div>
               </Card>
            </div>
         )}
      </div>
   );
};

export default Medications;
