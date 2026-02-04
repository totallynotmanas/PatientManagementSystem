import React from 'react';
import Card from '../../components/common/Card';

const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">5,432</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-gray-500 text-sm font-medium">System Health</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">99.9%</p>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity Logs</h3>
                <p className="text-gray-500">Logs will appear here...</p>
            </Card>
        </div>
    );
};

export default AdminDashboard;
