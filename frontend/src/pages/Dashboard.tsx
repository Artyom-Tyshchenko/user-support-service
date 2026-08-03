import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest, ApiError } from '../api/client'
import type { User } from '../types/user'
import { RoleBadge, StatusBadge } from '../components/Badges'

export default function Dashboard() {
  const { user, token, refreshUser, logout } = useAuth()
  const [isBlocking, setIsBlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  async function handleSelfBlock() {
    if (!confirm('Заблокировать собственный аккаунт? Это действие нельзя отменить самостоятельно.')) {
      return
    }
    setIsBlocking(true)
    setError(null)
    try {
      await apiRequest<{ user: User }>(`/api/users/${user!.id}/block`, {
        method: 'PATCH',
        token,
      })
      await refreshUser()
      logout()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось заблокировать аккаунт')
      setIsBlocking(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>{user.fullName}</h1>
        <p className="subtitle">{user.email}</p>

        <div>
          <RoleBadge role={user.role} /> <StatusBadge isActive={user.isActive} />
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <span>Дата рождения</span>
            {new Date(user.birthDate).toLocaleDateString('ru-RU')}
          </div>
          <div className="profile-item">
            <span>Роль</span>
            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </div>
          <div className="profile-item">
            <span>Статус</span>
            {user.isActive ? 'Активен' : 'Заблокирован'}
          </div>
          <div className="profile-item">
            <span>Зарегистрирован</span>
            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>

        {error && (
          <div className="alert" style={{ marginTop: '1.2rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn-danger" onClick={handleSelfBlock} disabled={isBlocking}>
            {isBlocking ? 'Блокируем…' : 'Заблокировать свой аккаунт'}
          </button>
        </div>
      </div>
    </div>
  )
}
