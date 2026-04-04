import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { getUsers, updateRole, updateStatus } from '../api/users'

const ROLES = ['viewer', 'analyst', 'admin']

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState({})

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getUsers()
      setUsers(res.data?.results ?? res.data ?? [])
    } catch (e) {
      setError('Failed to load users.')
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = async (id, role) => {
    setUpdating((p) => ({ ...p, [id]: true }))
    try {
      const res = await updateRole(id, role)
      setUsers((p) => p.map((u) => u.id === id ? { ...u, role: res.data.user?.role ?? role } : u))
    } catch (e) { alert('Failed to update role.'); console.error(e) }
    finally { setUpdating((p) => ({ ...p, [id]: false })) }
  }

  const handleStatusToggle = async (id, current) => {
    setUpdating((p) => ({ ...p, [`s${id}`]: true }))
    try {
      const res = await updateStatus(id, !current)
      setUsers((p) => p.map((u) => u.id === id ? { ...u, is_active: res.data.user?.is_active ?? !current } : u))
    } catch (e) { alert('Failed to update status.'); console.error(e) }
    finally { setUpdating((p) => ({ ...p, [`s${id}`]: false })) }
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage roles and access for all users</p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : users.length === 0 ? (
            <EmptyState icon="👥" title="No users found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['User', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase">
                            {u.username?.[0] ?? '?'}
                          </div>
                          <span className="font-medium text-gray-800">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email || '—'}</td>
                      <td className="px-5 py-4">
                        <Badge label={u.role} type={u.role} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={u.is_active ? 'Active' : 'Inactive'} type={u.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Role selector */}
                          <select
                            value={u.role}
                            disabled={updating[u.id]}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                          </select>

                          {/* Active toggle */}
                          <button
                            disabled={updating[`s${u.id}`]}
                            onClick={() => handleStatusToggle(u.id, u.is_active)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                              u.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              u.is_active ? 'translate-x-4' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
