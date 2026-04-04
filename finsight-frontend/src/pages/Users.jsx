import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonRow } from '../components/ui/SkeletonRow'
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
      toast.success('Role updated')
    } catch (e) {
      toast.error('Failed to update role')
      console.error(e)
    } finally { setUpdating((p) => ({ ...p, [id]: false })) }
  }

  const handleStatusToggle = async (id, current) => {
    setUpdating((p) => ({ ...p, [`s${id}`]: true }))
    try {
      const res = await updateStatus(id, !current)
      const newActive = res.data.user?.is_active ?? !current
      setUsers((p) => p.map((u) => u.id === id ? { ...u, is_active: newActive } : u))
      toast.success(newActive ? 'User activated' : 'User deactivated')
    } catch (e) {
      toast.error('Failed to update status')
      console.error(e)
    } finally { setUpdating((p) => ({ ...p, [`s${id}`]: false })) }
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage roles and access for all users</p>
          </div>
          <Button variant="secondary" size="sm" onClick={load} loading={loading}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Change Role', 'Active'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon="👥" title="No users found" />
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`transition-colors hover:bg-blue-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
                            {u.username?.[0] ?? '?'}
                          </div>
                          <span className="font-semibold text-gray-800">{u.username}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-4 text-gray-500 text-sm">{u.email || '—'}</td>
                      {/* Role badge */}
                      <td className="px-5 py-4"><Badge label={u.role} type={u.role} /></td>
                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <Badge label={u.is_active ? 'Active' : 'Inactive'} type={u.is_active ? 'active' : 'inactive'} />
                      </td>
                      {/* Role selector */}
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          disabled={updating[u.id]}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      {/* Toggle */}
                      <td className="px-5 py-4">
                        <button
                          disabled={updating[`s${u.id}`]}
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          title={u.is_active ? 'Deactivate user' : 'Activate user'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 ${
                            u.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            u.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
