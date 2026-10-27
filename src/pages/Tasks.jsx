import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TaskItem from '../components/TaskItem'

function Tasks({ tasks, groups, onAddTask, onToggleTask, onDeleteTask, onUpdateTask, onReorderTask }) {
  const [taskText, setTaskText] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [searchParams] = useSearchParams()
  const taskInputRef = useRef(null)
  const searchTerm = (searchParams.get('search') || '').trim().toLowerCase()
  const completedTasks = tasks.filter((task) => task.done).length
  const pendingTasks = tasks.length - completedTasks
  const taskStats = [
    { label: 'Total', value: tasks.length },
    { label: 'Completed', value: completedTasks },
    { label: 'Pending', value: pendingTasks },
  ]

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      taskInputRef.current?.focus()
    }
  }, [searchParams])

  const filteredTasks = tasks.filter((task) => {
    const matchesGroup = groupFilter === 'all'
      || (groupFilter === 'ungrouped' ? !task.groupId : task.groupId === groupFilter)
    return matchesGroup && task.text.toLowerCase().includes(searchTerm)
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    onAddTask(taskText, selectedGroupId)
    setTaskText('')
    setSelectedGroupId('')
    taskInputRef.current?.focus()
  }

  return (
    <section className="task-page">
      <header className="page-heading task-heading">
        <div>
          <p className="eyebrow">YOUR TASKS</p>
          <h1>Welcome back</h1>
          <p className="heading-subtitle">Here’s your task overview.</p>
        </div>
        {groups.length > 0 && (
          <label className="group-filter">
            <span>Show</span>
            <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
              <option value="all">All tasks</option>
              <option value="ungrouped">No group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
        )}
      </header>

      <section className="task-overview" aria-label="Task overview">
        {taskStats.map((stat) => (
          <div className="task-stat" key={stat.label}>
            <span className="task-stat-value">{stat.value}</span>
            <span className="task-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      <form onSubmit={handleSubmit} className="task-composer">
        <span className="composer-plus"><span aria-hidden="true">+</span></span>
        <input
          ref={taskInputRef}
          id="new-task"
          type="text"
          value={taskText}
          onChange={(event) => setTaskText(event.target.value)}
          placeholder="Add a task"
          aria-label="Add a task"
        />
        {groups.length > 0 && (
          <select
            aria-label="Task group"
            value={selectedGroupId}
            onChange={(event) => setSelectedGroupId(event.target.value)}
          >
            <option value="">No group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        )}
        <button type="submit" disabled={!taskText.trim()}>Add</button>
      </form>

      {filteredTasks.length === 0 ? (
        <div className="empty-tasks">
          <span className="empty-check" aria-hidden="true">✓</span>
          <h2>{searchTerm ? 'No matching tasks' : 'All clear'}</h2>
          <p>
            {searchTerm
              ? 'Try another search to find what you need.'
              : tasks.length === 0
                ? 'Add a task above to get started.'
                : 'There are no tasks in this view.'}
          </p>
        </div>
      ) : (
        <ul className="task-list" aria-label="Tasks">
          {filteredTasks.map((task) => {
            const currentGroup = groups.find((group) => group.id === task.groupId)
            return (
              <TaskItem
                key={task.id}
                task={task}
                groupName={currentGroup?.name}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onReorderTask={onReorderTask}
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default Tasks
