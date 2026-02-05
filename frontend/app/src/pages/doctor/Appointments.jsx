import React, { useState } from 'react';
import { Calendar, Clock, User, AlertCircle, LayoutGrid, List } from 'lucide-react';
import AppointmentCalendar from '../../components/AppointmentCalendar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { mockAppointments } from '../../mocks/appointments';

const Appointments = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [appointments, setAppointments] = useState(mockAppointments);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const filteredAppointments = appointments.filter(appt => {
        if (activeTab === 'upcoming') return appt.status !== 'Cancelled' && appt.status !== 'Completed';
        if (activeTab === 'history') return appt.status === 'Completed' || appt.status === 'Cancelled';
        return true;
    });

    const handleCancelClick = (appt) => {
        setSelectedAppointment(appt);
        setCancelModalOpen(true);
    };

    const confirmCancel = () => {
        setAppointments(appointments.map(a =>
            a.id === selectedAppointment.id ? { ...a, status: 'Cancelled' } : a
        ));
        setCancelModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleComplete = (id) => {
        setAppointments(appointments.map(a =>
            a.id === id ? { ...a, status: 'Completed' } : a
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Calendar View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                    <Button>+ New Appointment</Button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <AppointmentCalendar appointments={appointments} />
            ) : (
                <>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['upcoming', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                        ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                                >
                                    {tab} Appointments
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-4">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map(appt => (
                                <Card key={appt.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{appt.type} - {appt.patientName}</h4>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Clock size={14} className="mr-1" />
                                                {appt.date} at {appt.time}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <User size={14} className="mr-1" />
                                                Patient ID: {appt.patientId}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                        <Badge type={
                                            appt.status === 'Confirmed' ? 'green' :
                                                appt.status === 'Pending' ? 'yellow' :
                                                    appt.status === 'Cancelled' ? 'red' : 'gray'
                                        }>
                                            {appt.status}
                                        </Badge>

                                        {activeTab === 'upcoming' && (
                                            <div className="flex space-x-2">
                                                <Button variant="outline" className="text-sm py-1" onClick={() => handleComplete(appt.id)}>
                                                    Check In
                                                </Button>
                                                <Button variant="danger" className="text-sm py-1 bg-white text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleCancelClick(appt)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p>No appointments found in this view.</p>
                            </div>
                        )}
                    </div>

                    <Modal
                        isOpen={cancelModalOpen}
                        onClose={() => setCancelModalOpen(false)}
                        title="Cancel Appointment"
                    >
                        <div className="space-y-4">
                            <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                <p className="text-sm text-yellow-800">
                                    Are you sure you want to cancel the appointment for <strong>{selectedAppointment?.patientName}</strong>?
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>Keep Appointment</Button>
                                <Button variant="danger" onClick={confirmCancel}>Confirm Cancellation</Button>
                            </div>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default Appointments;
