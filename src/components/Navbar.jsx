import appIcon from '../assets/fo-to-do-icon.svg'
import { useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const groupColorValues = {
  'bg-blue-500': '#3b82f6',
  'bg-emerald-500': '#10b981',
  'bg-amber-500': '#f59e0b',
  'bg-rose-500': '#f43f5e',
  'bg-violet-500': '#8b5cf6',
  'bg-cyan-500': '#06b6d4',
}

function Icon({ name, className = '' }) {
  const shared = {
    className,
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'search') {
    return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
  }
  if (name === 'inbox') {
    return <svg {...shared}><path d="M4 5h16v14H4z" /><path d="M4 13h4l2 3h4l2-3h4" /></svg>
  }
  if (name === 'group') {
    return <svg {...shared}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h5" /></svg>
  }
  if (name === 'guide') {
    return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.4 1.6c-1.2 1.2-2 1.5-2 3M12 17h.01" /></svg>
  }
  return <svg {...shared}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}

function Navbar({ groups, tasks, onReorderGroup, sidebarWidth, onSidebarWidthChange }) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [draggedGroupId, setDraggedGroupId] = useState(null)
  const [dropGroupId, setDropGroupId] = useState(null)
  const resizeStart = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchText = searchParams.get('search') || ''
  const isTaskPage = location.pathname === '/' || location.pathname === '/tasks'
  const pendingCount = tasks.filter((task) => !task.done).length

  const updateSearch = (event) => {
    const value = event.target.value

    if (location.pathname !== '/' && location.pathname !== '/tasks') {
      navigate(`/tasks${value ? `?search=${encodeURIComponent(value)}` : ''}`)
      return
    }

    setSearchParams(value ? { search: value } : {})
  }

  const navClassName = ({ isActive }) =>
    `sidebar-link${isActive ? ' sidebar-link-active' : ''}`

  const getResizeLimits = () => ({
    min: 200,
    max: Math.max(200, Math.min(420, window.innerWidth * 0.48)),
  })

  const handleResizeStart = (event) => {
    if (event.button !== 0) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeStart.current = { pointerX: event.clientX, width: sidebarWidth }
    setIsResizing(true)
  }

  const handleResizeMove = (event) => {
    if (!resizeStart.current) return

    const limits = getResizeLimits()
    const nextWidth = resizeStart.current.width + event.clientX - resizeStart.current.pointerX
    onSidebarWidthChange(Math.max(limits.min, Math.min(limits.max, nextWidth)))
  }

  const handleResizeEnd = () => {
    resizeStart.current = null
    setIsResizing(false)
  }

  const handleResizeKeyDown = (event) => {
    const limits = getResizeLimits()
    const step = event.shiftKey ? 40 : 16
    let nextWidth

    if (event.key === 'ArrowLeft') nextWidth = sidebarWidth - step
    else if (event.key === 'ArrowRight') nextWidth = sidebarWidth + step
    else if (event.key === 'Home') nextWidth = limits.min
    else if (event.key === 'End') nextWidth = limits.max
    else return

    event.preventDefault()
    onSidebarWidthChange(Math.max(limits.min, Math.min(limits.max, nextWidth)))
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
    <aside className={`sidebar${isResizing ? ' sidebar-resizing' : ''}`}>
      <Link to="/tasks" className="brand" aria-label="fo-to-do tasks">
        <img className="brand-mark" src={appIcon} alt="" aria-hidden="true" />
        <span>fo-to-do</span>
      </Link>

      <label className="sidebar-search">
        <Icon name="search" />
        <input
          aria-label="Search tasks"
          type="search"
          placeholder="Search"
          value={searchText}
          onChange={updateSearch}
        />
        {searchText && (
          <button
            type="button"
            aria-label="Clear search"
            className="clear-search"
            onClick={() => {
              setSearchParams({})
            }}
          >
            ×
          </button>
        )}
      </label>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink to="/tasks" className={() => `sidebar-link${isTaskPage ? ' sidebar-link-active' : ''}`}>
          <Icon name="inbox" />
          <span>Task</span>
          {pendingCount > 0 && <span className="sidebar-count">{pendingCount}</span>}
        </NavLink>
        <div className="sidebar-group-heading">
          <NavLink to="/groups" className={navClassName}>
            <Icon name="group" />
            <span>Task Groups</span>
          </NavLink>
          <button
            type="button"
            className="sidebar-group-toggle"
            aria-label={groupsExpanded ? 'Collapse task groups' : 'Expand task groups'}
            aria-expanded={groupsExpanded}
            aria-controls="sidebar-task-groups"
            onClick={() => setGroupsExpanded((expanded) => !expanded)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
        {groupsExpanded && (
          <div className="sidebar-group-list" aria-label="Your task groups">
            {groups.map((group) => (
              <NavLink
                key={group.id}
                to={`/groups/${group.id}`}
                draggable
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' sidebar-link-active' : ''}${draggedGroupId === group.id ? ' is-dragging' : ''}${dropGroupId === group.id ? ' is-drop-target' : ''}`
                }
                onDragStart={(event) => handleGroupDragStart(event, group.id)}
                onDragOver={(event) => handleGroupDragOver(event, group.id)}
                onDrop={(event) => handleGroupDrop(event, group.id)}
                onDragEnd={handleGroupDragEnd}
              >
                <span
                  className="group-dot"
                  style={{ backgroundColor: groupColorValues[group.color] || '#7eaaa1' }}
                />
                <span className="sidebar-group-name">{group.name}</span>
              </NavLink>
            ))}
            {groups.length === 0 && <p className="sidebar-empty-groups">No groups yet</p>}
          </div>
        )}
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/developers" className={navClassName}>
          <Icon name="person" />
          <span>Developers</span>
        </NavLink>
        <NavLink to="/guide" className={navClassName}>
          <Icon name="guide" />
          <span>Guide</span>
        </NavLink>
      </div>

      <button
        type="button"
        className="sidebar-resize-handle"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuemin={200}
        aria-valuemax={Math.max(200, Math.min(420, Math.round(window.innerWidth * 0.48)))}
        aria-valuenow={Math.round(sidebarWidth)}
        title="Drag to resize sidebar"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        onKeyDown={handleResizeKeyDown}
      />
    </aside>
  )
}

export default Navbar
