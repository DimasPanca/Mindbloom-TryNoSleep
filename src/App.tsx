import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ScreeningIntroPage from '@/pages/ScreeningIntroPage'
import ScreeningPage from '@/pages/ScreeningPage'
import ResultPage from '@/pages/ResultPage'
import InterventionPage from '@/pages/InterventionPage'
import HistoryPage from '@/pages/HistoryPage'
import ProfilePage from '@/pages/ProfilePage'
import ReferralPage from '@/pages/ReferralPage'
import EmergencyPage from '@/pages/EmergencyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/screening" element={<ScreeningIntroPage />} />
      <Route path="/screening/questions" element={<ScreeningPage />} />
      <Route path="/result/:id" element={<ResultPage />} />
      <Route path="/intervention/:screeningId" element={<InterventionPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/referral" element={<ReferralPage />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
