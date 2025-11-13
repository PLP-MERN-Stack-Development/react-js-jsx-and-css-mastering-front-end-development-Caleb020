/*Step 1: Create Enhanced Button Component
src/components/ui/Button.jsx */
import { classNames } from '../../utils/helpers'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:border-gray-200 disabled:text-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400'
  }

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const buttonClasses = classNames(
    baseClasses,
    variants[variant],
    sizes[size],
    widthClass,
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className
  )

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button


/*Step 2: Create Card Component
src/components/ui/Card.jsx */

import { classNames } from '../../utils/helpers'

const Card = ({ 
  children, 
  className = '',
  padding = 'medium',
  shadow = 'medium',
  border = true,
  hover = false,
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
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg'
  }

  const borderClass = border ? 'border border-gray-200' : ''
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : ''

  const cardClasses = classNames(
    'bg-white rounded-lg',
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClass,
    hoverClass,
    className
  )

  return (
    <div className={cardClasses} {...props}>
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
    <div className={classNames('mb-4', className)}>
      {(title || subtitle || action) ? (
        <div className="flex items-start justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={classNames('text-gray-700', className)}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={classNames('mt-6 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

export default Card

  
    /*Step 3: Create Enhanced Navbar Component
src/components/layout/Navbar.jsx*/
  
  import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

  const defaultNavigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
  ]

  const navItems = navigation.length > 0 ? navigation : defaultNavigation

  return (
    <nav className={classNames('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {logo || <span className="text-xl font-bold text-gray-800">{title}</span>}
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
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Hello, {user.name}</span>
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
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                  item.current
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
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


/*Step 4: Create Footer Component
src/components/layout/Footer.jsx*/

import { Link } from 'react-router-dom'
import { classNames } from '../../utils/helpers'

const Footer = ({ 
  companyName = "MyApp",
  description = "A modern React application built with Vite, Tailwind CSS, and React Router.",
  links = {},
  socialLinks = [],
  className = '' 
}) => {
  const defaultLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Documentation', href: '/docs' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  }

  const defaultSocialLinks = [
    {
      name: 'Twitter',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
  ]

  const footerLinks = { ...defaultLinks, ...links }
  const socials = socialLinks.length > 0 ? socialLinks : defaultSocialLinks

  return (
    <footer className={classNames('bg-gray-900 text-white', className)}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company info */}
          <div className="space-y-8 xl:col-span-1">
            <div>
              <Link to="/" className="text-2xl font-bold text-white">
                {companyName}
              </Link>
              <p className="mt-4 text-gray-400 text-sm">
                {description}
              </p>
            </div>
            <div className="flex space-x-6">
              {socials.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


/*Step 5: Create Enhanced Layout Component
src/components/layout/Layout.jsx*/

import { classNames } from '../../utils/helpers'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ 
  children, 
  navbarProps = {},
  footerProps = {},
  className = '',
  showNavbar = true,
  showFooter = true 
}) => {
  // Mock user data - in real app, this would come from context or props
  const user = null
  
  const handleLogin = () => {
    console.log('Login clicked')
    // Implement login logic
  }

  const handleLogout = () => {
    console.log('Logout clicked')
    // Implement logout logic
  }

  const defaultNavbarProps = {
    user,
    onLogin: handleLogin,
    onLogout: handleLogout,
  }

  const defaultFooterProps = {
    companyName: "MyApp",
    description: "A modern React application built with Vite, Tailwind CSS, and React Router.",
  }

  return (
    <div className={classNames('min-h-screen bg-gray-50 flex flex-col', className)}>
      {showNavbar && (
        <Navbar {...defaultNavbarProps} {...navbarProps} />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && (
        <Footer {...defaultFooterProps} {...footerProps} />
      )}
    </div>
  )
}

export default Layout


/*Step 7: Update App.jsx to Use New Components
src/App.jsx*/

import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App


/*Step 8: Update Home Page to Demonstrate Components
src/pages/Home.jsx*/

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Our Application
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          This is a modern React application built with Vite, Tailwind CSS, and React Router.
        </p>
        <div className="space-x-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
          <Button variant="ghost">View Documentation</Button>
        </div>
      </div>

      {/* Button Variants Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <Card.Header title="Primary Buttons" />
            <Card.Content>
              <div className="space-y-3">
                <Button size="small">Small</Button>
                <Button>Medium</Button>
                <Button size="large">Large</Button>
                <Button fullWidth>Full Width</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header title="Secondary & Danger" />
            <Card.Content>
              <div className="space-y-3">
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </Card.Content>
          </Card>

          <Card hover>
            <Card.Header 
              title="Card with Hover" 
              subtitle="This card has hover effects"
            />
            <Card.Content>
              <p className="text-gray-600 mb-4">
                This demonstrates the card component with different configurations.
              </p>
              <Button variant="outline" size="small">
                Learn More
              </Button>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Card Layout Demo */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Layouts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card shadow="large" padding="large">
            <Card.Header 
              title="Feature Rich Card"
              subtitle="With header, content, and footer"
              action={<Button size="small">Action</Button>}
            />
            <Card.Content>
              <p className="text-gray-600 mb-4">
                This card demonstrates the complete card structure with all available sections.
                You can use this for feature descriptions, product cards, or content blocks.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Responsive design</li>
                <li>Customizable padding</li>
                <li>Multiple shadow options</li>
                <li>Hover effects</li>
              </ul>
            </Card.Content>
            <Card.Footer>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last updated 2 hours ago</span>
                <Button>Get Started</Button>
              </div>
            </Card.Footer>
          </Card>

          <Card border={false} className="bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card.Header title="Special Card" />
            <Card.Content>
              <p className="text-gray-700">
                Cards without borders and with custom background gradients. Perfect for highlighting important content or creating visual interest.
              </p>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home









































        
