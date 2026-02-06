import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
   { name: 'Mon', sys: 120, dia: 80, hr: 72 },
   { name: 'Tue', sys: 122, dia: 82, hr: 75 },
   { name: 'Wed', sys: 118, dia: 78, hr: 70 },
   { name: 'Thu', sys: 125, dia: 85, hr: 78 },
   { name: 'Fri', sys: 121, dia: 81, hr: 74 },
   { name: 'Sat', sys: 119, dia: 79, hr: 72 },
   { name: 'Sun', sys: 120, dia: 80, hr: 73 },
];

const VitalsChart = () => {
   return (
      <div className="h-64 w-full">
         <ResponsiveContainer width="100%" height="100%">
            <LineChart
               data={data}
               margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 5,
               }}
            >
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
               <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  dy={10}
               />
               <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
               />
               <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
               />
               <Line
                  type="monotone"
                  dataKey="sys"
                  stroke="#1565C0"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1565C0', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Systolic"
               />
               <Line
                  type="monotone"
                  dataKey="dia"
                  stroke="#2196F3"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2196F3', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Diastolic"
               />
               <Line
                  type="monotone"
                  dataKey="hr"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Heart Rate"
               />
            </LineChart>
         </ResponsiveContainer>
      </div>
   );
};

export default VitalsChart;
