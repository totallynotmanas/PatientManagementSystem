import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, ArrowRight, Activity, Bell, Search, Pill } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

import AppointmentList from '../../components/AppointmentList';
import MiniCalendar from '../../components/MiniCalendar';
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Doctor Dashboard</h2>
                    <p className="text-gray-500 mt-1">Welcome back, Dr. Smith. Here's your daily overview.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50">View Schedule</Button>
                    <Button onClick={() => alert('Open Rx Modal')} className="bg-brand-medium hover:bg-brand-deep shadow-md shadow-brand-medium/20">+ New Prescription</Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-shadow duration-300 flex items-center justify-between group">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-brand-medium transition-colors">{mockPatients.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-brand-medium group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                </Card>
                <Card className="p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-shadow duration-300 flex items-center justify-between group">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Appointments</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-brand-medium transition-colors">{todaysAppointments.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                    </div>
                </Card>
                <Card className="p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-shadow duration-300 flex items-center justify-between group">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Pending Labs</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-brand-medium transition-colors">5</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                    </div>
                </Card>
                <Card className="p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-shadow duration-300 flex items-center justify-between group">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Active Rx</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-brand-medium transition-colors">12</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <Pill className="w-6 h-6" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts & Lists) */}
                <div className="lg:col-span-2 space-y-8">


                    {/* Patient List */}
                    <Card className="overflow-hidden border border-gray-100 shadow-soft">
                        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-white gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Recent Patients</h3>

                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-medium"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            </div>
                        </div>

                        {filteredPatients.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Age/Gender</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredPatients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand-deep font-bold border border-brand-medium/10">
                                                            {patient.avatar}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-deep transition-colors">{patient.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {patient.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{patient.age} yrs</div>
                                                    <div className="text-xs text-gray-500">{patient.gender}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{patient.condition}</span>
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
                                                        className="text-brand-medium hover:text-brand-deep flex items-center justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <div className="p-12 text-center">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No patients found</h3>
                                <p className="text-gray-500">Try adjusting your search terms.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column (Side Panel) */}
                <div className="space-y-8">
                    {/* Mini Calendar */}
                    <MiniCalendar appointments={mockAppointments} />

                    {/* Upcoming Appointments */}
                    <Card className="p-6 border border-gray-100 shadow-soft h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Upcoming List</h3>
                            <button className="text-sm text-brand-medium hover:underline font-medium bg-transparent border-none cursor-pointer">See all</button>
                        </div>
                        <AppointmentList appointments={mockAppointments.slice(0, 5)} />
                    </Card>

                    {/* Notifications/Alerts (Simplified) */}
                    <div className="bg-brand-deep rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                        <div className="relative z-10">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="ml-3 font-bold text-lg">Daily Briefing</h3>
                            </div>
                            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                                You have 3 high-priority lab results to review and 2 patient inquiries pending from yesterday.
                            </p>
                            <Button className="w-full bg-white text-brand-deep hover:bg-blue-50 border-none">
                                Review Items
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
