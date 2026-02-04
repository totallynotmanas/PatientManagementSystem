import React, { useState } from 'react';
import { User, Calendar, FileText, Download, Edit2, Phone, Mail } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

import ConsentManager from './components/ConsentManager';
import { mockPatients } from '../../mocks/patients';
import { mockAppointments } from '../../mocks/appointments';
import { mockMedicalHistory } from '../../mocks/records';

const ParentDashboard = () => {
    // Simulate logged in parent
    const parentName = 'John Kim';
    const myChildren = mockPatients.filter(p => p.parent === parentName);
    const myAppointments = mockAppointments.filter(a => myChildren.some(c => c.id === a.patientId));

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);

    // Mock download handler
    const handleDownloadHistory = (childName) => {
        alert(`Downloading medical history PDF for ${childName}...`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Family Portal</h2>
                    <p className="text-gray-500">Managing health for {myChildren.length} children</p>
                </div>
                <Button onClick={() => alert('Book Appointment Flow')}>+ Book Appointment</Button>
            </div>

            <Alert
                type="info"
                title="Flu Season Reminder"
                message="Vaccination appointments are now available. Please schedule for your family soon."
                className="mb-4"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Children & Appointments */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Children Profiles */}
                    <h3 className="font-bold text-gray-700 text-lg">My Children</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myChildren.map(child => (
                            <Card key={child.id} className="p-5 flex flex-col justify-between hover:shadow-xl transition relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4">
                                            {child.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-800">{child.name}</h4>
                                            <p className="text-sm text-gray-500">{child.age} years • {child.gender}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-blue-500" onClick={() => { setSelectedChild(child); setIsEditProfileOpen(true); }}>
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Condition:</span> {child.condition}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Status:</span>
                                        <Badge type={child.status === 'Needs Review' ? 'red' : 'green'}>{child.status}</Badge>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t flex space-x-2">
                                    <Button variant="outline" className="flex-1 text-xs py-2" onClick={() => handleDownloadHistory(child.name)}>
                                        <Download className="w-3 h-3 mr-1" /> History
                                    </Button>
                                    <Button variant="secondary" className="flex-1 text-xs py-2">
                                        <FileText className="w-3 h-3 mr-1" /> Vitals
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {/* Add Child Placeholder */}
                        <button className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition h-full min-h-[180px]">
                            <User className="w-8 h-8 mb-2" />
                            <span className="font-medium">+ Add Child Profile</span>
                        </button>
                    </div>

                    {/* Upcoming Appointments */}
                    <h3 className="font-bold text-gray-700 text-lg pt-4">Upcoming Appointments</h3>
                    <Card>
                        {myAppointments.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {myAppointments.map(appt => (
                                    <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-4">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{appt.type} with {appt.doctorName}</h4>
                                                <p className="text-sm text-gray-500">For {appt.patientName} • {appt.date} at {appt.time}</p>
                                            </div>
                                        </div>
                                        <Badge type="blue">{appt.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">No upcoming appointments scheduled.</div>
                        )}
                    </Card>

                    {/* Recent Medical History (Mocked List) */}
                    <h3 className="font-bold text-gray-700 text-lg pt-4">Recent Medical History</h3>
                    <Card>
                        <div className="divide-y divide-gray-100">
                            {mockMedicalHistory.map(record => (
                                <div key={record.id} className="p-4">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-800">{record.type}</span>
                                        <span className="text-sm text-gray-500">{record.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{record.note}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

                {/* Right Column: Sidebar Widgets */}
                <div className="space-y-6">
                    <ConsentManager />

                    <Card className="p-6 bg-blue-600 text-white">
                        <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                        <p className="text-blue-100 text-sm mb-4">Contact our support team for assistance with your account or medical records.</p>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2" /> 1-800-MEDICARE
                            </div>
                            <div className="flex items-center text-sm">
                                <Mail className="w-4 h-4 mr-2" /> support@medicare.com
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Child Modal */}
            <Modal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                title="Edit Child Profile"
            >
                {selectedChild && (
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsEditProfileOpen(false); }}>
                        <Input label="Full Name" defaultValue={selectedChild.name} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Age" defaultValue={selectedChild.age} />
                            <Input label="Blood Type" placeholder="e.g. O+" />
                        </div>
                        <Input label="Known Allergies" placeholder="Peanuts, Penicillin..." />
                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default ParentDashboard;
