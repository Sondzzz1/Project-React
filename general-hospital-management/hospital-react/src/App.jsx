import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import { PublicLayout, AdminLayout } from './components/layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import DepartmentsPage from './pages/public/DepartmentsPage';
import ServicesPage from './pages/public/ServicesPage';
import AboutUsPage from './pages/public/AboutUsPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import PatientsPage from './pages/admin/PatientsPage';
import BedsPage from './pages/admin/BedsPage';
import DoctorsPage from './pages/admin/DoctorsPage';
import NursesPage from './pages/admin/NursesPage';
import SurgeryPage from './pages/admin/SurgeryPage';
import MedicalRecordsPage from './pages/admin/MedicalRecordsPage';
import AdmissionsPage from './pages/admin/AdmissionsPage';
import BillingPage from './pages/admin/BillingPage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditPage from './pages/admin/AuditPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutUsPage />} />
          </Route>

          {/* Auth Routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="beds" element={<BedsPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="nurses" element={<NursesPage />} />
            <Route path="surgery" element={<SurgeryPage />} />
            <Route path="records" element={<MedicalRecordsPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
