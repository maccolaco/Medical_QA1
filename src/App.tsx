import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import UploadPage from './pages/UploadPage'
import QueuesPage from './pages/QueuesPage'
import ClaimReviewPage from './pages/ClaimReviewPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/queues" element={<QueuesPage />} />
          <Route path="/queues/:queueType" element={<QueuesPage />} />
          <Route path="/claim/:id" element={<ClaimReviewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </DashboardLayout>
    </Router>
  )
}

export default App

