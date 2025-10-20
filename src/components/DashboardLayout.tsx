import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Upload, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  Users,
  Search,
  Bell,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { invoke } from '@tauri-apps/api/tauri'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const navigation = [
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Critical Errors', href: '/queues/critical_errors', icon: AlertTriangle },
    { name: 'Warnings', href: '/queues/warnings', icon: AlertCircle },
    { name: 'Approved Claims', href: '/queues/approved', icon: CheckCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Users', href: '/users', icon: Users },
  ]

  const handleLogout = async () => {
    logout()
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        // TODO: Implement search functionality
        console.log('Searching for:', searchQuery)
      } catch (error) {
        console.error('Search error:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">ClaimsSense</h1>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href.startsWith('/queues') && location.pathname.startsWith('/queues'))
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`sidebar-item ${
                      isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center flex-1 max-w-lg">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.username}</p>
                  <p className="text-gray-500 capitalize">{user?.role.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

