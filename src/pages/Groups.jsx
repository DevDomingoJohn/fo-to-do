import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const groupColors = [
  { name: 'Ocean', className: 'bg-blue-500', value: '#3b82f6' },
  { name: 'Meadow', className: 'bg-emerald-500', value: '#10b981' },
  { name: 'Sunset', className: 'bg-amber-500', value: '#f59e0b' },
  { name: 'Berry', className: 'bg-rose-500', value: '#f43f5e' },
  { name: 'Violet', className: 'bg-violet-500', value: '#8b5cf6' },
  { name: 'Sky', className: 'bg-cyan-500', value: '#06b6d4' },
]

function Groups({ groups, tasks, onAddGroup, onUpdateGroup, onDeleteGroup, onReorderGroup }) {
  const [draggedGroupId, setDraggedGroupId] = useState(null)
  const [dropGroupId, setDropGroupId] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialGroupToEdit = groups.find((group) => group.id === searchParams.get('edit')) || null
  const initialGroupColor = groupColors.some((option) => option.className === initialGroupToEdit?.color)
    ? initialGroupToEdit.color
    : groupColors[0].className
  const [isDialogOpen, setIsDialogOpen] = useState(Boolean(initialGroupToEdit))
  const [editingGroup, setEditingGroup] = useState(initialGroupToEdit)
  const [groupName, setGroupName] = useState(initialGroupToEdit?.name || '')
  const [description, setDescription] = useState(initialGroupToEdit?.description || '')
  const [color, setColor] = useState(initialGroupColor)
  const nameInputRef = useRef(null)

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingGroup(null)
    setGroupName('')
    setDescription('')
    setColor(groupColors[0].className)
    if (searchParams.has('edit')) setSearchParams({})
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (isDialogOpen) nameInputRef.current?.focus()
  }, [isDialogOpen])

  useEffect(() => {
    if (!isDialogOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDialog()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDialog, isDialogOpen])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!groupName.trim()) return

    const groupDetails = { name: groupName, description, color }
    if (editingGroup) {
      onUpdateGroup(editingGroup.id, groupDetails)
    } else {
      onAddGroup(groupDetails)
    }
    closeDialog()
  }

  const openCreateDialog = () => {
    setEditingGroup(null)
    setGroupName('')
    setDescription('')
    setColor(groupColors[0].className)
    setIsDialogOpen(true)
  }

  const beginEditing = (group) => {
    setEditingGroup(group)
    setGroupName(group.name)
    setDescription(group.description || '')
    setColor(
      groupColors.some((option) => option.className === group.color)
        ? group.color
        : groupColors[0].className,
    )
    setIsDialogOpen(true)
  }

  const openEditDialog = (event, group) => {
    event.preventDefault()
    event.stopPropagation()
    beginEditing(group)
  }

  const handleGroupDragStart = (event, groupId) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', groupId)
    setDraggedGroupId(groupId)
  }

  const handleGroupDragOver = (event, groupId) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropGroupId(groupId)
  }

  const handleGroupDrop = (event, targetId) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain')
    const bounds = event.currentTarget.getBoundingClientRect()
    onReorderGroup(sourceId, targetId, event.clientY > bounds.top + bounds.height / 2)
    setDraggedGroupId(null)
    setDropGroupId(null)
  }

  const handleGroupDragEnd = () => {
    setDraggedGroupId(null)
    setDropGroupId(null)
  }

  return (
    <div className="groups-page py-10">
      <div className="mb-8">
        <p className="eyebrow">ORGANIZE YOUR TASKS</p>
        <h1 className="text-3xl font-bold text-ink">Task Groups</h1>
      </div>

      <div className="groups-toolbar">
        <p>Create a space for tasks that belong together.</p>
        <button type="button" className="create-group-button" onClick={openCreateDialog}>
          Create task group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="groups-empty">
          <h2>No task groups yet</h2>
          <p>Create a group to keep related tasks together.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const groupTasks = tasks.filter((task) => task.groupId === group.id)
            const doneCount = groupTasks.filter((task) => task.done).length
            const progress = groupTasks.length === 0 ? 0 : (doneCount / groupTasks.length) * 100

            const selectedColor = groupColors.find((option) => option.className === group.color)

            return (
              <article
                key={group.id}
                draggable
                onDragStart={(event) => handleGroupDragStart(event, group.id)}
                onDragOver={(event) => handleGroupDragOver(event, group.id)}
                onDrop={(event) => handleGroupDrop(event, group.id)}
                onDragEnd={handleGroupDragEnd}
                className={`group-card rounded-xl border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md${draggedGroupId === group.id ? ' is-dragging' : ''}${dropGroupId === group.id ? ' is-drop-target' : ''}`}
              >
                <span className="group-drag-handle" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <circle cx="5" cy="4" r="1" />
                    <circle cx="11" cy="4" r="1" />
                    <circle cx="5" cy="8" r="1" />
                    <circle cx="11" cy="8" r="1" />
                    <circle cx="5" cy="12" r="1" />
                    <circle cx="11" cy="12" r="1" />
                  </svg>
                </span>
                <Link to={`/groups/${group.id}`} className="group-card-link">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor?.value || '#7eaaa1' }} />
                    <h2 className="text-lg font-semibold text-ink">{group.name}</h2>
                  </div>
                  {group.description && <p className="group-description">{group.description}</p>}
                  <p className="text-sm text-muted">
                    {doneCount} of {groupTasks.length} tasks completed
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-panel-raised">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: selectedColor?.value || '#7eaaa1',
                      }}
                    ></div>
                  </div>
                </Link>
                <button
                  type="button"
                  className="group-edit-trigger"
                  aria-label={`Edit ${group.name} task group`}
                  title={`Edit ${group.name}`}
                  onClick={(event) => openEditDialog(event, group)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="group-delete-trigger"
                  aria-label={`Delete ${group.name} task group`}
                  title={`Delete ${group.name}`}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onDeleteGroup(group.id)
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" />
                  </svg>
                </button>
              </article>
            )
          })}
        </div>
      )}

      {isDialogOpen && (
        <div
          className="group-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section
            className="group-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-dialog-title"
          >
            <header className="group-dialog-header">
              <div>
                <p className="eyebrow">{editingGroup ? 'UPDATE YOUR TASK SPACE' : 'MAKE A SPACE FOR YOUR TASKS'}</p>
                <h2 id="group-dialog-title">{editingGroup ? 'Edit task group' : 'Create task group'}</h2>
              </div>
              <button type="button" className="group-dialog-close" aria-label="Close" onClick={closeDialog}>
                ×
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="group-dialog-body">
                <label className="group-form-field" htmlFor="group-name">
                  <span>Name</span>
                  <input
                    ref={nameInputRef}
                    id="group-name"
                    type="text"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    maxLength={60}
                    placeholder="e.g. School, Work, or Personal"
                    required
                  />
                </label>

                <label className="group-form-field" htmlFor="group-description">
                  <span>Description <small>Optional</small></span>
                  <textarea
                    id="group-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={180}
                    rows={3}
                    placeholder="What kind of tasks belong here?"
                  />
                </label>

                <fieldset className="group-form-field group-color-field">
                  <legend>Color</legend>
                  <div className="group-color-options">
                    {groupColors.map((option) => (
                      <button
                        key={option.className}
                        type="button"
                        className={`group-color-option${color === option.className ? ' selected' : ''}`}
                        aria-label={`${option.name} color`}
                        aria-pressed={color === option.className}
                        onClick={() => setColor(option.className)}
                      >
                        <span className={`group-color-swatch ${option.className}`} />
                        <span>{option.name}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <footer className="group-dialog-footer">
                <button type="button" className="group-cancel-button" onClick={closeDialog}>Cancel</button>
                <button type="submit" className="create-group-button" disabled={!groupName.trim()}>
                  {editingGroup ? 'Save changes' : 'Create group'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Groups
