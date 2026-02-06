import React from 'react';
import { FileText, Download, Activity, Search } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { mockLabs } from '../../mocks/records';

const LabResults = () => {
   const handleDownload = (fileName) => {
      alert(`Downloading ${fileName}...`);
      // Real app would trigger file download
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Lab Results</h2>
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Search labs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
         </div>

         <div className="space-y-4">
            {mockLabs.map(lab => (
               <Card key={lab.id} className="p-5 flex flex-col md:flex-row justify-between items-center transition hover:shadow-md">
                  <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                     <div className={`p-3 rounded-full mr-4 ${lab.status === 'Normal' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Activity size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800 text-lg">{lab.name}</h3>
                        <p className="text-sm text-gray-500">Conducted on {lab.date}</p>
                     </div>
                  </div>

                  <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                     <div className="text-right mr-4">
                        <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Result</span>
                        <Badge type={lab.status === 'Normal' ? 'green' : 'red'}>{lab.status}</Badge>
                     </div>

                     <Button variant="outline" className="flex items-center" onClick={() => handleDownload(lab.file)}>
                        <Download className="w-4 h-4 mr-2" /> Download
                     </Button>
                  </div>
               </Card>
            ))}
         </div>

         <Card className="p-6 bg-blue-50 border-blue-100 mt-8">
            <h3 className="font-bold text-blue-900 mb-2">Understanding Your Results</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
               "Normal" means your results are within the standard range. If your result is "Abnormal" or "High/Low",
               your doctor has likely reviewed it. Please verify with your doctor if you have any concerns.
            </p>
         </Card>
      </div>
   );
};

export default LabResults;
