import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import PatientSearch from './components/PatientSearch';
import { mockPatients } from '../../mocks/patients';

const Patients = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Basic filtering
    const filteredPatients = mockPatients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Patients</h2>
                <Button>+ Add Patient</Button>
            </div>

            <PatientSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={() => { }}
            />

            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Patient Directory</h3>
                    <span className="text-sm text-gray-500">{filteredPatients.length} records</span>
                </div>

                {filteredPatients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {patient.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {patient.id}</div>
                                                    <div className="text-xs text-gray-400">{patient.age} yrs, {patient.gender}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{patient.email}</div>
                                            <div className="text-xs text-gray-500">{patient.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{patient.condition}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge type={patient.status === 'Needs Review' ? 'red' : 'green'}>
                                                {patient.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.lastVisit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full"
                                                onClick={() => navigate(`/dashboard/doctor/patient/${patient.id}`)}
                                            >
                                                Details <ArrowRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No patients found.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Patients;
