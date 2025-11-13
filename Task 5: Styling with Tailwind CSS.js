/*Step 1: Update Tailwind Configuration
tailwind.config.js*/

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 20px 0 rgba(0, 0, 0, 0.05)',
        'xl-soft': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-light': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'mesh-dark': 'linear-gradient(135deg, #1e3a8a 0%, #7e22ce 100%)',
      },
    },
  },
  plugins: [],
}


/*Step 2: Enhanced Theme Context with Smooth Transitions
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

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    localStorage.setItem('theme', JSON.stringify(isDarkMode))
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const setTheme = (dark) => {
    setIsDarkMode(dark)
  }

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    mounted,
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}


/*Step 3: Enhanced Theme Toggle Component
src/components/ui/ThemeToggle.jsx*/

import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = ({ size = 'medium', className = '' }) => {
  const { isDarkMode, toggleTheme, mounted } = useTheme()

  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  }

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  }

  if (!mounted) {
    return (
      <div className={`${sizes[size]} rounded-full bg-gray-200 animate-pulse ${className}`} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        group relative inline-flex items-center justify-center
        rounded-full transition-all duration-300 ease-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        ${sizes[size]} ${className}
        ${
          isDarkMode
            ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-600 shadow-lg shadow-orange-500/25'
            : 'bg-gradient-to-br from-blue-900 to-purple-900 text-yellow-200 shadow-lg shadow-blue-500/25'
        }
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Animated background */}
      <div className={`
        absolute inset-0 rounded-full bg-gradient-to-br transition-all duration-500
        ${
          isDarkMode
            ? 'from-yellow-200 to-orange-300 opacity-0 group-hover:opacity-20'
            : 'from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20'
        }
      `} />
      
      {/* Icons with animation */}
      <div className="relative transform transition-transform duration-500">
        {isDarkMode ? (
          // Sun icon for dark mode
          <svg
            className={`${iconSizes[size]} animate-spin-slow text-yellow-500`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // Moon icon for light mode
          <svg
            className={`${iconSizes[size]} animate-float text-yellow-200`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-full bg-current opacity-0 group-active:opacity-20 group-active:animate-ping" />
    </button>
  )
}

export default ThemeToggle

/*Step 4: Enhanced Responsive Layout Component
src/components/layout/EnhancedLayout.jsx*/

import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { classNames } from '../../utils/helpers'
import Navbar from './Navbar'
import Footer from './Footer'
import ThemeToggle from '../ui/ThemeToggle'
import MobileSidebar from './MobileSidebar'

const EnhancedLayout = ({ 
  children, 
  navbarProps = {},
  footerProps = {},
  className = '',
  showNavbar = true,
  showFooter = true,
  fullWidth = false,
  background = 'default',
}) => {
  const { isDarkMode } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Scroll progress for header effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const backgroundStyles = {
    default: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    gradient: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    mesh: isDarkMode 
      ? 'bg-mesh-dark' 
      : 'bg-mesh-light',
  }

  return (
    <div className={classNames(
      'min-h-screen flex flex-col transition-all duration-300 ease-in-out',
      backgroundStyles[background],
      className
    )}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary-400 to-purple-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-40 lg:bottom-8 lg:right-8">
        <ThemeToggle 
          size="large" 
          className="shadow-xl hover:shadow-glow-lg transition-shadow duration-300"
        />
      </div>

      {showNavbar && (
        <Navbar 
          {...navbarProps}
          onMobileMenuToggle={setIsMobileMenuOpen}
          className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50"
        />
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className={classNames(
        'flex-1 transition-all duration-300',
        fullWidth ? 'w-full' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8'
      )}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {showFooter && (
        <Footer 
          {...footerProps}
          className="mt-auto backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-t border-gray-200/50 dark:border-gray-700/50"
        />
      )}
    </div>
  )
}

export default EnhancedLayout



/*Step 5: Enhanced Navbar with Mobile Support
src/components/layout/EnhancedNavbar.jsx*/

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { classNames } from '../../utils/helpers'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'

const EnhancedNavbar = ({ 
  logo = null,
  title = "MyApp",
  navigation = [],
  user = null,
  onLogin,
  onLogout,
  onMobileMenuToggle,
  className = ''
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isDarkMode } = useTheme()

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    onMobileMenuToggle?.(false)
  }, [location.pathname, onMobileMenuToggle])

  const defaultNavigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Tasks', href: '/tasks', current: location.pathname === '/tasks' },
    { name: 'Posts', href: '/posts', current: location.pathname === '/posts' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
  ]

  const navItems = navigation.length > 0 ? navigation : defaultNavigation

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)
    onMobileMenuToggle?.(newState)
  }

  return (
    <>
      <nav className={classNames(
        'sticky top-0 z-40 transition-all duration-300 ease-out',
        isScrolled 
          ? 'py-2 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 shadow-soft border-b border-gray-200/30 dark:border-gray-700/30' 
          : 'py-4 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 dark:border-gray-700/20',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo and main navigation */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
              >
                {logo || (
                  <div className={classNames(
                    'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-110',
                    'bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/25',
                    'text-white font-display font-bold text-lg'
                  )}>
                    <span className="animate-pulse-soft">M</span>
                  </div>
                )}
                <span className={classNames(
                  'text-xl font-display font-bold transition-colors duration-300',
                  'bg-gradient-to-r bg-clip-text text-transparent',
                  'from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400',
                  'group-hover:from-primary-700 group-hover:to-purple-700',
                  'dark:group-hover:from-primary-300 dark:group-hover:to-purple-300'
                )}>
                  {title}
                </span>
              </Link>
              
              {/* Desktop navigation */}
              <div className="hidden lg:flex lg:space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                      'group overflow-hidden',
                      item.current
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-inner-soft'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    {/* Animated background */}
                    <div className={classNames(
                      'absolute inset-0 bg-gradient-to-r transition-transform duration-300',
                      'from-primary-500/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-0',
                      item.current && 'translate-x-0'
                    )} />
                    
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.current && (
                        <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce-gentle" />
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle size="medium" />
              
              {/* User actions */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={onLogout}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={onLogin}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={onLogin}
                    className="shadow-lg shadow-primary-500/25 hover:shadow-glow"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center space-x-2">
              <ThemeToggle size="small" />
              
              <button
                onClick={toggleMobileMenu}
                className={classNames(
                  'p-2 rounded-lg transition-all duration-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                )}
              >
                <div className="w-6 h-6 relative">
                  <span className={classNames(
                    'absolute block w-5 h-0.5 rounded-full transition-all duration-300',
                    'bg-gray-600 dark:bg-gray-300',
                    isMobileMenuOpen ? 'rotate-45 top-3' : 'top-1'
                  )} />
                  <span className={classNames(
                    'absolute block w-5 h-0.5 rounded-full transition-all duration-300',
                    'bg-gray-600 dark:bg-gray-300',
                    isMobileMenuOpen ? 'opacity-0' : 'top-3 opacity-100'
                  )} />
                  <span className={classNames(
                    'absolute block w-5 h-0.5 rounded-full transition-all duration-300',
                    'bg-gray-600 dark:bg-gray-300',
                    isMobileMenuOpen ? '-rotate-45 top-3' : 'top-5'
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={classNames(
        'lg:hidden fixed inset-0 z-30 transition-all duration-300 ease-in-out',
        isMobileMenuOpen
          ? 'opacity-100 visible'
          : 'opacity-0 invisible'
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
        
        {/* Menu panel */}
        <div className={classNames(
          'absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700',
          'transform transition-transform duration-300 ease-out',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          <div className="flex flex-col h-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-display font-bold text-gray-900 dark:text-white">
                Menu
              </span>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300',
                    'group relative overflow-hidden',
                    item.current
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-inner-soft'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                  onClick={toggleMobileMenu}
                >
                  <div className={classNames(
                    'absolute inset-0 bg-gradient-to-r transition-transform duration-300',
                    'from-primary-500/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-0',
                    item.current && 'translate-x-0'
                  )} />
                  <span className="relative z-10 flex items-center space-x-3">
                    <span>{item.name}</span>
                    {item.current && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={onLogout}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={onLogin}
                    className="shadow-lg shadow-primary-500/25"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={onLogin}
                  >
                    Create Account
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EnhancedNavbar



/*Step 6: Enhanced Card Component with Animations
src/components/ui/EnhancedCard.jsx*/

import { classNames } from '../../utils/helpers'

const EnhancedCard = ({ 
  children, 
  className = '',
  padding = 'medium',
  shadow = 'medium',
  border = true,
  hover = false,
  glow = false,
  animated = false,
  delay = 0,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  const shadowClasses = {
    none: '',
    small: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
    xl: 'shadow-xl-soft'
  }

  const borderClass = border 
    ? 'border border-gray-200/60 dark:border-gray-700/60' 
    : ''

  const hoverClass = hover 
    ? 'hover:shadow-large hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer' 
    : ''

  const glowClass = glow
    ? 'shadow-glow-lg hover:shadow-glow transition-shadow duration-500'
    : ''

  const animationClass = animated
    ? 'animate-slide-up'
    : ''

  const cardClasses = classNames(
    'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl',
    'transition-all duration-300 ease-out',
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClass,
    hoverClass,
    glowClass,
    animationClass,
    className
  )

  return (
    <div 
      className={cardClasses}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ 
  children, 
  className = '',
  title,
  subtitle,
  action 
}) => {
  return (
    <div className={classNames('mb-6', className)}>
      {(title || subtitle || action) ? (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={classNames('text-gray-700 dark:text-gray-300', className)}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={classNames(
      'mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50',
      className
    )}>
      {children}
    </div>
  )
}

EnhancedCard.Header = CardHeader
EnhancedCard.Content = CardContent
EnhancedCard.Footer = CardFooter

export default EnhancedCard



/*Step 7: Enhanced Button Component
src/components/ui/EnhancedButton.jsx
*/
import { classNames } from '../../utils/helpers'

const EnhancedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  animated = false,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 ease-out transform
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${animated ? 'hover:scale-105 active:scale-95' : ''}
  `
  
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-purple-600 
      hover:from-primary-600 hover:to-purple-700
      text-white shadow-lg shadow-primary-500/25
      hover:shadow-glow focus:ring-primary-500
    `,
    secondary: `
      bg-gray-100 dark:bg-gray-800
      text-gray-900 dark:text-white
      hover:bg-gray-200 dark:hover:bg-gray-700
      border border-gray-300 dark:border-gray-600
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-600
      hover:from-red-600 hover:to-pink-700
      text-white shadow-lg shadow-red-500/25
      hover:shadow-red-500/40 focus:ring-red-500
    `,
    outline: `
      border-2 border-primary-500 text-primary-600 dark:text-primary-400
      hover:bg-primary-500 hover:text-white dark:hover:text-white
      focus:ring-primary-500
    `,
    ghost: `
      text-gray-600 dark:text-gray-400
      hover:text-primary-600 dark:hover:text-primary-400
      hover:bg-gray-100 dark:hover:bg-gray-800
      focus:ring-primary-500
    `
  }

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-6 py-2.5 text-sm',
    large: 'px-8 py-3.5 text-base'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const buttonClasses = classNames(
    baseClasses,
    variants[variant],
    sizes[size],
    widthClass,
    className
  )

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="flex items-center space-x-2">
        {children}
      </span>
    </button>
  )
}

export default EnhancedButton



/*Step 8: Update CSS for Smooth Transitions
src/index.css*/

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    scroll-behavior: smooth;
  }

  body {
    @apply antialiased;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    @apply w-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500 dark:bg-gray-500;
  }
}

/* Custom component styles */
@layer components {
  .gradient-text {
    @apply bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent;
  }

  .glass-effect {
    @apply bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20;
  }

  .shimmer {
    @apply animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-gray-700/50 to-transparent bg-[length:200px_100%];
  }

  .floating {
    animation: float 6s ease-in-out infinite;
  }

  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  }
}

/* Custom utilities */
@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }

  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }

  .animation-delay-100 {
    animation-delay: 100ms;
  }

  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .animation-delay-300 {
    animation-delay: 300ms;
  }

  .animation-delay-400 {
    animation-delay: 400ms;
  }

  .animation-delay-500 {
    animation-delay: 500ms;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}


/*Step 9: Create Demo Page to Showcase Styling
src/pages/StylingShowcase.jsx*/

import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import EnhancedLayout from '../components/layout/EnhancedLayout'
import EnhancedCard from '../components/ui/EnhancedCard'
import EnhancedButton from '../components/ui/EnhancedButton'
import ThemeToggle from '../components/ui/ThemeToggle'

const StylingShowcase = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('buttons')

  const components = {
    buttons: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EnhancedCard className="text-center">
          <EnhancedCard.Header title="Button Variants" />
          <EnhancedCard.Content>
            <div className="space-y-4">
              <EnhancedButton variant="primary" fullWidth>
                Primary Button
              </EnhancedButton>
              <EnhancedButton variant="secondary" fullWidth>
                Secondary Button
              </EnhancedButton>
              <EnhancedButton variant="danger" fullWidth>
                Danger Button
              </EnhancedButton>
              <EnhancedButton variant="outline" fullWidth>
                Outline Button
              </EnhancedButton>
              <EnhancedButton variant="ghost" fullWidth>
                Ghost Button
              </EnhancedButton>
            </div>
          </EnhancedCard.Content>
        </EnhancedCard>

        <EnhancedCard className="text-center">
          <EnhancedCard.Header title="Button Sizes" />
          <EnhancedCard.Content>
            <div className="space-y-4">
              <EnhancedButton size="small" fullWidth>
                Small Button
              </EnhancedButton>
              <EnhancedButton size="medium" fullWidth>
                Medium Button
              </EnhancedButton>
              <EnhancedButton size="large" fullWidth>
                Large Button
              </EnhancedButton>
            </div>
          </EnhancedCard.Content>
        </EnhancedCard>

        <EnhancedCard className="text-center">
          <EnhancedCard.Header title="Button States" />
          <EnhancedCard.Content>
            <div className="space-y-4">
              <EnhancedButton loading fullWidth>
                Loading State
              </EnhancedButton>
              <EnhancedButton disabled fullWidth>
                Disabled State
              </EnhancedButton>
              <EnhancedButton animated fullWidth>
                Animated Button
              </EnhancedButton>
            </div>
          </EnhancedCard.Content>
        </EnhancedCard>
      </div>
    ),
    cards: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EnhancedCard
            key={i}
            hover
            glow={i % 2 === 0}
            animated
            delay={i * 100}
            className="text-center"
          >
            <EnhancedCard.Header 
              title={`Card ${i}`}
              subtitle={`This is a sample card with ${i % 2 === 0 ? 'glow effect' : 'hover effect'}`}
            />
            <EnhancedCard.Content>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This card demonstrates different styling variations and animations.
              </p>
              <div className="w-full h-20 rounded-lg bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  Visual Content
                </span>
              </div>
            </EnhancedCard.Content>
            <EnhancedCard.Footer>
              <EnhancedButton variant="outline" fullWidth>
                Learn More
              </EnhancedButton>
            </EnhancedCard.Footer>
          </EnhancedCard>
        ))}
      </div>
    ),
    animations: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { name: 'Fade In', class: 'animate-fade-in' },
          { name: 'Slide Up', class: 'animate-slide-up' },
          { name: 'Bounce', class: 'animate-bounce-gentle' },
          { name: 'Pulse', class: 'animate-pulse-soft' },
          { name: 'Spin', class: 'animate-spin-slow' },
          { name: 'Float', class: 'animate-float' },
          { name: 'Ping', class: 'animate-ping' },
          { name: 'Shimmer', class: 'shimmer' },
        ].map((animation, index) => (
          <EnhancedCard
            key={animation.name}
            className="text-center"
            animated
            delay={index * 100}
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 ${animation.class}`} />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {animation.name}
            </h3>
          </EnhancedCard>
        ))}
      </div>
    ),
  }

  return (
    <EnhancedLayout background="gradient">
      <div className="py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text mb-6">
            Styling Showcase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the responsive design, smooth animations, and dark mode functionality 
            built with Tailwind CSS.
          </p>
        </div>

        {/* Theme Toggle Demo */}
        <EnhancedCard className="text-center mb-8" glow animated>
          <EnhancedCard.Header 
            title="Theme Switcher"
            subtitle="Click the floating button to toggle between light and dark mode"
          />
          <EnhancedCard.Content>
            <div className="flex justify-center items-center space-x-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">☀️</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Light Mode</span>
              </div>
              <ThemeToggle size="large" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🌙</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
              </div>
            </div>
          </EnhancedCard.Content>
        </EnhancedCard>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.keys(components).map((tab) => (
            <EnhancedButton
              key={tab}
              variant={activeTab === tab ? 'primary' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </EnhancedButton>
          ))}
        </div>

        {/* Active Component Display */}
        <div className="animate-slide-up">
          {components[activeTab]}
        </div>

        {/* Responsive Grid Demo */}
        <EnhancedCard className="mt-12" animated delay={200}>
          <EnhancedCard.Header 
            title="Responsive Grid"
            subtitle="This grid adapts to different screen sizes"
          />
          <EnhancedCard.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-lg bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 text-center transition-all duration-300 hover:scale-105"
                >
                  <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    Item {item}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Responsive
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard.Content>
        </EnhancedCard>
      </div>
    </EnhancedLayout>
  )
}

export default StylingShowcase


/*Step 10: Update App.jsx with New Routes
src/App.jsx*/

import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import EnhancedLayout from './components/layout/EnhancedLayout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import TaskManager from './components/tasks/TaskManager'
import PostsManager from './components/posts/PostsManager'
import StylingShowcase from './pages/StylingShowcase'

function App() {
  return (
    <ThemeProvider>
      <EnhancedLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/posts" element={<PostsManager />} />
          <Route path="/styling" element={<StylingShowcase />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </EnhancedLayout>
    </ThemeProvider>
  )
}

export default App



