import { addDays, format, subDays } from 'date-fns';

const today = new Date();

export const mockAppointments = [
    {
        id: 'A001',
        patientId: 'P001',
        patientName: 'Emily Blunt',
        doctorName: 'Dr. Smith',
        date: format(today, 'yyyy-MM-dd'),
        time: '09:00 AM',
        duration: 30,
        type: 'Check-up',
        status: 'Confirmed',
        room: 'Room 302'
    },
    {
        id: 'A002',
        patientId: 'P002',
        patientName: 'Michael Chen',
        doctorName: 'Dr. Smith',
        date: format(today, 'yyyy-MM-dd'),
        time: '10:30 AM',
        duration: 45,
        type: 'Follow-up',
        status: 'Pending',
        room: 'Room 304'
    },
    {
        id: 'A003',
        patientId: 'P004',
        patientName: 'David Kim',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 1), 'yyyy-MM-dd'),
        time: '02:00 PM',
        duration: 60,
        type: 'Vaccination',
        status: 'Confirmed',
        room: 'Room 301'
    },
    {
        id: 'A004',
        patientId: 'P006',
        patientName: 'Linda Martinez',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 2), 'yyyy-MM-dd'),
        time: '11:00 AM',
        duration: 30,
        type: 'Lab Review',
        status: 'Confirmed',
        room: 'Lab A'
    },
    {
        id: 'A005',
        patientId: 'P003',
        patientName: 'Sarah Johnson',
        doctorName: 'Dr. Smith',
        date: format(subDays(today, 1), 'yyyy-MM-dd'),
        time: '04:00 PM',
        duration: 90,
        type: 'Emergency',
        status: 'Completed',
        room: 'ER-2'
    },
    {
        id: 'A006',
        patientId: 'P009',
        patientName: 'Tony Starch',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 5), 'yyyy-MM-dd'),
        time: '09:30 AM',
        duration: 60,
        type: 'Consultation',
        status: 'Pending',
        room: 'Conf. Room B'
    },
    {
        id: 'A007',
        patientId: 'P010',
        patientName: 'Steve Rogers',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 3), 'yyyy-MM-dd'),
        time: '08:00 AM',
        duration: 15,
        type: 'Check-up',
        status: 'Confirmed',
        room: 'Room 302'
    },
    {
        id: 'A008',
        patientId: 'P015',
        patientName: 'Peter Parker',
        doctorName: 'Dr. Smith',
        date: format(today, 'yyyy-MM-dd'),
        time: '01:00 PM',
        duration: 45,
        type: 'Physical Therapy',
        status: 'Confirmed',
        room: 'Rehab C'
    },
    {
        id: 'A009',
        patientId: 'P013',
        patientName: 'Clark Kent',
        doctorName: 'Dr. Smith',
        date: format(subDays(today, 5), 'yyyy-MM-dd'),
        time: '10:00 AM',
        duration: 30,
        type: 'General',
        status: 'Cancelled',
        room: 'Room 305'
    },
    {
        id: 'A010',
        patientId: 'P008',
        patientName: 'Natalia Romanova',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 10), 'yyyy-MM-dd'),
        time: '11:30 AM',
        duration: 30,
        type: 'Follow-up',
        status: 'Pending',
        room: 'Room 302'
    },
    {
        id: 'A011',
        patientId: 'P012',
        patientName: 'Diana Prince',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 12), 'yyyy-MM-dd'),
        time: '03:00 PM',
        duration: 60,
        type: 'Scan',
        status: 'Confirmed',
        room: 'Imaging Center'
    },
    {
        id: 'A012',
        patientId: 'P005',
        patientName: 'Robert Wilson',
        doctorName: 'Dr. Smith',
        date: format(subDays(today, 2), 'yyyy-MM-dd'),
        time: '09:00 AM',
        duration: 20,
        type: 'Check-up',
        status: 'Completed',
        room: 'Room 302'
    },
    {
        id: 'A013',
        patientId: 'P011',
        patientName: 'Bruce Banner',
        doctorName: 'Dr. Smith',
        date: format(addDays(today, 8), 'yyyy-MM-dd'),
        time: '02:30 PM',
        duration: 50,
        type: 'Therapy',
        status: 'Pending',
        room: 'Room 306'
    }
];
