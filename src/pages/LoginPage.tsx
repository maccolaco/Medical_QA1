import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { useAuthStore } from '../stores/authStore'

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'BillingCoder'
  })
  const [hipaaMode, setHipaaMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const result = await invoke<{ user: any } | null>('authenticate_user', {
          username: formData.username,
          password: formData.password
        })
        
        if (result?.user) {
          login(result.user)
        } else {
          setError('Invalid username or password')
        }
      } else {
        const result = await invoke('create_user', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
        
        if (result) {
          login(result as any)
        }
      }
    } catch (err) {
      setError(err as string)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">ClaimsSense</h1>
          <p className="mt-2 text-sm text-gray-600">
            Medical Claims QA Desktop Application
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                  isLogin
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                  !isLogin
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required={!isLogin}
                    className="input"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="input"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    className="input"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="BillingCoder">Billing Coder</option>
                    <option value="Auditor">Auditor / QA</option>
                    <option value="BillingManager">Billing Manager</option>
                    <option value="LocalAdmin">Local Admin</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="hipaa-mode"
                name="hipaa-mode"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={hipaaMode}
                onChange={(e) => setHipaaMode(e.target.checked)}
              />
              <label htmlFor="hipaa-mode" className="ml-2 block text-sm text-gray-900">
                Enable HIPAA mode (local processing only)
              </label>
            </div>

            {error && (
              <div className="rounded-md bg-error-50 p-4">
                <div className="text-sm text-error-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Security Notice</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>ClaimsSense processes sensitive medical data locally.</p>
              <p>When HIPAA mode is disabled, ensure you have proper Business Associate Agreements (BAA) with any cloud providers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

