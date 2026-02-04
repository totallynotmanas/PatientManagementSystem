import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Pill, Activity, Plus, Trash2 } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

import { getPatientById } from '../../mocks/patients';
import { mockMedicalHistory, mockPrescriptions, mockLabs, mockTreatments } from '../../mocks/records';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const patient = getPatientById(id);

    const [activeTab, setActiveTab] = useState('overview');
    const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const [isRxModalOpen, setIsRxModalOpen] = useState(false);
    const [newRx, setNewRx] = useState({ name: '', dosage: '', frequency: '' });

    if (!patient) return <div className="p-6">Patient not found</div>;

    const handleAddRx = (e) => {
        e.preventDefault();
        const rx = {
            id: Date.now(),
            ...newRx,
            active: true,
            prescribedBy: 'Dr. Smith',
            date: new Date().toISOString().split('T')[0]
        };
        setPrescriptions([rx, ...prescriptions]);
        setIsRxModalOpen(false);
        setNewRx({ name: '', dosage: '', frequency: '' });
    };

    const handleDeleteRx = (rxId) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            setPrescriptions(prescriptions.filter(rx => rx.id !== rxId));
        }
    };

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
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700">Active Prescriptions</h3>
                            <Button onClick={() => setIsRxModalOpen(true)} className="flex items-center text-sm">
                                <Plus className="w-4 h-4 mr-1" /> Add New
                            </Button>
                        </div>

                        {prescriptions.map(rx => (
                            <Card key={rx.id} className="p-4 flex justify-between items-center group">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-4 ${rx.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Pill size={24} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${rx.active ? 'text-gray-800' : 'text-gray-500'}`}>{rx.name}</h4>
                                        <p className="text-sm text-gray-500">{rx.dosage} • {rx.frequency}</p>
                                        <p className="text-xs text-gray-400">By {rx.prescribedBy} on {rx.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Badge type={rx.active ? 'green' : 'gray'}>{rx.active ? 'Active' : 'Discontinued'}</Badge>
                                    <button
                                        onClick={() => handleDeleteRx(rx.id)}
                                        className="ml-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </Card>
                        ))}
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
                title="Add New Prescription"
            >
                <form onSubmit={handleAddRx} className="space-y-4">
                    <Input
                        label="Medication Name"
                        value={newRx.name}
                        onChange={e => setNewRx({ ...newRx, name: e.target.value })}
                        placeholder="e.g. Lisinopril"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Dosage"
                            value={newRx.dosage}
                            onChange={e => setNewRx({ ...newRx, dosage: e.target.value })}
                            placeholder="e.g. 10mg"
                            required
                        />
                        <Input
                            label="Frequency"
                            value={newRx.frequency}
                            onChange={e => setNewRx({ ...newRx, frequency: e.target.value })}
                            placeholder="e.g. Daily"
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => setIsRxModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Prescribe</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PatientDetail;
