import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page">
      <div className="card">
        <h1>User Support Service</h1>
        <p className="subtitle">
          Сервис регистрации и управления пользователями с ролями (admin/user) и статусами
          (активен/заблокирован). Бэкенд — NestJS + Prisma + PostgreSQL, фронтенд — React + TypeScript.
        </p>

        {user ? (
          <Link className="btn" to="/dashboard" style={{ display: 'inline-flex', width: 'auto' }}>
            Перейти в профиль
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <Link className="btn" to="/login" style={{ width: 'auto' }}>
              Войти
            </Link>
            <Link className="btn" to="/register" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border)' }}>
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
