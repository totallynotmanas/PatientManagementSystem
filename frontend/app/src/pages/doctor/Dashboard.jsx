import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, ArrowRight } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

import PatientSearch from './components/PatientSearch';
import NotificationsPanel from './components/NotificationsPanel';
import { mockPatients } from '../../mocks/patients';
import { mockAppointments } from '../../mocks/appointments';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Basic filtering mock logic
    const filteredPatients = mockPatients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const todaysAppointments = mockAppointments.filter(a => a.date === '2023-12-15');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
                    <p className="text-gray-500">Welcome back, Dr. Smith</p>
                </div>
                <Button onClick={() => alert('Open Rx Modal')}>+ New Prescription</Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{mockPatients.length}</p>
                    </div>
                    <Users className="text-blue-200 w-12 h-12" />
                </Card>
                <Card className="p-6 border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Appointments Today</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{todaysAppointments.length}</p>
                    </div>
                    <FileText className="text-green-200 w-12 h-12" />
                </Card>
                {/* Notifications Mockup - fitting into grid */}
                <NotificationsPanel />
            </div>

            {/* Search */}
            <PatientSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={() => { }}
            />

            {/* Patient List */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Recent Patients</h3>
                    <span className="text-sm text-gray-500">{filteredPatients.length} found</span>
                </div>

                {filteredPatients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{patient.age} yrs</div>
                                            <div className="text-sm text-gray-500">{patient.gender}</div>
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
                                                View <ArrowRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No patients found matching your search.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DoctorDashboard;
