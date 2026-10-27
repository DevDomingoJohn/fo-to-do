import { useRef, useState } from 'react'

const deleteThreshold = 110
const maxSwipeDistance = 180
const emptyDragState = { startX: 0, offset: 0 }

function TaskItem({ task, groupName, onToggleTask, onDeleteTask, onUpdateTask, onReorderTask }) {
  const [dragState, setDragState] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [dropPosition, setDropPosition] = useState(null)
  const [isReordering, setIsReordering] = useState(false)
  const editInputRef = useRef(null)
  const isDragging = dragState !== null
  const offset = dragState?.offset ?? 0

  const handlePointerDown = (event) => {
    if (isEditing || event.button !== 0 || event.target.closest('input, button, select, [data-reorder-handle]')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    setDragState({ ...emptyDragState, startX: event.clientX })
  }

  const handlePointerMove = (event) => {
    if (!dragState) return

    const nextOffset = Math.min(maxSwipeDistance, Math.max(0, event.clientX - dragState.startX))
    setDragState((current) => current ? { ...current, offset: nextOffset } : null)
  }

  const handlePointerUp = () => {
    if (!isEditing && dragState?.offset >= deleteThreshold) {
      onDeleteTask(task.id)
    }
    setDragState(null)
  }

  const startEditing = () => {
    setEditText(task.text)
    setIsEditing(true)
    requestAnimationFrame(() => editInputRef.current?.focus())
  }

  const cancelEditing = () => {
    setEditText(task.text)
    setIsEditing(false)
  }

  const saveEditing = (event) => {
    event.preventDefault()
    const trimmedText = editText.trim()
    if (!trimmedText) {
      editInputRef.current?.focus()
      return
    }

    onUpdateTask(task.id, trimmedText)
    setIsEditing(false)
  }

  const handleEditKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditing()
    }
  }

  const handleDragStart = (event) => {
    if (isEditing || !event.target.closest('[data-reorder-handle]')) {
      event.preventDefault()
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(task.id))
    setIsReordering(true)
  }

  const handleDragOver = (event) => {
    if (!event.dataTransfer.types.includes('text/plain')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const bounds = event.currentTarget.getBoundingClientRect()
    setDropPosition(event.clientY > bounds.top + bounds.height / 2 ? 'after' : 'before')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain')
    const bounds = event.currentTarget.getBoundingClientRect()
    onReorderTask(
      sourceId,
      String(task.id),
      event.clientY > bounds.top + bounds.height / 2,
    )
    setDropPosition(null)
  }

  const handleDragEnd = () => {
    setIsReordering(false)
    setDropPosition(null)
  }

  const handleReorderKeyDown = (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const currentItem = event.currentTarget.closest('.task-row-wrap')
    const sibling = event.key === 'ArrowUp'
      ? currentItem.previousElementSibling
      : currentItem.nextElementSibling
    const targetId = sibling?.dataset.taskId
    if (targetId) {
      onReorderTask(String(task.id), targetId, event.key === 'ArrowDown')
    }
  }

  return (
    <li
      className={`task-row-wrap${isReordering ? ' is-dragging' : ''}${dropPosition ? ` drop-${dropPosition}` : ''}`}
      data-task-id={String(task.id)}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      <div className="task-delete-hint">
        <span className={offset > 0 ? 'opacity-100' : 'opacity-0'}>
          {offset >= deleteThreshold ? 'Release to delete' : 'Delete'}
        </span>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragState(null)}
        className={`task-row${isEditing ? ' task-row-editing' : ''}`}
        style={{
          transform: `translateX(${offset}px)`,
          touchAction: isEditing ? 'auto' : 'pan-y',
          transitionDuration: isDragging ? '0ms' : undefined,
        }}
      >
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggleTask(task.id)}
          aria-label={`Mark "${task.text}" as ${task.done ? 'not done' : 'done'}`}
          className="task-checkbox"
        />
        {isEditing ? (
          <form className="task-edit-form" onSubmit={saveEditing}>
            <input
              ref={editInputRef}
              className="task-edit-input"
              type="text"
              aria-label={`Edit task: ${task.text}`}
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              onKeyDown={handleEditKeyDown}
              maxLength={200}
            />
            <div className="task-edit-actions">
              <button
                type="button"
                className="task-edit-button task-edit-cancel"
                aria-label={`Cancel editing: ${task.text}`}
                title="Cancel"
                onClick={cancelEditing}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
              <button
                type="submit"
                className="task-edit-button task-edit-save"
                aria-label={`Save task: ${task.text}`}
                title="Save"
                disabled={!editText.trim()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <>
            <span
              className="task-reorder-handle"
              data-reorder-handle
              draggable
              role="button"
              tabIndex={0}
              aria-label={`Reorder ${task.text}. Use up and down arrows to move.`}
              title="Drag to reorder"
              onKeyDown={handleReorderKeyDown}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="5" cy="4" r="1" />
                <circle cx="11" cy="4" r="1" />
                <circle cx="5" cy="8" r="1" />
                <circle cx="11" cy="8" r="1" />
                <circle cx="5" cy="12" r="1" />
                <circle cx="11" cy="12" r="1" />
              </svg>
            </span>
            <span className={task.done ? 'task-text task-text-done' : 'task-text'}>
              {task.text}
            </span>
            {groupName ? <span className="task-group-tag">{groupName}</span> : null}
            <button
              type="button"
              className="task-edit-trigger"
              aria-label={`Edit task: ${task.text}`}
              title="Edit task"
              onClick={startEditing}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </li>
  )
}

export default TaskItem
