import type { Role } from '../types/user'

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  )
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`badge ${isActive ? 'badge-active' : 'badge-blocked'}`}>
      {isActive ? 'Активен' : 'Заблокирован'}
    </span>
  )
}
