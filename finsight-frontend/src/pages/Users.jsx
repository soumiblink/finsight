import { useEffect, useState } from 'react'
import { RefreshCw, Users2 } from 'lucide-react'
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

  const activeCount = users.filter((u) => u.is_active).length

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage roles and access for all users</p>
          </div>
          <Button variant="secondary" size="sm" onClick={load} loading={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        {/* Stats strip */}
        {!loading && users.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users2 size={13} className="text-slate-600" />
              <span className="text-slate-300 font-semibold">{users.length}</span> total users
            </span>
            <span className="w-px h-3 bg-slate-800" />
            <span>
              <span className="text-emerald-400 font-semibold">{activeCount}</span> active
            </span>
            <span className="w-px h-3 bg-slate-800" />
            <span>
              <span className="text-slate-400 font-semibold">{users.length - activeCount}</span> inactive
            </span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['User', 'Email', 'Role', 'Status', 'Change Role', 'Active'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon="👥" title="No users found" />
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 shadow-sm">
                            {u.username?.[0] ?? '?'}
                          </div>
                          <span className="font-medium text-slate-200 text-sm">{u.username}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-4 text-slate-500 text-xs">{u.email || '—'}</td>
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
                          className="text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
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
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 ${
                            u.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                            u.is_active ? 'translate-x-4' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          {!loading && users.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-800/60">
              <p className="text-xs text-slate-600">{users.length} user{users.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
