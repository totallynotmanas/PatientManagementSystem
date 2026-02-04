export const mockMedicalHistory = [
    { id: 1, date: '2023-11-20', type: 'Visit', note: 'Annual Checkup. BP normal.' },
    { id: 2, date: '2023-08-15', type: 'Surgery', note: 'Appendectomy (Laparoscopic)' },
    { id: 3, date: '2023-01-10', type: 'Visit', note: 'Flu symptoms. Prescribed Tamiflu.' },
];

export const mockPrescriptions = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', active: true, prescribedBy: 'Dr. Smith', date: '2023-11-20' },
    { id: 2, name: 'Amoxicillin', dosage: '500mg', frequency: '3x Daily', active: false, prescribedBy: 'Dr. Jones', date: '2023-01-10' },
];

export const mockLabs = [
    { id: 1, name: 'Complete Blood Count (CBC)', date: '2023-11-20', status: 'Normal', file: 'cbc_results.pdf' },
    { id: 2, name: 'Lipid Panel', date: '2023-11-20', status: 'High Cholesterol', file: 'lipid_panel.pdf' },
];

export const mockTreatments = [
    { id: 1, name: 'Physical Therapy', frequency: '2x Weekly', notes: 'Focus on lower back exercises', active: true },
    { id: 2, name: 'Dietary Counseling', frequency: 'Monthly', notes: 'Low sodium diet plan', active: true },
];
