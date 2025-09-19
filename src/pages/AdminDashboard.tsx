import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import authService from '../services/authService'

interface User {
  id: number
  email: string
  name: string
  role: string
  email_verified: boolean
  created_at: string
  last_login: string
  purchased_features_count: number
  last_purchase: string
}

const AdminDashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [grantAccessForm, setGrantAccessForm] = useState({
    email: '',
    product_type: 'story_generator',
    expires_days: 365
  })
  const [isGrantingAccess, setIsGrantingAccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!isAdmin()) {
      navigate('/dashboard')
      return
    }

    loadUsers()
  }, [user, navigate, isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await authService.getUsers()

      if (response.success && response.users) {
        setUsers(response.users)
      } else {
        setError('Failed to load users')
      }
    } catch (err) {
      setError('Error loading users')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGrantingAccess(true)

    try {
      const response = await authService.grantAccess(
        grantAccessForm.email,
        grantAccessForm.product_type,
        grantAccessForm.expires_days
      )

      if (response.success) {
        alert(`Access granted successfully to ${grantAccessForm.email}`)
        setGrantAccessForm({
          email: '',
          product_type: 'story_generator',
          expires_days: 365
        })
        loadUsers() // Refresh user list
      } else {
        alert(`Error: ${response.error}`)
      }
    } catch (err) {
      alert('Failed to grant access')
    } finally {
      setIsGrantingAccess(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis will permanently remove the user and all their data.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })

      if (response.ok) {
        alert(`User ${userEmail} deleted successfully`)
        loadUsers() // Refresh user list
      } else {
        const error = await response.json()
        alert(`Failed to delete user: ${error.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert('Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRevokeAccess = async (userEmail: string, productType: string) => {
    if (!confirm(`Revoke ${productType} access for ${userEmail}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/revoke-access', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          email: userEmail,
          product_type: productType
        })
      })

      if (response.ok) {
        alert(`Access revoked for ${userEmail}`)
        loadUsers()
      } else {
        const error = await response.json()
        alert(`Failed to revoke access: ${error.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert('Failed to revoke access')
    }
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-purple-600">
                🛡️ Admin Panel
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Welcome */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard 👨‍💼
          </h1>
          <p className="text-gray-600">
            Manage users and access permissions for BarakahTool
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.purchased_features_count > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">New Today</h3>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter(u =>
                new Date(u.created_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admins</h3>
            <p className="text-3xl font-bold text-orange-600">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>

        {/* Grant Access Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Grant Feature Access</h2>
          <form onSubmit={handleGrantAccess} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="email"
                value={grantAccessForm.email}
                onChange={(e) => setGrantAccessForm({
                  ...grantAccessForm,
                  email: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feature
              </label>
              <select
                value={grantAccessForm.product_type}
                onChange={(e) => setGrantAccessForm({
                  ...grantAccessForm,
                  product_type: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="story_generator">Story Generator</option>
                <option value="dua_generator">Dua Generator</option>
                <option value="name_poster">Name Poster</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                value={grantAccessForm.expires_days}
                onChange={(e) => setGrantAccessForm({
                  ...grantAccessForm,
                  expires_days: parseInt(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="1"
                max="3650"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isGrantingAccess}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                {isGrantingAccess ? 'Granting...' : 'Grant Access'}
              </button>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Users</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : (
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
                      Features
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 ml-2">
                            {user.email}
                          </div>
                          {!user.email_verified && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.purchased_features_count} features
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setGrantAccessForm({...grantAccessForm, email: user.email})}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Grant Access
                          </button>
                          <button
                            onClick={() => handleRevokeAccess(user.email, 'all')}
                            className="text-orange-600 hover:text-orange-900 font-medium"
                          >
                            Revoke Access
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete User'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard