export const mockPatients = [
    {
        id: 'P001',
        name: 'Emily Blunt',
        age: 34,
        gender: 'Female',
        lastVisit: '2023-10-15',
        condition: 'Hypertension',
        status: 'Stable',
        avatar: 'EB',
        email: 'emily.b@example.com',
        phone: '555-0101'
    },
    {
        id: 'P002',
        name: 'Michael Chen',
        age: 45,
        gender: 'Male',
        lastVisit: '2023-11-02',
        condition: 'Type 2 Diabetes',
        status: 'Needs Review',
        avatar: 'MC',
        email: 'm.chen@example.com',
        phone: '555-0102'
    },
    {
        id: 'P003',
        name: 'Sarah Johnson',
        age: 28,
        gender: 'Female',
        lastVisit: '2023-11-20',
        condition: 'Asthma',
        status: 'Stable',
        avatar: 'SJ',
        email: 'sarah.j@example.com',
        phone: '555-0103'
    },
    {
        id: 'P004',
        name: 'David Kim',
        age: 8,
        gender: 'Male',
        lastVisit: '2023-12-01',
        condition: 'Chickenpox',
        status: 'Recovery',
        avatar: 'DK',
        parent: 'John Kim',
        email: 'j.kim@example.com',
        phone: '555-0104'
    },
    {
        id: 'P005',
        name: 'Robert Wilson',
        age: 62,
        gender: 'Male',
        lastVisit: '2023-10-05',
        condition: 'Arthritis',
        status: 'Stable',
        avatar: 'RW',
        email: 'r.wilson@example.com',
        phone: '555-0105'
    }
];

export const getPatientById = (id) => mockPatients.find(p => p.id === id);
