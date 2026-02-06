# Frontend Project Structure

This document outlines the file structure of the `frontend/app` directory, explaining the purpose of key files and directories in the Patient Management System.

## Directory Structure

```text
frontend/app/
├── public/                     # Static assets (images, icons)
├── src/                        # Source code
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Generic atomic components (Buttons, Inputs, Modals)
│   │   ├── AppointmentCalendar.jsx # Full-month interactive calendar view
│   │   ├── AppointmentList.jsx     # List view component for appointments
│   │   ├── AppointmentSidePanel.jsx # Appointment details side panel
│   │   ├── MiniCalendar.jsx        # Small sidebar widget calendar
│   │   ├── SchedulerView.jsx       # Day/week scheduler with time slots
│   │   └── VitalsChart.jsx         # Patient vital signs visualization (Recharts)
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.jsx     # Authentication state management
│   │
│   ├── layouts/                # Page layout wrappers
│   │   └── DashboardLayout.jsx # Main shell containing Sidebar and Topbar
│   │
│   ├── mocks/                  # Static mock data for development
│   │   ├── appointments.js     # Mock appointment data
│   │   ├── patients.js         # Mock patient data
│   │   └── records.js          # Mock medical records (prescriptions, labs, diagnoses)
│   │
│   ├── pages/                  # Application pages/views
│   │   ├── doctor/             # Doctor role-specific pages
│   │   │   ├── components/     # Doctor-specific components
│   │   │   │   ├── NotificationsPanel.jsx
│   │   │   │   ├── PatientSearch.jsx
│   │   │   │   ├── TreatmentModal.jsx
│   │   │   │   └── VitalsChart.jsx
│   │   │   ├── Appointments.jsx  # Appointment management (Calendar/List views)
│   │   │   ├── Dashboard.jsx     # Main doctor landing page (metrics widgets)
│   │   │   ├── PatientDetail.jsx # Individual patient record view
│   │   │   ├── Patients.jsx      # Patient directory and search
│   │   │   └── Profile.jsx       # Doctor profile settings
│   │   │
│   │   ├── patient/            # Patient role pages
│   │   │   ├── Appointments.jsx   # Patient appointment management
│   │   │   ├── Dashboard.jsx      # Main patient landing page (health summary)
│   │   │   ├── LabResults.jsx     # Lab results view and download
│   │   │   ├── MedicalHistory.jsx # Timeline of health events
│   │   │   └── Prescriptions.jsx  # Active medications and refills
│   │   │
│   │   ├── nurse/              # Nurse role pages
│   │   │   └── Dashboard.jsx   # Nurse dashboard
│   │   │
│   │   ├── lab/                # Lab Technician role pages
│   │   │   └── Dashboard.jsx   # Lab dashboard
│   │   │
│   │   ├── admin/              # Administrator role pages
│   │   │   └── Dashboard.jsx   # Admin dashboard
│   │   │
│   │   ├── login.jsx           # User authentication page
│   │   └── createAccount.jsx   # New user registration page
│   │
│   ├── services/               # API and external services
│   │   └── supabaseAuth.js     # Authentication service (backend API integration)
│   │
│   ├── App.jsx                 # Main application component & Router configuration
│   ├── App.css                 # Component-level styles for App
│   ├── index.css               # Global styles & Tailwind directives
│   ├── index.js                # Application entry point (ReactDOM render)
│   ├── test-utils.jsx          # Testing utilities (custom render with providers)
│   └── setupTests.js           # Jest configuration
│
├── .env                        # Environment variables
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration (Tailwind processing)
└── tailwind.config.js          # Tailwind CSS theme configuration (colors, fonts)
```

## Testing

### Test Coverage
The project has **comprehensive test coverage** with **34 test suites** and **67 tests**, all passing ✅

### Test Files
Every component and page has a corresponding `.test.jsx` file:
- **Components**: `Button.test.jsx`, `Card.test.jsx`, `Modal.test.jsx`, `Alert.test.jsx`, etc.
- **Pages**: All dashboard, appointment, and profile pages have tests
- **Utilities**: `test-utils.jsx` provides custom render with Router and Auth providers

### Running Tests
```bash
# Run all tests (watch mode)
npm test

# Run all tests once
npm test -- --watchAll=false

# Run specific test file
npm test ComponentName.test.jsx

# Run with coverage
npm test -- --coverage
```

### Testing Infrastructure
- **Framework**: Jest + React Testing Library
- **Router**: Fixed `react-router-dom` v7.12.0 (native fix, no mocks)
- **Providers**: Auto-wrapped with `MemoryRouter` and `AuthContext.Provider` via `test-utils.jsx`
- **Auth Service**: Real `supabaseAuth.js` service integrated with backend API

## Key Features

### Authentication
- Backend API integration via `services/supabaseAuth.js`
- Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- Cookie-based session management

### State Management
- React Context for authentication (`AuthContext`)
- Local state management with hooks

### Styling
- Tailwind CSS for utility-first styling
- Custom theme configuration in `tailwind.config.js`
- Responsive design with mobile-first approach

### Mock Data
- Development-ready mock data for patients, appointments, and medical records
- Located in `src/mocks/` directory

## Development

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Setup
```bash
cd frontend/app
npm install
npm start
```

### Available Scripts
- `npm start` - Start development server
- `npm test` - Run tests in watch mode
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (not recommended)
