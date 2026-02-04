import React from 'react';
import { Bell, Check } from 'lucide-react';
import Card from '../../../components/common/Card';

const notifications = [
    { id: 1, type: 'urgent', text: 'Lab results ready for Patient P002 (Michael Chen)', time: '10 min ago' },
    { id: 2, type: 'info', text: 'Appointment cancelled by Patient P005', time: '1 hour ago' },
    { id: 3, type: 'info', text: 'New system update scheduled for midnight', time: '2 hours ago' },
];

const NotificationsPanel = () => {
    return (
        <Card className="h-full">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-500" />
                    Notifications
                </h3>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </div>
            <div className="divide-y divide-gray-100">
                {notifications.map(note => (
                    <div key={note.id} className="p-4 hover:bg-gray-50 transition flex items-start">
                        <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${note.type === 'urgent' ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-800">{note.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                        </div>
                        <button className="text-gray-300 hover:text-blue-500">
                            <Check size={16} />
                        </button>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                )}
            </div>
            <div className="p-3 text-center border-t">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
            </div>
        </Card>
    );
};

export default NotificationsPanel;
