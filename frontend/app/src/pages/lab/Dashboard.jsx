import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const LabDashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Lab Technician Dashboard</h2>
                <Button>Upload Results</Button>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Lab Orders</h3>
                <p className="text-gray-500">Order list will appear here...</p>
            </Card>
        </div>
    );
};

export default LabDashboard;
