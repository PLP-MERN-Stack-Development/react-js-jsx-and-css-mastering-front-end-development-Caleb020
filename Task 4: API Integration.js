/*Step 1: Create API Service
src/services/api.js*/

const BASE_URL = 'https://jsonplaceholder.typicode.com'

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Posts API
export const postsAPI = {
  // Get all posts with pagination
  getPosts: (page = 1, limit = 10) => 
    apiRequest(`/posts?_page=${page}&_limit=${limit}`),
  
  // Get single post
  getPost: (id) => 
    apiRequest(`/posts/${id}`),
  
  // Get posts by user
  getPostsByUser: (userId) => 
    apiRequest(`/posts?userId=${userId}`),
  
  // Create new post
  createPost: (post) => 
    apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    }),
  
  // Update post
  updatePost: (id, post) => 
    apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    }),
  
  // Delete post
  deletePost: (id) => 
    apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    }),
}

// Users API
export const usersAPI = {
  // Get all users
  getUsers: () => 
    apiRequest('/users'),
  
  // Get single user
  getUser: (id) => 
    apiRequest(`/users/${id}`),
}

// Comments API
export const commentsAPI = {
  // Get comments for a post
  getCommentsByPost: (postId) => 
    apiRequest(`/comments?postId=${postId}`),
}

// Search across posts
export const searchPosts = async (query, page = 1, limit = 10) => {
  // Since JSONPlaceholder doesn't have search, we'll implement client-side search
  const posts = await apiRequest('/posts')
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.body.toLowerCase().includes(query.toLowerCase())
  )
  
  // Implement pagination manually
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)
  
  return {
    data: paginatedPosts,
    total: filteredPosts.length,
    page,
    totalPages: Math.ceil(filteredPosts.length / limit),
  }
}

// Get posts with user data
export const getPostsWithUsers = async (page = 1, limit = 10) => {
  const [posts, users] = await Promise.all([
    postsAPI.getPosts(page, limit),
    usersAPI.getUsers(),
  ])

  // Enrich posts with user data
  const postsWithUsers = posts.map(post => ({
    ...post,
    user: users.find(user => user.id === post.userId),
  }))

  // Get total count for pagination (JSONPlaceholder doesn't provide this)
  const allPosts = await postsAPI.getPosts(1, 1000) // Get large number to count
  const total = allPosts.length

  return {
    data: postsWithUsers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}



/*Step 2: Create Custom Hook for API Data
src/hooks/useApi.js*/

import { useState, useEffect } from 'react'

export const useApi = (apiFunction, initialData = null, immediate = true) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...params) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(...params)
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
      console.error('API call failed:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    setData,
  }
}


/*Step 3: Create Posts Manager Component
src/components/posts/PostsManager.jsx*/

import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useApi } from '../../hooks/useApi'
import { getPostsWithUsers, searchPosts } from '../../services/api'
import Button from '../ui/Button'
import Card from '../ui/Card'
import SearchBar from './SearchBar'
import PostsGrid from './PostsGrid'
import PostsList from './PostsList'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'
import Pagination from './Pagination'

