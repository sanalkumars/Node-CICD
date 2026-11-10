import { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Could not load tasks.');
        setTasks(await response.json());
      } catch {
        setError('Could not connect to the server. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setError('');
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (!response.ok) throw new Error('Could not add task.');
      const task = await response.json();
      setTasks((currentTasks) => [...currentTasks, task]);
      setTitle('');
    } catch {
      setError('Could not add your task. Please try again.');
    }
  }

  return (
    <main className="page">
      <section className="task-card" aria-labelledby="page-title">
        <p className="eyebrow">A little at a time</p>
        <h1 id="page-title">My tasks</h1>
        <p className="subtitle">Keep track of what you want to get done.</p>

        <form className="task-form" onSubmit={addTask}>
          <label className="visually-hidden" htmlFor="task-title">
            New task
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Learn how Docker works"
            maxLength={200}
            required
          />
          <button type="submit">Add task</button>
        </form>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="list-heading">
          <h2>Your list</h2>
          <span>{tasks.length}</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading your tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add one to get started.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li className="task-item" key={task.id}>
                <span className="task-dot" aria-hidden="true" />
                <span>{task.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer>Simple tasks, served by Express.</footer>
    </main>
  );
}

export default App;
