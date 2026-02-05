# Frontend Project Structure

This document outlines the file structure of the `frontend/app` directory, explaining the purpose of key files and directories in the Patient Management System.

```text
frontend/app/
├── public/                     # Static assets (images, icons)
├── src/                        # Source code
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Generic atomic components (Buttons, Inputs, Modals)
│   │   ├── AppointmentCalendar.jsx # Full-month interactive calendar view
│   │   ├── AppointmentList.jsx     # List view component for appointments
│   │   ├── MiniCalendar.jsx        # Small sidebar widget calendar
│   │   └── VitalsChart.jsx         # Patient vital signs visualization (Recharts)
│   │
│   ├── layouts/                # Page layout wrappers
│   │   └── DashboardLayout.jsx # Main shell containing Sidebar and Topbar
│   │
│   ├── mocks/                  # Static mock data for development (patients, appointments)
│   │
│   ├── pages/                  # Application pages/views
│   │   ├── doctor/             # Doctor role-specific pages
│   │   │   ├── Appointments.jsx   # Appointment management (Calendar/List views)
│   │   │   ├── Dashboard.jsx      # Main doctor landing page (metrics & widgets)
│   │   │   ├── PatientDetail.jsx  # Individual patient record view
│   │   │   ├── Patients.jsx       # Patient directory and search
│   │   │   └── Profile.jsx        # Doctor profile settings
│   │   │
│   │   ├── patient/             # Patient role pages
│   │   ├── nurse/              # Nurse role pages
│   │   ├── lab/                # Lab Technician role pages
│   │   ├── admin/              # Administrator role pages
│   │   │
│   │   ├── login.jsx           # User authentication page
│   │   └── createAccount.jsx   # New user registration page
│   │
│   ├── App.jsx                 # Main application component & Router configuration
│   ├── App.css                 # Component-level styles for App
│   ├── index.css               # Global styles & Tailwind directives
│   └── index.js                # Application entry point (ReactDOM render)
│
├── .env                        # Environment variables
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration (Tailwind processing)
└── tailwind.config.js          # Tailwind CSS theme configuration (colors, fonts)
```
