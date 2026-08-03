import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest, ApiError } from '../api/client'
import type { User, UsersListResult } from '../types/user'
import { RoleBadge, StatusBadge } from '../components/Badges'

const PAGE_SIZE = 10

export default function Users() {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blockingId, setBlockingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiRequest<UsersListResult>(
        `/api/users?page=${page}&limit=${PAGE_SIZE}`,
        { token },
      )
      setUsers(result.users)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить список')
    } finally {
      setIsLoading(false)
    }
  }, [page, token])

  useEffect(() => {
    load()
  }, [load])

  async function handleBlock(id: string) {
    if (!confirm('Заблокировать этого пользователя?')) return
    setBlockingId(id)
    try {
      await apiRequest(`/api/users/${id}/block`, { method: 'PATCH', token })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось заблокировать пользователя')
    } finally {
      setBlockingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="page">
      <div className="card">
        <h1>Пользователи</h1>
        <p className="subtitle">Доступно только администраторам · всего: {total}</p>

        {error && <div className="alert">{error}</div>}

        {isLoading ? (
          <p className="spinner-text">Загрузка…</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      <StatusBadge isActive={u.isActive} />
                    </td>
                    <td>
                      {u.isActive && (
                        <button
                          className="btn-danger"
                          onClick={() => handleBlock(u.id)}
                          disabled={blockingId === u.id}
                        >
                          {blockingId === u.id
                            ? 'Блокируем…'
                            : u.id === currentUser?.id
                              ? 'Заблокировать себя'
                              : 'Заблокировать'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Назад
              </button>
              <span>
                Страница {page} из {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Вперёд →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
