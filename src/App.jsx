import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navigation from './layouts/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ROUTES } from './constants/routes';

// Import centralisé des pages
import {
  HomePage,
  AboutPage,
  SportsPage,
  ReportPage,
  DashboardPage,
  AuthPage,
  VerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage
} from './pages';

// Import des composants Map et Auth
import MapView from './components/Map/MapView';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ReportSuccessPage from './pages/ReportSuccessPage';

// Styles
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              {/* Pages principales */}
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.MAP} element={<MapView />} />
              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
              <Route path={ROUTES.SPORTS} element={<SportsPage />} />
              <Route path={ROUTES.REPORT} element={<ReportPage />} />
              <Route path="/report-success" element={<ReportSuccessPage />} />
              
              {/* Authentification */}
              <Route path={ROUTES.AUTH} element={<AuthPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginForm />} />
              <Route path={ROUTES.REGISTER} element={<RegisterForm />} />
              <Route path={ROUTES.VERIFICATION} element={<VerificationPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
              
              {/* Dashboard (protégé) */}
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              
              {/* Route 404 */}
              <Route path="*" element={<div className="text-center p-8">Page non trouvée</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}