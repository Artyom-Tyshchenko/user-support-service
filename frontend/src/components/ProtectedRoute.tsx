import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/user'

export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode
  requireRole?: Role
}) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (requireRole && user.role !== requireRole) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
