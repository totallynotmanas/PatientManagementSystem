# Frontend Project Structure

This document outlines the file structure of the `frontend/app` directory, explaining the purpose of key files and directories in the Patient Management System.

## Directory Structure

```text
frontend/app/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── doctor/
│   ├── contexts/
│   ├── layouts/
│   ├── mocks/
│   ├── pages/
│   │   ├── admin/
│   │   ├── doctor/
│   │   ├── lab/
│   │   ├── nurse/
│   │   ├── patient/
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── TwoFactorAuth.jsx
│   │   ├── createAccount.jsx
│   │   └── login.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── supabaseAuth.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── index.js
│   ├── test-utils.jsx
│   └── setupTests.js
├── .env
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

## Testing

### Test Coverage
The project has **comprehensive test coverage** with tests for all major components, pages, services, and contexts.

### Test Files Organization

#### Component Tests
**Common Components** (`src/components/common/`)
- `Alert.test.jsx` - Alert component with different types
- `Badge.test.jsx` - Badge component with color variants
- `Button.test.jsx` - Button component with variants
- `Card.test.jsx` - Card wrapper component
- `Input.test.jsx` - Input field component
- `Modal.test.jsx` - Modal dialog component
- `RestrictedSection.test.jsx` - Role-based access control

**Shared Components** (`src/components/`)
- `AppointmentCalendar.test.jsx` - Full calendar view
- `AppointmentList.test.jsx` - Appointment list view
- `AppointmentSidePanel.test.jsx` - Appointment details panel
- `MiniCalendar.test.jsx` - Compact calendar widget
- `SchedulerView.test.jsx` - Time slot scheduler
- `VitalsChart.test.jsx` - Vital signs chart

**Doctor Components** (`src/components/doctor/`)
- `LabResultsList.test.jsx` - Lab results display
- `MedicalHistoryList.test.jsx` - Medical history timeline
- `TreatmentModal.test.jsx` - Treatment plan modal

**Doctor Page Components** (`src/pages/doctor/components/`)
- `NotificationsPanel.test.jsx` - Notifications widget
- `PatientSearch.test.jsx` - Patient search component
- `TreatmentModal.test.jsx` - Treatment modal
- `VitalsChart.test.jsx` - Vitals visualization

#### Page Tests
**Doctor Pages** (`src/pages/doctor/`)
- `Appointments.test.jsx` - Appointment management
- `Dashboard.test.jsx` - Doctor dashboard
- `LabResults.test.jsx` - Lab results page
- `Messages.test.jsx` - Messaging interface
- `PatientDetail.test.jsx` - Patient detail view
- `Patients.test.jsx` - Patient directory
- `Prescriptions.test.jsx` - Prescription management
- `Profile.test.jsx` - Doctor profile
- `Reports.test.jsx` - Reports and analytics

**Patient Pages** (`src/pages/patient/`)
- `Appointments.test.jsx` - Patient appointments
- `Dashboard.test.jsx` - Patient dashboard
- `LabResults.test.jsx` - Lab results view
- `MedicalHistory.test.jsx` - Medical history
- `Prescriptions.test.jsx` - Active medications

**Other Role Pages**
- `src/pages/admin/Dashboard.test.jsx` - Admin dashboard
- `src/pages/lab/Dashboard.test.jsx` - Lab dashboard
- `src/pages/nurse/Dashboard.test.jsx` - Nurse dashboard

**Authentication Pages**
- `src/pages/login.test.jsx` - Login page
- `src/pages/createAccount.test.jsx` - Registration page

#### Context & Service Tests
- `src/contexts/AuthContext.test.jsx` - Authentication context
- `src/services/api.test.js` - API service layer
- `src/services/supabaseAuth.test.js` - Auth service

#### Layout Tests
- `src/layouts/DashboardLayout.test.jsx` - Main dashboard layout

#### Core Tests
- `src/App.test.js` - Main app component and routing

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

# Run tests for a specific directory
npm test src/pages/doctor
```

### Testing Infrastructure
- **Framework**: Jest + React Testing Library
- **Router**: `react-router-dom` v7.12.0 with `MemoryRouter` for tests
- **Providers**: Auto-wrapped with `MemoryRouter` and `AuthContext.Provider` via `test-utils.jsx`
- **Mocking Strategy**: Component-level mocks for dependencies, service-level mocks for API calls
- **Auth Service**: Backend API integration tested with mocked fetch calls

## Key Features

### Authentication
- Backend API integration via `services/supabaseAuth.js`
- Base URL from `REACT_APP_API_URL`
- Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/resend-otp`, `/api/auth/forgot-password`, `/api/auth/validate-reset-token`, `/api/auth/reset-password`, `/api/auth/logout`
- Cookie-based session management with refresh token cookie

### State Management
- React Context for authentication (`AuthContext`)
- Local state management with hooks

### Styling & Design System
- **Tailwind CSS**: Utility-first framework heavily customized for the premium look.
- **Glassmorphism**: Backdrop blur and transparency utilities (`.glass-card`, `.glass-card-dark`).
- **Animations**: Custom keyframe animations for fade-ins, floating elements, pulses, and hover lifts.
- **Gradients**: A comprehensive system of primary, secondary, and accent gradients defined in `:root`.
- **Typography**: Complete integration of **Plus Jakarta Sans** via Google Fonts.
- **Responsive Design**: Mobile-first approach ensuring perfect rendering on all devices.

### Mock Data
- Development-ready mock data for patients, appointments, and medical records
- Located in `src/mocks/` directory

## Development

### Prerequisites
- Node.js (v18+)
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
