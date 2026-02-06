export const mockMedicalHistory = [
    { id: 1, date: '2023-11-20', type: 'Visit', note: 'Annual Checkup. BP normal.' },
    { id: 2, date: '2023-08-15', type: 'Surgery', note: 'Appendectomy (Laparoscopic)' },
    { id: 3, date: '2023-01-10', type: 'Visit', note: 'Flu symptoms. Prescribed Tamiflu.' },
];

export const mockDiagnoses = [
    { id: 1, name: 'Hypertension', date: '2023-05-12', doctor: 'Dr. Smith', severity: 'Moderate', status: 'Active' },
    { id: 2, name: 'Type 2 Diabetes', date: '2022-11-20', doctor: 'Dr. Jones', severity: 'High', status: 'Active' },
    { id: 3, name: 'Seasonal Allergies', date: '2021-03-15', doctor: 'Dr. Lee', severity: 'Low', status: 'Managed' },
];

export const mockPrescriptions = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', active: true, prescribedBy: 'Dr. Smith', date: '2023-11-20', refills: 2, nextRefill: '2023-12-20' },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: '2x Daily', active: true, prescribedBy: 'Dr. Jones', date: '2023-10-10', refills: 0, nextRefill: '2023-11-10' },
    { id: 3, name: 'Amoxicillin', dosage: '500mg', frequency: '3x Daily', active: false, prescribedBy: 'Dr. Jones', date: '2023-01-10', refills: 0, nextRefill: 'N/A' },
];

export const mockLabs = [
    { id: 1, name: 'Complete Blood Count (CBC)', orderedDate: '2023-11-19', date: '2023-11-20', expectedDate: '2023-11-21', status: 'Normal', file: 'cbc_results.pdf', type: 'Completed' },
    { id: 2, name: 'Lipid Panel', orderedDate: '2023-11-19', date: '2023-11-20', expectedDate: '2023-11-22', status: 'High Cholesterol', file: 'lipid_panel.pdf', type: 'Completed' },
    { id: 3, name: 'Thyroid Panel', orderedDate: '2023-12-01', date: 'TBD', expectedDate: '2023-12-05', status: 'Pending', file: null, type: 'Pending' },
];

export const mockVitalsHistory = [
    { date: '2023-11-20', bp: '120/80', hr: 72, temp: 98.6, weight: 70, spo2: 98, resp: 16 },
    { date: '2023-10-15', bp: '125/82', hr: 75, temp: 98.4, weight: 71, spo2: 99, resp: 18 },
];

export const mockTreatments = [
    { id: 1, name: 'Physical Therapy', frequency: '2x Weekly', notes: 'Focus on lower back exercises', active: true },
    { id: 2, name: 'Dietary Counseling', frequency: 'Monthly', notes: 'Low sodium diet plan', active: true },
];
