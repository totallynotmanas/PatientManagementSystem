# Secure Healthcare Platform - Frontend (Phase 1)

This project contains the UI implementation for the secure healthcare platform, featuring role-based dashboards for Doctors and Patients (Parents).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Navigate to the app directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   npm install lucide-react
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## 🖥️ Dashboard Access

Since authentication is currently a placeholder, you can directly access the dashboards via these URLs:

| Role | URL Route | Features Implemented |
|------|-----------|----------------------|
| **Doctor** | `/dashboard/doctor` | Patient Search, Patient Detail View, Prescriptions, Treatment Mgmt, Notifications |
| **Parent** | `/dashboard/parent` | Child Profiles, Medical History, Appointments, Consent Mgmt |
| **Nurse** | `/dashboard/nurse` | *Placeholder* |
| **Lab** | `/dashboard/lab` | *Placeholder* |
| **Admin** | `/dashboard/admin` | *Placeholder* |

## 📂 Project Structure

```
src/
├── components/
│   └── common/         # Shared UI (Button, Card, Modal, Alert, Badge)
├── layouts/            # DashboardLayout (Sidebar, Header)
├── mocks/              # Mock Data (Patients, Appointments, Records)
├── pages/
│   ├── doctor/         # Doctor Dashboard Views
│   │   ├── components/ # Doctor-specific components (PatientSearch, Notifications)
│   │   ├── Dashboard.jsx
│   │   └── PatientDetail.jsx
│   ├── parent/         # Parent Dashboard Views
│   │   ├── components/ # Parent-specific components (ConsentManager)
│   │   └── Dashboard.jsx
│   └── ...
└── App.jsx             # Routing Configuration
```

## 🛠️ Key Features (Phase 1)

### Doctor Dashboard
- **Patients Directory**: Searchable list of all patients on `/dashboard/doctor/patients`.
- **Appointments**: Manage schedule (Upcoming/History) on `/dashboard/doctor/appointments`.
- **Patient Search**: Quick lookup on the dashboard home.
- **Patient Detail**: Comprehensive view including Vitals, History, and Prescriptions.
- **Prescription Management**: UI for adding/deleting prescriptions (local state).
- **Notifications**: Alert panel for urgent updates.
- **Profile**: Doctor settings and availability toggle on `/dashboard/doctor/profile`.

### Patient/Parent Dashboard
- **Family Portal**: Managing multiple child profiles.
- **Consent Manager**: Toggle data sharing permissions.
- **Appointments**: View upcoming schedule.
- **Medical History**: Access and "download" past records.

## 🧪 Mock Data
The application uses local mock data located in `src/mocks/`. You can edit these files to test different data scenarios without a backend.
