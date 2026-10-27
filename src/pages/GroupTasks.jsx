import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TaskItem from '../components/TaskItem'

const groupColorValues = {
  'bg-blue-500': '#3b82f6',
  'bg-emerald-500': '#10b981',
  'bg-amber-500': '#f59e0b',
  'bg-rose-500': '#f43f5e',
  'bg-violet-500': '#8b5cf6',
  'bg-cyan-500': '#06b6d4',
}

// Selected group task list page showing tasks assigned to one category.
function GroupTasks({ groups, tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTask, onDeleteGroup, onReorderTask }) {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const group = groups.find((currentGroup) => currentGroup.id === groupId)
  const [taskText, setTaskText] = useState('')

  if (!group) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-ink">Group not found</h1>
        <Link to="/groups" className="mt-4 inline-block font-medium text-accent hover:text-accent-hover">
          &larr; Back to Task Groups
        </Link>
      </div>
    )
  }

  const groupTasks = tasks.filter((task) => task.groupId === group.id)

  const handleSubmit = (event) => {
    event.preventDefault()
    onAddTask(taskText, group.id)
    setTaskText('')
  }

  return (
    <div className="py-10">
      <Link to="/groups" className="text-sm font-medium text-accent hover:text-accent-hover">
        &larr; Back to Task Groups
      </Link>

      <div className="group-detail-heading mt-4 mb-2">
        <span
          className="group-detail-dot"
          style={{ backgroundColor: groupColorValues[group.color] || '#7eaaa1' }}
        />
        <h1 className="text-3xl font-bold text-ink">{group.name}</h1>
        <span className="rounded-full bg-panel-raised px-3 py-1 text-sm text-muted">
          {groupTasks.length} tasks
        </span>
        <Link
          to={`/groups?edit=${encodeURIComponent(group.id)}`}
          className="group-detail-edit"
          aria-label={`Edit ${group.name} task group`}
          title={`Edit ${group.name}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
          </svg>
          <span>Edit group</span>
        </Link>
        <button
          type="button"
          className="group-detail-delete"
          onClick={() => {
            if (onDeleteGroup(group.id)) navigate('/groups')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" />
          </svg>
          <span>Delete group</span>
        </button>
      </div>
      {group.description && <p className="group-detail-description">{group.description}</p>}
      <p className="mb-8 text-muted">Check a task when it is done. Swipe right to delete it.</p>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={taskText}
          onChange={(event) => setTaskText(event.target.value)}
          placeholder="Add a task to this group"
          className="flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-ink outline-none transition placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={!taskText.trim()}
          className="rounded-lg bg-accent px-4 py-2 font-medium text-[#241e1c] enabled:hover:bg-accent-hover disabled:cursor-default disabled:opacity-[0.42]"
        >
          Add Task
        </button>
      </form>

      {groupTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-panel px-4 py-8 text-center text-muted">
          No tasks yet. Add one above to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {groupTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onUpdateTask={onUpdateTask}
              onReorderTask={onReorderTask}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default GroupTasks
