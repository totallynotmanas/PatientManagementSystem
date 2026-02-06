import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, Clock, Activity, Pill, Plus
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

import { getPatientById } from '../../mocks/patients';
import { mockMedicalHistory, mockPrescriptions, mockTreatments } from '../../mocks/records';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const patient = getPatientById(id);

    const [activeTab, setActiveTab] = useState('overview');
    const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const [isRxModalOpen, setIsRxModalOpen] = useState(false);
    const [newRx, setNewRx] = useState({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });

    if (!patient) return <div className="p-6">Patient not found</div>;

    const handleAddRx = (e) => {
        e.preventDefault();
        const rx = {
            id: Date.now(),
            ...newRx,
            active: true,
            prescribedBy: 'Dr. Smith', // Dynamic in real app
            date: new Date().toISOString().split('T')[0]
        };
        setPrescriptions([rx, ...prescriptions]);
        setIsRxModalOpen(false);
        setNewRx({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    };

    const handleRenewRx = (rx) => {
        const renewedRx = {
            ...rx,
            id: Date.now(),
            active: true,
            date: new Date().toISOString().split('T')[0],
            prescribedBy: 'Dr. Smith'
        };
        setPrescriptions([renewedRx, ...prescriptions]);
        alert(`Prescription for ${rx.name} renewed successfully.`);
    };

    const handleDeleteRx = (rxId) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            setPrescriptions(prescriptions.filter(rx => rx.id !== rxId));
        }
    };

    const activePrescriptions = prescriptions.filter(rx => rx.active);
    const historyPrescriptions = prescriptions.filter(rx => !rx.active);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => navigate('/dashboard/doctor')} className="p-2">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>ID: {patient.id}</span>
                        <span>•</span>
                        <span>{patient.age} yrs, {patient.gender}</span>
                    </div>
                </div>
                <div className="ml-auto">
                    <Badge type={patient.status === 'Needs Review' ? 'red' : 'green'}>{patient.status}</Badge>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'history', 'labs', 'prescriptions', 'treatments'].map((tab) => (
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
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                Vitals & Condition
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Condition</span>
                                    <span className="font-medium">{patient.condition}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Blood Pressure</span>
                                    <span className="font-medium">120/80</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Heart Rate</span>
                                    <span className="font-medium">72 bpm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Weight</span>
                                    <span className="font-medium">70 kg</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                                Recent Activity
                            </h3>
                            <ul className="space-y-3">
                                {mockMedicalHistory.slice(0, 3).map(item => (
                                    <li key={item.id} className="text-sm">
                                        <span className="font-bold text-gray-700">{item.date}:</span> {item.type} - {item.note}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="space-y-8">
                        {/* Active Prescriptions */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div>
                                    <h3 className="font-bold text-blue-900">Active Prescriptions</h3>
                                    <p className="text-xs text-blue-700">Currently being taken by patient</p>
                                </div>
                                <Button onClick={() => setIsRxModalOpen(true)} className="flex items-center text-sm shadow-none">
                                    <Plus className="w-4 h-4 mr-1" /> Add New
                                </Button>
                            </div>

                            {activePrescriptions.length > 0 ? (
                                activePrescriptions.map(rx => (
                                    <Card key={rx.id} className="p-4 flex justify-between items-start group hover:border-blue-300 transition-colors">
                                        <div className="flex items-start">
                                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 mr-4">
                                                <Pill size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-800 text-lg">{rx.name}</h4>
                                                    <Badge type="green">Active</Badge>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1 font-medium">{rx.dosage} • {rx.frequency}</div>
                                                {rx.duration && <div className="text-sm text-gray-500">Duration: {rx.duration}</div>}
                                                {rx.instructions && <div className="text-sm text-gray-500 italic mt-1">"{rx.instructions}"</div>}
                                                <div className="text-xs text-gray-400 mt-2">Prescribed by {rx.prescribedBy} on {rx.date}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" className="text-xs py-1 h-8">Edit</Button>
                                            <Button variant="danger" className="text-xs py-1 h-8 bg-white border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDeleteRx(rx.id)}>
                                                Discontinue
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg">
                                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No active prescriptions.
                                </div>
                            )}
                        </div>

                        {/* Prescription History */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="font-bold text-gray-700">Prescription History</h3>
                            </div>

                            {historyPrescriptions.length > 0 ? (
                                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                    {historyPrescriptions.map((rx, idx) => (
                                        <div key={rx.id} className={`p-4 flex justify-between items-center ${idx !== historyPrescriptions.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                            <div className="opacity-70">
                                                <h4 className="font-bold text-gray-700">{rx.name}</h4>
                                                <p className="text-sm text-gray-500">{rx.dosage} • {rx.frequency}</p>
                                                <p className="text-xs text-gray-400">Ended: {rx.date}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge type="gray">Discontinued</Badge>
                                                <Button variant="outline" className="text-xs" onClick={() => handleRenewRx(rx)}>Renew</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    No prescription history.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'treatments' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700">Active Treatments</h3>
                            <Button onClick={() => alert('Add Treatment Modal Feature')} className="flex items-center text-sm">
                                <Plus className="w-4 h-4 mr-1" /> Add Treatment
                            </Button>
                        </div>
                        {mockTreatments.map(item => (
                            <Card key={item.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                                    <p className="text-sm text-gray-600">{item.notes}</p>
                                    <Badge type="blue" className="mt-2">{item.frequency}</Badge>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <Button variant="outline" className="text-sm py-1">Edit</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Placeholder for other tabs */}
                {(activeTab === 'history' || activeTab === 'labs') && (
                    <Card className="p-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>{activeTab === 'labs' ? 'Lab Results' : 'Medical History'} content coming soon...</p>
                    </Card>
                )}
            </div>

            {/* Add Prescription Modal */}
            <Modal
                isOpen={isRxModalOpen}
                onClose={() => setIsRxModalOpen(false)}
                title="Prescribe Medication"
            >
                <form onSubmit={handleAddRx} className="space-y-4">
                    <Input
                        label="Medication Name"
                        value={newRx.name}
                        onChange={e => setNewRx({ ...newRx, name: e.target.value })}
                        placeholder="e.g. Amoxicillin"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Dosage"
                            value={newRx.dosage}
                            onChange={e => setNewRx({ ...newRx, dosage: e.target.value })}
                            placeholder="e.g. 500mg"
                            required
                        />
                        <Input
                            label="Frequency"
                            value={newRx.frequency}
                            onChange={e => setNewRx({ ...newRx, frequency: e.target.value })}
                            placeholder="e.g. 3x Daily"
                            required
                        />
                    </div>
                    <Input
                        label="Duration"
                        value={newRx.duration}
                        onChange={e => setNewRx({ ...newRx, duration: e.target.value })}
                        placeholder="e.g. 7 days"
                        required
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Instructions</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
                            value={newRx.instructions}
                            onChange={e => setNewRx({ ...newRx, instructions: e.target.value })}
                            placeholder="e.g. Take with food..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => setIsRxModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Submit Prescription</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PatientDetail;
