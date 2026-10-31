import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'todo-react-bootstrap-tasks'
const filters = { all: 'همه', active: 'در انتظار', done: 'انجام‌شده' }

function getTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

export default function App() {
  const [tasks, setTasks] = useState(getTasks)
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks])
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const statusMatches = filter === 'all' || (filter === 'done' ? task.done : !task.done)
    return statusMatches && task.title.toLowerCase().includes(query.trim().toLowerCase())
  }), [tasks, query, filter])
  const remaining = tasks.filter((task) => !task.done).length
  const completed = tasks.length - remaining
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const updateTask = (id, updates) => setTasks((current) => current.map((task) => task.id === id ? { ...task, ...updates } : task))

  function addTask(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    setTasks((current) => [{ id: crypto.randomUUID(), title: cleanTitle, done: false }, ...current])
    setTitle('')
  }

  function saveEdit(id) {
    if (editTitle.trim()) updateTask(id, { title: editTitle.trim() })
    setEditingId(null)
  }

  return (
    <main className="container py-5">
      <div className="todo-card card border-0 shadow-sm mx-auto overflow-hidden">
        <div className="card-body p-4 p-md-5">
          <header className="mb-4">
            <span className="badge text-bg-success-subtle text-success-emphasis rounded-pill px-3 py-2 mb-3">برنامه‌ریزی روزانه</span>
            <div className="d-flex justify-content-between align-items-center gap-3">
              <h1 className="h2 fw-bold mb-2">کارهای من</h1>
              <span className="today-label">امروز</span>
            </div>
            <p className="text-secondary mb-0">{tasks.length ? `${remaining} کار در انتظار از ${tasks.length} کار` : 'هنوز کاری ثبت نشده است.'}</p>
          </header>

          <form className="input-group mb-3" onSubmit={addTask}>
            <input className="form-control form-control-lg" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="120" placeholder="مثلاً: تماس با مشتری" required />
            <button className="btn btn-success px-4" type="submit">افزودن</button>
          </form>

          <div className="progress-section mb-4">
            <div className="d-flex justify-content-between small mb-2"><span>پیشرفت امروز</span><strong>{progress}٪</strong></div>
            <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar bg-success" style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-2">
            <div className="input-group input-group-sm search-box">
              <span className="input-group-text bg-white">⌕</span>
              <input className="form-control border-start-0" value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="جست‌وجوی کارها" />
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="btn-group btn-group-sm" role="group" aria-label="فیلتر وضعیت">
                {Object.entries(filters).map(([key, label]) => <button className={`btn ${filter === key ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setFilter(key)} type="button" key={key}>{label}</button>)}
              </div>
              {completed > 0 && <button className="btn btn-sm btn-link text-danger text-nowrap p-0" onClick={() => setTasks((current) => current.filter((task) => !task.done))} type="button">پاک‌سازی</button>}
            </div>
          </div>

          {visibleTasks.length ? <ul className="list-group list-group-flush">
            {visibleTasks.map((task) => <li className={`task-row list-group-item px-0 py-3 d-flex align-items-center gap-3 ${task.done ? 'is-done' : ''}`} key={task.id}>
              <input className="form-check-input task-check m-0" checked={task.done} onChange={() => updateTask(task.id, { done: !task.done })} type="checkbox" />
              {editingId === task.id ? <input className="form-control form-control-sm" autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveEdit(task.id); if (event.key === 'Escape') setEditingId(null) }} /> : <span className={`flex-grow-1 ${task.done ? 'text-decoration-line-through text-secondary' : ''}`}>{task.title}</span>}
              <div className="btn-group btn-group-sm">
                {editingId === task.id ? <button className="btn btn-outline-success" onClick={() => saveEdit(task.id)} type="button">ذخیره</button> : <button className="btn btn-outline-secondary" onClick={() => { setEditingId(task.id); setEditTitle(task.title) }} type="button">ویرایش</button>}
                <button className="btn btn-outline-danger" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))} type="button">حذف</button>
              </div>
            </li>)}
          </ul> : <div className="text-center text-secondary py-5">
            <div className="empty-icon bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3">✓</div>
            <p className="fw-semibold text-dark mb-1">فهرست شما خالی است</p>
            <small>اولین کارتان را از بالا اضافه کنید.</small>
          </div>}
        </div>
      </div>
    </main>
  )
}