const PostsManager = () => {
  const { isDarkMode } = useTheme()
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const postsPerPage = 9

  // Fetch posts
  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
    execute: fetchPosts,
  } = useApi(() => getPostsWithUsers(currentPage, postsPerPage), null, false)

  // Search posts
  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
    execute: executeSearch,
  } = useApi(() => searchPosts(searchQuery, currentPage, postsPerPage), null, false)

  // Determine which data to use
  const displayData = searchQuery ? searchData : postsData
  const loading = postsLoading || searchLoading
  const error = postsError || searchError

  // Load posts when page changes
  useEffect(() => {
    if (searchQuery) {
      executeSearch(searchQuery, currentPage)
    } else {
      fetchPosts(currentPage)
    }
  }, [currentPage, searchQuery])

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Refresh data
  const handleRefresh = () => {
    if (searchQuery) {
      executeSearch(searchQuery, currentPage)
    } else {
      fetchPosts(currentPage)
    }
  }

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            JSONPlaceholder Posts
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore posts from JSONPlaceholder API with real-time search and pagination
          </p>
        </div>

        {/* Controls Card */}
        <Card
          className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
          shadow="medium"
        >
          <Card.Content>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  loading={searchLoading}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search Info */}
            {searchQuery && (
              <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing results for "{searchQuery}"
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleSearch('')}
                  className="ml-2"
                >
                  Clear
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Stats Card */}
        {displayData && (
          <Card
            className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
            shadow="small"
          >
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {displayData.total || 0}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Posts
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {displayData.data?.length || 0}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {displayData.totalPages || 0}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Pages
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentPage}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Current Page
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner isDarkMode={isDarkMode} />}

        {/* Error State */}
        {error && (
          <ErrorMessage 
            message={error}
            onRetry={handleRefresh}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Empty State */}
        {!loading && !error && displayData?.data?.length === 0 && (
          <Card
            className={`text-center py-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
          >
            <Card.Content>
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No posts found
              </h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'No posts available at the moment'
                }
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => handleSearch('')}
                >
                  Clear Search
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Posts Display */}
        {!loading && !error && displayData?.data && displayData.data.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <PostsGrid 
                posts={displayData.data} 
                isDarkMode={isDarkMode}
              />
            ) : (
              <PostsList 
                posts={displayData.data} 
                isDarkMode={isDarkMode}
              />
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && !error && displayData?.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={displayData.totalPages}
            onPageChange={handlePageChange}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  )
}

export default PostsManager



  /*Step 4: Create SearchBar Component
src/components/posts/SearchBar.jsx*/

import { useState, useEffect } from 'react'
import Button from '../ui/Button'

const SearchBar = ({ onSearch, loading = false, isDarkMode = false }) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== '') {
      onSearch(debouncedQuery)
    } else if (debouncedQuery === '') {
      onSearch('')
    }
  }, [debouncedQuery, onSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts by title or content..."
          className={`block w-full pl-10 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          disabled={loading}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 rounded-md ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <Button
            type="submit"
            size="small"
            loading={loading}
            className="px-3"
          >
            Search
          </Button>
        </div>
      </div>
      
      {/* Search tips */}
      <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Tip: Search by post title or content. Results update as you type.
      </div>
    </form>
  )
}

export default SearchBar



/*Step 5: Create PostsGrid Component
src/components/posts/PostsGrid.jsx*/

import PostCard from './PostCard'

const PostsGrid = ({ posts, isDarkMode = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  )
}

export default PostsGrid



/*Step 6: Create PostsList Component
src/components/posts/PostsList.jsx*/

import PostListItem from './PostListItem'

const PostsList = ({ posts, isDarkMode = false }) => {
  return (
    <div className="space-y-4 mb-8">
      {posts.map((post) => (
        <PostListItem 
          key={post.id} 
          post={post} 
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  )
}

export default PostsList



/*Step 7: Create PostCard Component
src/components/posts/PostCard.jsx*/

import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

const PostCard = ({ post, isDarkMode = false }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <Card 
      className={`h-full flex flex-col transition-all duration-200 hover:shadow-lg ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : ''
      }`}
      hover
    >
      <Card.Header
        title={post.title}
        className={isDarkMode ? 'text-white' : ''}
      />
      
      <Card.Content className="flex-1">
        <div className="mb-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {expanded ? post.body : truncateText(post.body)}
          </p>
        </div>

        {/* User info */}
        {post.user && (
          <div className={`flex items-center space-x-3 mt-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {post.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {post.user.name}
              </p>
              <p className={`text-xs truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {post.user.email}
              </p>
            </div>
          </div>
        )}
      </Card.Content>

      <Card.Footer>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Post #{post.id}
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={toggleExpanded}
            >
              {expanded ? 'Show Less' : 'Read More'}
            </Button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default PostCard




/*Step 8: Create PostListItem Component
src/components/posts/PostListItem.jsx*/

import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

const PostListItem = ({ post, isDarkMode = false }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : ''
      }`}
      hover
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        {/* Content */}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {post.title}
          </h3>
          
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {expanded ? post.body : truncateText(post.body)}
          </p>

          {/* User info */}
          {post.user && (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {post.user.name.charAt(0)}
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {post.user.name}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-4 lg:pl-4 lg:border-l lg:border-gray-200 dark:lg:border-gray-600">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            #{post.id}
          </span>
          <Button
            variant="outline"
            size="small"
            onClick={toggleExpanded}
          >
            {expanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default PostListItem



/*Step 9: Create Pagination Component
src/components/posts/Pagination.jsx*/

import Button from '../ui/Button'

const Pagination = ({ currentPage, totalPages, onPageChange, isDarkMode = false }) => {
  const maxVisiblePages = 5

  const getPageNumbers = () => {
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(currentPage - half, 1)
    let end = Math.min(start + maxVisiblePages - 1, totalPages)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1)
    }

    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between border-t pt-6 ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {/* Mobile */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-700'
          }`}>
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* First Page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                  : `bg-white text-gray-500 hover:bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700`
              }`}
            >
              <span className="sr-only">First</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Previous Page */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                  : `bg-white text-gray-500 hover:bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700`
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200'
                    : `bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700`
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Page */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                  : `bg-white text-gray-500 hover:bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700`
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last Page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                  : `bg-white text-gray-500 hover:bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700`
              }`}
            >
              <span className="sr-only">Last</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Pagination



/*Step 10: Create UI Components
src/components/ui/LoadingSpinner.jsx*/

const LoadingSpinner = ({ size = 'large', isDarkMode = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-indigo-600 mx-auto ${sizeClasses[size]}`}></div>
        <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading posts...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner

//src/components/ui/ErrorMessage.jsx

import Button from './Button'

const ErrorMessage = ({ message, onRetry, isDarkMode = false }) => {
  return (
    <div className={`rounded-lg p-6 text-center ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
      <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white

                                                 



