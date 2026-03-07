# Project Tree Map

Following the refactoring to a feature-based layered architecture, here is the resulting directory structure of the `src` folder:

```text
src
|   App.css
|   App.tsx
|   i18n.ts
|   index.css
|   main.tsx
|   vite-env.d.ts
|
+---app
|   |   App.tsx
|   |   NotFound.tsx
|   |   Router.tsx
|   |
|   \---providers
|           AuthProvider.tsx
|           index.tsx
|
+---assets
|       react.svg
|
+---components
|   +---layout
|   |       MainLayout.tsx
|   |       Sidebar.tsx
|   |       Topbar.tsx
|   |
|   +---skeletons
|   |       DataTableSkeleton.tsx
|   |       ListItemSkeleton.tsx
|   |
|   \---ui
|           LanguageSwitcher.tsx
|
+---features
|   +---activity
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       auditLog.api.ts
|   |   |
|   |   \---components
|   |       |   ActivityHistory.tsx
|   |       |
|   |       \---skeletons
|   |               ActivityHistorySkeleton.tsx
|   |
|   +---appointments
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       appointments.api.ts
|   |   |       holidays.api.ts
|   |   |
|   |   \---components
|   |           AppointmentDetail.tsx
|   |           Appointments.tsx
|   |           Calendar.tsx
|   |
|   +---auth
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       auth.api.ts
|   |   |
|   |   +---components
|   |   |       Login.tsx
|   |   |
|   |   \---hooks
|   |           useAuth.ts
|   |
|   +---consultations
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       consultations.api.ts
|   |   |
|   |   \---components
|   |       |   ConsultationDetail.tsx
|   |       |   Consultations.tsx
|   |       |
|   |       \---skeletons
|   |               ConsultationDetailSkeleton.tsx
|   |
|   +---dashboard
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       dashboard.api.ts
|   |   |
|   |   \---components
|   |       |   Dashboard.tsx
|   |       |
|   |       \---skeletons
|   |               DashboardSkeleton.tsx
|   |
|   +---invoices
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       invoices.api.ts
|   |   |
|   |   \---components
|   |       |   InvoiceDetail.tsx
|   |       |   Invoices.tsx
|   |       |
|   |       \---skeletons
|   |               InvoiceDetailSkeleton.tsx
|   |
|   +---patients
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       patients.api.ts
|   |   |
|   |   \---components
|   |       |   PatientDetail.tsx
|   |       |   PatientImport.tsx
|   |       |   Patients.tsx
|   |       |
|   |       \---skeletons
|   |               PatientDetailSkeleton.tsx
|   |
|   +---prescriptions
|   |   |   index.ts
|   |   |
|   |   +---api
|   |   |       medicaments.api.ts
|   |   |       prescriptions.api.ts
|   |   |
|   |   \---components
|   |           Prescriptions.tsx
|   |
|   +---settings
|   |   |   index.ts
|   |   |
|   |   \---components
|   |           Settings.tsx
|   |
|   \---users
|       |   index.ts
|       |
|       +---api
|       |       users.api.ts
|       |
|       \---components
|               Users.tsx
|
+---lib
|       axios.ts
|
+---locales
|       en.json
|       fr.json
|
+---types
|       index.ts
|
\---utils
        currencyUtils.ts
        errorUtils.ts
```
