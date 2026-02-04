import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../../components/common/Card';

const VitalsChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Vitals Trends</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic BP" />
                        <Line type="monotone" dataKey="diastolic" stroke="#f97316" name="Diastolic BP" />
                        <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" name="Heart Rate (bpm)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default VitalsChart;
