/*Step 1: Create Context for Theme Management
src/contexts/ThemeContext.jsx*/

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? JSON.parse(savedTheme) : false
  })

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDarkMode))
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const value = {
    isDarkMode,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}



/*Step 2: Create Custom useLocalStorage Hook
src/hooks/useLocalStorage.js*/

import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}


/*Step 3: Create TaskManager Component
src/components/tasks/TaskManager.jsx*/

import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import Button from '../ui/Button'
import Card from '../ui/Card'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import TaskStats from './TaskStats'

const TaskManager = () => {
  const { isDarkMode } = useTheme()
  const [tasks, setTasks] = useLocalStorage('tasks', [])
  const [filter, setFilter] = useState('all')
  const [editingTask, setEditingTask] = useState(null)

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed
      case 'completed':
        return task.completed
      default:
        return true
    }
  })

  // Add new task
  const addTask = (title, description) => {
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description?.trim() || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
  }

  // Update existing task
  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ))
    setEditingTask(null)
  }

  // Delete task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  // Toggle task completion
  const toggleTaskCompletion = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        : task
    ))
  }

  // Clear all completed tasks
  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed))
  }

  // Start editing a task
  const startEditing = (task) => {
    setEditingTask(task)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null)
  }

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const activeTasks = totalTasks - completedTasks

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Task Manager
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Stay organized and get things done
          </p>
        </div>

        {/* Task Statistics */}
        <TaskStats
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          activeTasks={activeTasks}
          isDarkMode={isDarkMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Form */}
          <div className="lg:col-span-1">
            <Card
              className={`h-fit ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
              shadow="medium"
            >
              <Card.Header
                title={editingTask ? "Edit Task" : "Add New Task"}
                className={isDarkMode ? 'text-white' : ''}
              />
              <Card.Content>
                <TaskForm
                  onSubmit={editingTask ? updateTask : addTask}
                  onCancel={editingTask ? cancelEditing : null}
                  editingTask={editingTask}
                  isDarkMode={isDarkMode}
                />
              </Card.Content>
            </Card>
          </div>

          {/* Right Column - Task List and Filters */}
          <div className="lg:col-span-2">
            <Card
              className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}
              shadow="medium"
            >
              <Card.Header
                title="Your Tasks"
                className={isDarkMode ? 'text-white' : ''}
                action={
                  completedTasks > 0 && (
                    <Button
                      variant="danger"
                      size="small"
                      onClick={clearCompleted}
                    >
                      Clear Completed ({completedTasks})
                    </Button>
                  )
                }
              />
              <Card.Content>
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['all', 'active', 'completed'].map(filterType => (
                    <Button
                      key={filterType}
                      variant={filter === filterType ? 'primary' : 'outline'}
                      size="small"
                      onClick={() => setFilter(filterType)}
                      className="capitalize"
                    >
                      {filterType} ({filterType === 'all' ? totalTasks : filterType === 'active' ? activeTasks : completedTasks})
                    </Button>
                  ))}
                </div>

                {/* Task List */}
                <TaskList
                  tasks={filteredTasks}
                  onToggleComplete={toggleTaskCompletion}
                  onDelete={deleteTask}
                  onEdit={startEditing}
                  isDarkMode={isDarkMode}
                />

                {/* Empty State */}
                {filteredTasks.length === 0 && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-lg mb-2">
                      {tasks.length === 0 ? 'No tasks yet!' : `No ${filter} tasks found.`}
                    </p>
                    <p className="text-sm">
                      {tasks.length === 0 ? 'Add your first task to get started!' : 'Try changing your filter.'}
                    </p>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskManager



/*Step 4: Create TaskForm Component
src/components/tasks/TaskForm.jsx*/

import { useState, useEffect } from 'react'
import Button from '../ui/Button'

const TaskForm = ({ onSubmit, onCancel, editingTask, isDarkMode }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description)
    } else {
      setTitle('')
      setDescription('')
    }
    setErrors({})
  }, [editingTask])

  const validateForm = () => {
    const newErrors = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }
    
    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (editingTask) {
      onSubmit(editingTask.id, { title, description })
    } else {
      onSubmit(title, description)
    }

    // Reset form only if not editing
    if (!editingTask) {
      setTitle('')
      setDescription('')
    }
  }

  const handleCancel = () => {
    onCancel()
    setTitle('')
    setDescription('')
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
        >
          Task Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.title
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300'
          }`}
          placeholder="Enter task title..."
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <div className="mt-1 text-xs text-gray-500 text-right">
          {title.length}/100
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.description
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300'
          }`}
          placeholder="Enter task description (optional)..."
          maxLength={500}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <div className="mt-1 text-xs text-gray-500 text-right">
          {description.length}/500
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </Button>
        
        {editingTask && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} pt-2 border-t border-gray-200 dark:border-gray-600`}>
        * Required field
      </div>
    </form>
  )
}

