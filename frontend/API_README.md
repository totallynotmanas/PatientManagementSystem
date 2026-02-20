## Base URL
http://localhost:8081/api

## Register
fetch("http://localhost:8081/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, role }),
});

## Login
fetch("http://localhost:8081/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});

## Verify OTP
fetch("http://localhost:8081/api/auth/verify-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, otp }),
});

## Resend OTP
fetch("http://localhost:8081/api/auth/resend-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});

## Logout
fetch("http://localhost:8081/api/auth/logout", {
  method: "POST",
  credentials: "include",
});

## Authentication (`/auth`)
| Method | Endpoint | Description | Payload (JSON) |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | `{ email, password, role, ...userData }` |
| POST | `/auth/login` | Login user | `{ email, password }` |
| POST | `/auth/logout` | Logout user | - |
| GET | `/auth/me` | Get current user profile | - |
| POST | `/auth/verify-otp` | Verify 2FA OTP | `{ email, otp }` |
| POST | `/auth/resend-otp` | Resend 2FA OTP | `{ email }` |
| POST | `/auth/forgot-password` | Request password reset | `{ email }` |
| GET | `/auth/validate-reset-token` | Validate reset token | Query param: `?token=...` |
| POST | `/auth/reset-password` | Reset password | `{ token, newPassword, confirmPassword }` |

## Patients (`/patients`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/patients` | Get all patients | - |
| GET | `/patients/:id` | Get patient by ID | - |
| POST | `/patients` | Create new patient | `{ ...patientData }` |
| PUT | `/patients/:id` | Update patient | `{ ...patientData }` |
| DELETE | `/patients/:id` | Delete patient | - |

## Appointments (`/appointments`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/appointments` | Get all appointments | - |
| GET | `/appointments/:id` | Get appointment by ID | - |
| GET | `/appointments/patient/:patientId` | Get by Patient ID | - |
| GET | `/appointments/doctor/:doctorId` | Get by Doctor ID | - |
| POST | `/appointments` | Create appointment | `{ ...appointmentData }` |
| PUT | `/appointments/:id` | Update appointment | `{ ...appointmentData }` |
| PUT | `/appointments/:id/cancel` | Cancel appointment | - |
| DELETE | `/appointments/:id` | Delete appointment | - |

## Medical Records (`/medical-records`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/medical-records/patient/:patientId` | Get all by Patient | - |
| GET | `/medical-records/:id` | Get record by ID | - |
| POST | `/medical-records` | Create record | `{ ...recordData }` |
| PUT | `/medical-records/:id` | Update record | `{ ...recordData }` |
| DELETE | `/medical-records/:id` | Delete record | - |

## Prescriptions (`/prescriptions`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/prescriptions/patient/:patientId` | Get all by Patient | - |
| GET | `/prescriptions/:id` | Get prescription by ID | - |
| POST | `/prescriptions` | Create prescription | `{ ...prescriptionData }` |
| PUT | `/prescriptions/:id` | Update prescription | `{ ...prescriptionData }` |
| POST | `/prescriptions/:id/refill` | Request a medication refill | - |
| DELETE | `/prescriptions/:id` | Delete prescription | - |

## Lab Results (`/lab-results`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/lab-results/patient/:patientId` | Get all by Patient | - |
| GET | `/lab-results/:id` | Get result by ID | - |
| POST | `/lab-results` | Create result | `{ ...labResultData }` |
| PUT | `/lab-results/:id` | Update result | `{ ...labResultData }` |
| GET | `/lab-results/:id/download` | Download lab result PDF | - |
| DELETE | `/lab-results/:id` | Delete result | - |

## Doctors (`/doctors`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/doctors` | Get all doctors | - |
| GET | `/doctors/:id` | Get doctor by ID | - |
| GET | `/doctors/specialty/:specialty` | Get by specialty | - |
| PUT | `/doctors/:id` | Update doctor profile | `{ ...doctorData }` |

## Vital Signs (`/vital-signs`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/vital-signs/patient/:patientId` | Get history by Patient | - |
| GET | `/vital-signs/patient/:patientId/latest` | Get latest by Patient | - |
| POST | `/vital-signs` | Record new vitals | `{ ...vitalSignsData }` |
| PUT | `/vital-signs/:id` | Update vitals entry | `{ ...vitalSignsData }` |

## Consents (`/consents`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| GET | `/consents/patient/:patientId` | Get all by Patient | - |
| GET | `/consents/:id` | Get consent by ID | - |
| POST | `/consents` | Grant new consent | `{ ...consentData }` |
| PUT | `/consents/:id` | Modify consent | `{ ...consentData }` |
| DELETE | `/consents/:id` | Revoke consent | - |


## Missing Backend APIs & Mock Data Dependencies

The following pages under `src/pages/patient` currently rely heavily on mock data. The listed backend APIs and architectural changes will need to be implemented to fully support the frontend UI features.

### 1. 📅 Appointments (`Appointments.jsx`)
This page relies on deep mock data to drive its UI form logic (departments, doctors, time slots, cancellation reasons).
- **POST** `/appointments` - Book a new appointment.
- **PUT** `/appointments/:id/cancel` - Cancel an existing appointment and log the cancellation reason.
- **GET** `/doctors/available-slots` - Fetch dynamic timeslots based on the selected doctor and date.
- **GET** `/doctors/departments` - Populate the "Department" selection dropdown dynamically.

### 2. 🛡️ Privacy & Consents (`ConsentManagement.jsx`, `GrantModifyConsent.jsx`)
Currently driven by the `mocks/consents.js` object.
- **GET** `/consents/patient/:patientId` - Fetch all historically granted/withdrawn consents.
- **POST** `/consents` - Grant new consent policy logic.
- **PUT** `/consents/:id` - Append/modify specific preferences (e.g. adding a family member to an existing HIPAA consent).
- **DELETE** `/consents/:id` - Completely withdraw a consent.

### 3. 🧪 Lab Results (`LabResults.jsx`)
The frontend relies on `mocks/labResults.js` for "Lab Stats" (out of bounds, pending, normal) and complex trend graphs.
- **GET** `/lab-results/:id/download` - Generate and return a PDF blob of the lab result.
- **GET** `/lab-results/patient/:patientId/stats` - Calculate and return the high-level metrics for the summary cards.

### 4. 💊 Medications / Prescriptions (`Medications.jsx`, `Prescriptions.jsx`)
These files import from `mocks/medications.js` and `mocks/records.js`. The UI features rich interactions like checking refill boundaries.
- **POST** `/prescriptions/:id/refill` - Submit a refill request to a doctor/pharmacy queue.
- **GET** `/prescriptions/:id/download` - Fetch the prescription as a downloadable PDF.

### 5. 🏥 Medical History (`MedicalHistory.jsx`)
Currently entirely mocked by `mocks/medicalHistory.js`. The UI has completely distinct tabs for **Allergies, Family History, Immunizations, and Surgeries**.
_Expected Backend Implementation Needed:_ DB schema and controllers will need significant expansion. Either heavily expand `MedicalRecord` with JSON lists, or create separate endpoints:
- **GET** `/allergies/patient/:patientId`
- **GET** `/immunizations/patient/:patientId`
- **GET** `/surgeries/patient/:patientId`
- **GET** `/family-history/patient/:patientId`

### 6. 👤 Patient Profile (`Profile.jsx`)
The frontend expects robust profile editing, including updating Emergency Contacts and Insurance details.
- **PUT** `/patients/:id` - Ensure the controller accepts robust profile updates.
- _Note:_ You will need to introduce `Insurance` and `EmergencyContact` models/tables into `schema.sql` and return them as nested lists inside the `GET /patients/:id` payload so the UI form can populate them natively.