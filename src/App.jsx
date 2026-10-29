import { useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Developers from './pages/Developers'
import GroupTasks from './pages/GroupTasks'
import Groups from './pages/Groups'
import Guide from './pages/Guide'
import Tasks from './pages/Tasks'
import './App.css'

const STORAGE_KEY = 'fo-to-do-all-tasks'
const GROUPS_STORAGE_KEY = 'fo-to-do-groups'
const THEME_STORAGE_KEY = 'fo-to-do-theme'

const ensureUniqueTaskIds = (tasks) => {
  const usedIds = new Set()

  return tasks.map((task, index) => {
    if (!usedIds.has(task.id)) {
      usedIds.add(task.id)
      return task
    }

    const baseId = `${task.groupId || 'ungrouped'}-${task.id}-${index}`
    let id = baseId
    let suffix = 1

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    usedIds.add(id)
    return { ...task, id }
  })
}

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(264)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [undoItem, setUndoItem] = useState(null)
  const undoTimerRef = useRef(null)
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [groups, setGroups] = useState(() => {
    try {
      const savedGroups = window.localStorage.getItem(GROUPS_STORAGE_KEY)
      if (!savedGroups) return []

      const parsedGroups = JSON.parse(savedGroups)
      return Array.isArray(parsedGroups) ? parsedGroups : []
    } catch {
      return []
    }
  })

  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY)
      if (!savedTasks) return []

      const parsedTasks = JSON.parse(savedTasks)
      return Array.isArray(parsedTasks) ? ensureUniqueTaskIds(parsedTasks) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
  }, [groups])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => () => window.clearTimeout(undoTimerRef.current), [])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    const closeOnDesktopResize = () => {
      if (window.innerWidth > 560) setMobileMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnDesktopResize)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnDesktopResize)
    }
  }, [mobileMenuOpen])

  const addTask = (taskText, groupId = '') => {
    const trimmedTask = taskText.trim()
    if (!trimmedTask) return

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: Date.now() + Math.random(),
        text: trimmedTask,
        done: false,
        groupId: groupId || null,
      },
    ])
  }

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task,
      ),
    )
  }

  const updateTask = (taskId, text) => {
    const trimmedText = text.trim()
    if (!trimmedText) return

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, text: trimmedText } : task,
      ),
    )
  }

  const reorderTasks = (sourceId, targetId, insertAfter = false) => {
    if (sourceId === targetId) return

    setTasks((currentTasks) => {
      const sourceIndex = currentTasks.findIndex((task) => String(task.id) === sourceId)
      const targetIndex = currentTasks.findIndex((task) => String(task.id) === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return currentTasks

      const nextTasks = [...currentTasks]
      const [movedTask] = nextTasks.splice(sourceIndex, 1)
      const adjustedTargetIndex = nextTasks.findIndex((task) => String(task.id) === targetId)
      const insertionIndex = adjustedTargetIndex + (insertAfter ? 1 : 0)
      nextTasks.splice(insertionIndex, 0, movedTask)
      return nextTasks
    })
  }

  const deleteTask = (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId)
    if (taskIndex === -1) return

    const task = tasks[taskIndex]
    setTasks((currentTasks) => currentTasks.filter((currentTask) => currentTask.id !== taskId))
    setUndoItem({ task, index: taskIndex })
    window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(() => setUndoItem(null), 5000)
  }

  const undoDeleteTask = () => {
    if (!undoItem) return

    window.clearTimeout(undoTimerRef.current)
    setTasks((currentTasks) => {
      if (currentTasks.some((task) => task.id === undoItem.task.id)) return currentTasks

      const restoredTasks = [...currentTasks]
      restoredTasks.splice(Math.min(undoItem.index, restoredTasks.length), 0, undoItem.task)
      return restoredTasks
    })
    setUndoItem(null)
  }

  const addGroup = ({ name, description, color }) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const normalizedId = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'new-group'

    setGroups((currentGroups) => {
      const nextId = `${normalizedId}-${Date.now().toString(36)}`
      return [
        ...currentGroups,
        {
          id: nextId,
          name: trimmedName,
          description: description.trim(),
          color,
          tasks: [],
        },
      ]
    })
  }

  const updateGroup = (groupId, { name, description, color }) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId
          ? { ...group, name: trimmedName, description: description.trim(), color }
          : group,
      ),
    )
  }

  const deleteGroup = (groupId) => {
    const group = groups.find((currentGroup) => currentGroup.id === groupId)
    if (!group) return false

    const groupTasks = tasks.filter((task) => task.groupId === groupId)
    const taskCount = groupTasks.length
    const taskMessage = taskCount === 0
      ? 'This group has no tasks.'
      : `This will also permanently delete ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}.`
    if (!window.confirm(`Delete the "${group.name}" group?\n\n${taskMessage}\n\nThis action cannot be undone.`)) return false

    setGroups((currentGroups) => currentGroups.filter((currentGroup) => currentGroup.id !== groupId))
    setTasks((currentTasks) => currentTasks.filter((task) => task.groupId !== groupId))
    if (undoItem?.task.groupId === groupId) {
      window.clearTimeout(undoTimerRef.current)
      setUndoItem(null)
    }
    return true
  }

  const reorderGroups = (sourceId, targetId, insertAfter = false) => {
    if (sourceId === targetId) return

    setGroups((currentGroups) => {
      const sourceIndex = currentGroups.findIndex((group) => group.id === sourceId)
      const targetIndex = currentGroups.findIndex((group) => group.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return currentGroups

      const nextGroups = [...currentGroups]
      const [movedGroup] = nextGroups.splice(sourceIndex, 1)
      const adjustedTargetIndex = nextGroups.findIndex((group) => group.id === targetId)
      nextGroups.splice(adjustedTargetIndex + (insertAfter ? 1 : 0), 0, movedGroup)
      return nextGroups
    })
  }

  return (
    <div className="app-shell min-h-screen" data-theme={theme} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
      <div className="mobile-toolbar">
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="app-sidebar"
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="mobile-toolbar-title">fo-to-do</span>
      </div>
      <Navbar
        groups={groups}
        tasks={tasks}
        onReorderGroup={reorderGroups}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />
      <button
        type="button"
        className="theme-toggle"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={() => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
          </svg>
        )}
      </button>
      <main className="app-main ml-[var(--layout-sidebar-width)] min-h-screen text-ink max-[560px]:ml-0 max-[560px]:min-h-[calc(100vh-56px)]">
        <div className="page-content mx-auto w-full max-w-[970px] px-14 pt-16 pb-20 max-[760px]:px-7 max-[760px]:pt-[46px] max-[760px]:pb-16 max-[560px]:px-[18px] max-[560px]:pt-9 max-[560px]:pb-[52px]">
        <Routes>
          <Route path="/" element={<Tasks tasks={tasks} groups={groups} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onUpdateTask={updateTask} onReorderTask={reorderTasks} />} />
          <Route
            path="/tasks"
            element={<Tasks tasks={tasks} groups={groups} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onUpdateTask={updateTask} onReorderTask={reorderTasks} />}
          />
          <Route
            path="/groups"
            element={<Groups tasks={tasks} groups={groups} onAddGroup={addGroup} onUpdateGroup={updateGroup} onDeleteGroup={deleteGroup} onReorderGroup={reorderGroups} />}
          />
          <Route
            path="/groups/:groupId"
            element={<GroupTasks tasks={tasks} groups={groups} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onUpdateTask={updateTask} onDeleteGroup={deleteGroup} onReorderTask={reorderTasks} />}
          />
          <Route path="/guide" element={<Guide />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="*" element={<Tasks tasks={tasks} groups={groups} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onUpdateTask={updateTask} onReorderTask={reorderTasks} />} />
        </Routes>
        </div>
      </main>
      {undoItem && (
        <div className="fixed bottom-5 left-1/2 z-50 flex w-[min(90vw,420px)] -translate-x-1/2 items-center justify-between gap-4 rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink shadow-lg" role="status" aria-live="polite">
          <span className="truncate">“{undoItem.task.text}” deleted</span>
          <button
            type="button"
            className="shrink-0 rounded px-2 py-1 font-semibold text-accent hover:bg-panel-raised hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={undoDeleteTask}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  )
}

export default App