export default TaskForm

/*Step 5: Create TaskList Component
src/components/tasks/TaskList.jsx*/

import TaskItem from './TaskItem'

const TaskList = ({ tasks, onToggleComplete, onDelete, onEdit, isDarkMode }) => {
  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  )
}

export default TaskList

/*Step 6: Create TaskItem Component
src/components/tasks/TaskItem.jsx*/import { useState } from 'react'
import Button from '../ui/Button'

const TaskItem = ({ task, onToggleComplete, onDelete, onEdit, isDarkMode }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
    // Add a small delay for animation
    setTimeout(() => {
      onDelete(task.id)
    }, 300)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 ${
        isDeleting
          ? 'opacity-0 scale-95 -translate-y-2'
          : 'opacity-100 scale-100'
      } ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600 hover:bg-gray-650'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      } ${task.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-1 transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : isDarkMode
              ? 'border-gray-400 hover:border-green-400'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              task.completed
                ? 'line-through text-gray-500'
                : isDarkMode
                ? 'text-white'
                : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>
          
          {task.description && (
            <p
              className={`text-sm mt-1 ${
                task.completed
                  ? 'text-gray-500'
                  : isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}
          
          <div className={`text-xs mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Created: {formatDate(task.createdAt)}
            {task.updatedAt !== task.createdAt && (
              <span className="ml-2">• Updated: {formatDate(task.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="small"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem


/*Step 7: Create TaskStats Component
src/components/tasks/TaskStats.jsx*/

const TaskStats = ({ totalTasks, completedTasks, activeTasks, isDarkMode }) => {
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    { label: 'Total Tasks', value: totalTasks, color: 'blue' },
    { label: 'Active', value: activeTasks, color: 'yellow' },
    { label: 'Completed', value: completedTasks, color: 'green' },
    { label: 'Completion', value: `${completionPercentage}%`, color: 'indigo' },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
      yellow: isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
      green: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
      indigo: isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800',
    }
    return colors[color]
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`p-4 rounded-lg text-center ${getColorClasses(stat.color)}`}
        >
          <div className="text-2xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default TaskStats



/*Step 8: Update Main App with Theme Provider
src/App.jsx*/

import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import TaskManager from './components/tasks/TaskManager'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App

/*Step 9: Update Navbar with Theme Toggle
src/components/layout/Navbar.jsx (Add theme toggle)*/

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { classNames } from '../../utils/helpers'
import Button from '../ui/Button'

const Navbar = ({ 
  logo = null,
  title = "MyApp",
  navigation = [],
  user = null,
  onLogin,
  onLogout,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()

  const defaultNavigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Tasks', href: '/tasks', current: location.pathname === '/tasks' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
  ]

  const navItems = navigation.length > 0 ? navigation : defaultNavigation

  return (
    <nav className={classNames('bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {logo || <span className="text-xl font-bold text-gray-800 dark:text-white">{title}</span>}
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    item.current
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User actions and theme toggle */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">Hello, {user.name}</span>
                <Button variant="outline" size="small" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="small" onClick={onLogin}>
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center space-x-2">
            {/* Theme Toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                  item.current
                    ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-700 dark:text-indigo-200'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="small" 
                  className="ml-auto"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-4">
                <Button variant="primary" size="small" fullWidth onClick={onLogin}>
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar




/*Step 10: Update Home Page with Tasks Link
src/pages/Home.jsx (Add tasks section)*/

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Our Application
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          This is a modern React application built with Vite, Tailwind CSS, and React Router.
        </p>
        <div className="space-x-4">
          <Link to="/tasks">
            <Button>Try Task Manager</Button>
          </Link>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card hover className="text-center">
          <Card.Header title="Task Management" />
          <Card.Content>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Organize your tasks with our powerful task manager. Add, complete, and filter tasks with ease.
            </p>
            <Link to="/tasks">
              <Button variant="outline" size="small">
                Manage Tasks
              </Button>
            </Link>
          </Card.Content>
        </Card>

        <Card hover className="text-center">
          <Card.Header title="Dark Mode" />
          <Card.Content>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Enjoy a comfortable viewing experience with our built-in dark mode support.
            </p>
            <Button variant="outline" size="small" disabled>
              Toggle Theme
            </Button>
          </Card.Content>
        </Card>

        <Card hover className="text-center">
          <Card.Header title="Responsive Design" />
          <Card.Content>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Works perfectly on all devices - desktop, tablet, and mobile.
            </p>
            <Button variant="outline" size="small" disabled>
              Learn More
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default Home


