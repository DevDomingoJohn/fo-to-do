import { Link } from 'react-router-dom'

function Home({ tasks }) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.done).length
  const pendingTasks = totalTasks - completedTasks

  const summaryCards = [
    { label: 'Total Tasks', value: totalTasks, color: 'bg-accent' },
    { label: 'Completed', value: completedTasks, color: 'bg-emerald-500' },
    { label: 'Pending', value: pendingTasks, color: 'bg-amber-500' },
  ]

  return (
    <div className="flex flex-col gap-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ink">Welcome to fo-to-do</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Stay organized, keep track of your progress, and make time for what matters.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3 self-center">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-line bg-panel p-5 shadow-sm">
            <div className={`mb-3 inline-flex h-3 w-12 rounded-full ${card.color}`} />
            <p className="text-sm font-medium text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/tasks"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-[#241e1c] hover:bg-accent-hover"
        >
          Manage Tasks
        </Link>
        <Link
          to="/groups"
          className="rounded-lg border border-line px-5 py-2.5 font-medium text-ink hover:bg-panel-raised"
        >
          View Task Groups
        </Link>
        <Link
          to="/guide"
          className="rounded-lg border border-line px-5 py-2.5 font-medium text-ink hover:bg-panel-raised"
        >
          Read the Guide
        </Link>
      </div>
    </div>
  )
}

export default Home
