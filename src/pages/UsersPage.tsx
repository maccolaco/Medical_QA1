import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: 'BillingCoder' | 'Auditor' | 'BillingManager' | 'LocalAdmin'
  created_at: string
  last_login?: string
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'BillingCoder' as const
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await invoke<User[]>('get_users')
      setUsers(result)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await invoke('create_user', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      setShowCreateModal(false)
      setFormData({ username: '', email: '', password: '', role: 'BillingCoder' })
      loadUsers()
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await invoke('delete_user', { userId })
        loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LocalAdmin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'BillingManager':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'Auditor':
        return <UserCheck className="h-4 w-4 text-green-500" />
      default:
        return <UserX className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LocalAdmin':
        return 'bg-red-100 text-red-800'
      case 'BillingManager':
        return 'bg-blue-100 text-blue-800'
      case 'Auditor':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Roles</option>
            <option value="BillingCoder">Billing Coder</option>
            <option value="Auditor">Auditor</option>
            <option value="BillingManager">Billing Manager</option>
            <option value="LocalAdmin">Local Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">
                        {user.role.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UserX className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              {searchQuery || roleFilter !== 'all'
                ? 'No users match your search criteria.'
                : 'No users have been created yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="input w-full"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="input w-full"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    className="input w-full"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  >
                    <option value="BillingCoder">Billing Coder</option>
                    <option value="Auditor">Auditor</option>
                    <option value="BillingManager">Billing Manager</option>
                    <option value="LocalAdmin">Local Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage

