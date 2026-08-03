import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

export default function Register() {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', birthDate: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors ?? {})
      } else {
        setError('Не удалось зарегистрироваться')
      }
    }
  }

  return (
    <div className="page">
      <div className="card card-narrow">
        <h1>Регистрация</h1>
        <p className="subtitle">Требуется возраст 18+, пароль от 8 символов с цифрой и заглавной буквой</p>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullName">ФИО</label>
            <input
              id="fullName"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              required
            />
            {fieldErrors.fullName && (
              <div className="field-error">{fieldErrors.fullName.join(', ')}</div>
            )}
          </div>
          <div className="field">
            <label htmlFor="birthDate">Дата рождения</label>
            <input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => update('birthDate', e.target.value)}
              required
            />
            {fieldErrors.birthDate && (
              <div className="field-error">{fieldErrors.birthDate.join(', ')}</div>
            )}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email.join(', ')}</div>}
          </div>
          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
            {fieldErrors.password && (
              <div className="field-error">{fieldErrors.password.join(', ')}</div>
            )}
          </div>
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="form-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
