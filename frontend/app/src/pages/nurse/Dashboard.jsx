import React from 'react';
import Card from '../../components/common/Card';

const NurseDashboard = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Nurse Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Vitals</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">8</p>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Schedule</h3>
                <p className="text-gray-500">Schedule list will appear here...</p>
            </Card>
        </div>
    );
};

export default NurseDashboard;
