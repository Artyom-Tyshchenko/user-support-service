import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()

  return (
    <div className="topbar">
      <Link to="/" className="topbar-brand">
        User Support Service
      </Link>
      <div className="topbar-actions">
        {user ? (
          <>
            <Link to="/dashboard">Профиль</Link>
            {user.role === 'admin' && <Link to="/users">Пользователи</Link>}
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </div>
  )
}
