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
import DoctorListPage from './pages/public/DoctorListPage';
import ContactPage from './pages/public/ContactPage';
import AppointmentPage from './pages/public/AppointmentPage';
import NewsPage from './pages/public/NewsPage';

// Admin Pages (TypeScript)
import Dashboard from './pages/admin/Dashboard';
import Patient from './pages/admin/Patient';
import Bed from './pages/admin/Bed';
import Doctor from './pages/admin/Doctor';
import Nurse from './pages/admin/Nurse';
import Surgery from './pages/admin/Surgery';
import MedicalRecord from './pages/admin/MedicalRecord';
import Admission from './pages/admin/Admission';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import Audit from './pages/admin/Audit';

/**
 * Centralized Route Configuration
 * All application routes are defined here — single source of truth.
 */
export default function AppRouter() {
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
                        <Route path="/doctors" element={<DoctorListPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/appointment" element={<AppointmentPage />} />
                        <Route path="/news" element={<NewsPage />} />
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
                        <Route index element={<Dashboard />} />
                        <Route path="patients" element={<Patient />} />
                        <Route path="beds" element={<Bed />} />
                        <Route path="doctors" element={<Doctor />} />
                        <Route path="nurses" element={<Nurse />} />
                        <Route path="surgery" element={<Surgery />} />
                        <Route path="records" element={<MedicalRecord />} />
                        <Route path="admissions" element={<Admission />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="audit" element={<Audit />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
