//step1 creating a new react application using vite
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
//step2 install and configure tailind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

//STEP3 install react router nd setup project structure
npm install react-router-dom

/*src/
├── components/
│   ├── common/
│   └── ui/
├── pages/
├── utils/
├── hooks/
└── constants/ */

  //STEP5  impliment the application
  import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

//Create src/App.jsx:
import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
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

//Create src/components/common/Layout.jsx:
import { Link, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">MyApp</span>
            </div>
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === item.href
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

export default Layout

//Create src/components/ui/Button.jsx:

const Button = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}

export default Button

//Create the pages:
import Button from '../components/ui/Button'

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Our Application
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          This is a modern React application built with Vite, Tailwind CSS, and React Router.
        </p>
        <div className="space-x-4">
          <Button>Get Started</Button>
          <Button variant="secondary">Learn More</Button>
        </div>
      </div>
    </div>
  )
}

export default Home

//src/pages/About.jsx:
const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>
      <div className="prose prose-lg">
        <p className="text-gray-600 mb-4">
          This is a demonstration of a React application with modern tooling and best practices.
        </p>
        <p className="text-gray-600">
          Features include:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Vite for fast development</li>
          <li>Tailwind CSS for styling</li>
          <li>React Router for navigation</li>
          <li>Component-based architecture</li>
        </ul>
      </div>
    </div>
  )
}

export default About

//src/pages/Contact.jsx:
import Button from '../components/ui/Button'

const Contact = () => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>
        <Button type="submit">Send Message</Button>
      </form>
    </div>
  )
}

export default Contact


//src/pages/NotFound.jsx:
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const NotFound = () => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-8">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  )
}

export default NotFound

/* Create Utility Files:
src/utils/constants.js: */
export const APP_NAME = 'My React App'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
}
//src/utils/helpers.js:
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

//Step 6: Update package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}

//Step 7: Run the application:
npm run dev







