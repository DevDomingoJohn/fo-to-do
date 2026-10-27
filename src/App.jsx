import { useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { groups as initialGroups } from './data/groups'
import Developers from './pages/Developers'
import GroupTasks from './pages/GroupTasks'
import Groups from './pages/Groups'
import Guide from './pages/Guide'
import Tasks from './pages/Tasks'
import './App.css'

const STORAGE_KEY = 'fo-to-do-all-tasks'
const GROUPS_STORAGE_KEY = 'fo-to-do-groups'
const buildInitialTasks = (groups) =>
  groups.flatMap((group) =>
    (group.tasks || []).map((task) => ({
      ...task,
      id: `${group.id}-${task.id}`,
      groupId: group.id,
    })),
  )

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
  const [undoItem, setUndoItem] = useState(null)
  const undoTimerRef = useRef(null)
  const [groups, setGroups] = useState(() => {
    try {
      const savedGroups = window.localStorage.getItem(GROUPS_STORAGE_KEY)
      if (!savedGroups) return initialGroups

      const parsedGroups = JSON.parse(savedGroups)
      return Array.isArray(parsedGroups) ? parsedGroups : initialGroups
    } catch {
      return initialGroups
    }
  })

  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY)
      if (!savedTasks) return buildInitialTasks(initialGroups)

      const parsedTasks = JSON.parse(savedTasks)
      return Array.isArray(parsedTasks) ? ensureUniqueTaskIds(parsedTasks) : buildInitialTasks(initialGroups)
    } catch {
      return buildInitialTasks(initialGroups)
    }
  })

  useEffect(() => {
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
  }, [groups])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => () => window.clearTimeout(undoTimerRef.current), [])

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
    <div className="app-shell min-h-screen" style={{ '--sidebar-width': `${sidebarWidth}px` }}>
      <Navbar
        groups={groups}
        tasks={tasks}
        onReorderGroup={reorderGroups}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
      />
      <main className="app-main ml-[var(--layout-sidebar-width)] min-h-screen text-ink max-[560px]:ml-0 max-[560px]:min-h-[calc(100vh-126px)]">
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
