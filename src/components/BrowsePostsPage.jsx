import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Footer from './Footer.jsx'
import './BrowsePostsPage.css'

function BrowsePostsPage() {
  const { token, isLoggedIn, isPaid } = useAuth()

  // Posts state
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'article', 'question'
  const [filterPlan, setFilterPlan] = useState('all') // 'all', 'free', 'paid'
  const [filterTag, setFilterTag] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // UI state for hide and expand
  const [hiddenPostIds, setHiddenPostIds] = useState(new Set())
  const [expandedPostIds, setExpandedPostIds] = useState(new Set())

  // Fetch posts from backend API
  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/posts', { headers })
      const responseText = await res.text()
      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(`Server returned HTML or invalid JSON (HTTP ${res.status}). Check the Netlify redirect and Render API.`)
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch posts.')
      }

      setPosts(data.posts || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err.message || 'Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [token])

  // Collect all unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tagSet = new Set()
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((t) => {
          if (t && t.trim()) tagSet.add(t.trim())
        })
      }
    })
    return Array.from(tagSet).sort()
  }, [posts])

  // Filter posts based on search and selected filter options
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Exclude hidden posts
      if (hiddenPostIds.has(post.id)) return false

      // 2. Filter by post type
      if (filterType !== 'all' && post.type !== filterType) return false

      // 3. Filter by post plan
      if (filterPlan !== 'all' && post.plan !== filterPlan) return false

      // 4. Filter by tag
      if (filterTag) {
        const matchesTag =
          Array.isArray(post.tags) &&
          post.tags.some((t) => t.toLowerCase() === filterTag.toLowerCase())
        if (!matchesTag) return false
      }

      // 5. Filter by created date (YYYY-MM-DD)
      if (filterDate && post.createdAt) {
        const postDate = new Date(post.createdAt).toISOString().slice(0, 10)
        if (postDate !== filterDate) return false
      }

      // 6. Search by title, content, description, abstract
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const title = (post.title || '').toLowerCase()
        const content = (post.content || '').toLowerCase()
        const description = (post.description || '').toLowerCase()
        const abstract = (post.abstract || '').toLowerCase()
        if (
          !title.includes(q) &&
          !content.includes(q) &&
          !description.includes(q) &&
          !abstract.includes(q)
        ) {
          return false
        }
      }

      return true
    })
  }, [posts, hiddenPostIds, filterType, filterPlan, filterTag, filterDate, searchQuery])

  // Toggle expand / collapse for a single post
  const toggleExpand = (postId) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  // Hide a post locally from view
  const hidePost = (postId) => {
    setHiddenPostIds((prev) => new Set(prev).add(postId))
  }

  // Reset all filters, search query, and restore all hidden posts
  const handleReset = () => {
    setSearchQuery('')
    setFilterType('all')
    setFilterPlan('all')
    setFilterTag('')
    setFilterDate('')
    setHiddenPostIds(new Set())
    setExpandedPostIds(new Set())
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date'
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  // Truncate preview text
  const getPreviewText = (text, maxLength = 180) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <main className="browse-page-wrapper">
        {/* Grey Header Bar: Browse Posts */}
        <div className="browse-header-bar">Browse Posts</div>

        <p className="browse-subtitle">
          View all questions and articles shared by DEV@Deakin members.
          {isLoggedIn ? (
            isPaid ? (
              <span> (Logged in as Paid user: Free & Paid posts visible)</span>
            ) : (
              <span> (Logged in as Free user: Free posts visible)</span>
            )
          ) : (
            <span> (Visitor: Free posts visible)</span>
          )}
        </p>

        {/* Filter & Search Box */}
        <div className="browse-filter-box">
          {/* Row 1: Search and Reset */}
          <div className="browse-filter-row">
            <div className="browse-filter-field browse-search-input">
              <label htmlFor="search-input">Search:</label>
              <input
                id="search-input"
                type="text"
                placeholder="Search by title or content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button type="button" className="browse-btn" onClick={handleReset}>
              Reset
            </button>
          </div>

          {/* Row 2: Type, Plan, Tag, Date filters */}
          <div className="browse-filter-row">
            {/* Filter by Type */}
            <div className="browse-filter-field">
              <label htmlFor="filter-type">Post Type:</label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="question">Question</option>
                <option value="article">Article</option>
              </select>
            </div>

            {/* Filter by Plan (Paid option only shown if user has paid access) */}
            <div className="browse-filter-field">
              <label htmlFor="filter-plan">Post Plan:</label>
              <select
                id="filter-plan"
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                {isPaid && <option value="paid">Paid</option>}
              </select>
            </div>

            {/* Filter by Tag */}
            <div className="browse-filter-field">
              <label htmlFor="filter-tag">Tag:</label>
              <select
                id="filter-tag"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Created Date */}
            <div className="browse-filter-field">
              <label htmlFor="filter-date">Created Date:</label>
              <input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {hiddenPostIds.size > 0 && (
            <div className="browse-hidden-notice">
              {hiddenPostIds.size} post(s) hidden.{' '}
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#0056b3',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Click Reset to restore all
              </button>
            </div>
          )}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="browse-empty-msg">Loading posts...</div>
        ) : error ? (
          <div className="browse-empty-msg" style={{ color: '#cc0000' }}>
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="browse-empty-msg">No posts match your filters.</div>
        ) : (
          <div className="browse-post-list">
            {filteredPosts.map((post) => {
              const isExpanded = expandedPostIds.has(post.id)
              const isArticle = post.type === 'article'
              const mainText = post.content || post.description || ''

              return (
                <div key={post.id} className="browse-post-card">
                  {/* Card top row */}
                  <div className="browse-card-top">
                    <div>
                      {/* Meta: Type, Plan, Date, Author */}
                      <div className="browse-card-meta">
                        <strong>[{post.type ? post.type.toUpperCase() : 'POST'}]</strong>
                        <span>Plan: {post.plan ? post.plan.toUpperCase() : 'FREE'}</span>
                        <span>|</span>
                        <span>Date: {formatDate(post.createdAt)}</span>
                        {post.authorName && (
                          <>
                            <span>|</span>
                            <span>By: {post.authorName}</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div
                        className="browse-card-title"
                        onClick={() => toggleExpand(post.id)}
                        title="Click to expand/collapse"
                      >
                        {post.title}
                      </div>
                    </div>

                    {/* Hide Button */}
                    <button
                      type="button"
                      className="browse-btn-small"
                      onClick={() => hidePost(post.id)}
                      title="Hide post from view"
                    >
                      Hide
                    </button>
                  </div>

                  {/* Article Abstract */}
                  {isArticle && post.abstract && (
                    <div className="browse-card-abstract">
                      <strong>Abstract: </strong>
                      {post.abstract}
                    </div>
                  )}

                  {/* Preview or Full Content */}
                  {isExpanded ? (
                    <div className="browse-card-content">
                      {mainText || 'No additional content.'}
                    </div>
                  ) : (
                    <div className="browse-card-preview">
                      {getPreviewText(mainText) || (post.abstract ? '' : 'No content preview.')}
                    </div>
                  )}

                  {/* Card Footer: Tags & Expand/Collapse button */}
                  <div className="browse-card-actions">
                    <div>
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <span style={{ marginRight: '8px' }}>
                          Tags:{' '}
                          {post.tags.map((t, i) => (
                            <span key={i} className="browse-tag-pill" style={{ marginRight: '4px' }}>
                              {t}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>

                    <div className="browse-card-buttons">
                      <button
                        type="button"
                        className="browse-btn-small"
                        onClick={() => toggleExpand(post.id)}
                      >
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}

export default BrowsePostsPage
