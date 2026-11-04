import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './PostPage.css'

function PostPage() {
  const { user, token, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [postType, setPostType] = useState('question')
  const [postPlan, setPostPlan] = useState('free')
  const [questionData, setQuestionData] = useState({ title: '', description: '', tags: '' })
  const [articleData, setArticleData] = useState({ title: '', abstract: '', articleText: '', tags: '' })
  const [errors, setErrors] = useState({})
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update question fields
  const handleQuestionChange = (e) => {
    setQuestionData({ ...questionData, [e.target.name]: e.target.value })
  }

  // Update article fields
  const handleArticleChange = (e) => {
    setArticleData({ ...articleData, [e.target.name]: e.target.value })
  }

  // Count the tags
  const countTags = (tags) => {
    return tags.split(',').filter((tag) => tag.trim() !== '').length
  }

  // Close the popup
  const closePopup = () => {
    setPopup({ ...popup, show: false })
  }

  // Frontend validation
  const validateForm = () => {
    let newErrors = {}

    // Validate post plan
    if (!['free', 'paid'].includes(postPlan)) {
      newErrors.plan = 'Please select a valid post plan (Free or Paid).'
    }

    // Validate post type
    if (!['question', 'article'].includes(postType)) {
      newErrors.postType = 'Please select a valid post type.'
    }

    if (postType === 'question') {
      if (!questionData.title || questionData.title.trim() === '') {
        newErrors.title = 'Title is required for your question.'
      } else if (questionData.title.trim().length > 150) {
        newErrors.title = 'Title must be 150 characters or fewer.'
      }
      if (!questionData.description || questionData.description.trim() === '') {
        newErrors.description = 'Please describe your problem.'
      } else if (questionData.description.trim().length > 5000) {
        newErrors.description = 'Description must be 5000 characters or fewer.'
      }
      if (!questionData.tags || questionData.tags.trim() === '') {
        newErrors.tags = 'At least 1 tag is required.'
      } else if (countTags(questionData.tags) > 3) {
        newErrors.tags = 'Please enter no more than 3 tags.'
      }
    } else {
      if (!articleData.title || articleData.title.trim() === '') {
        newErrors.title = 'Title is required for your article.'
      } else if (articleData.title.trim().length > 150) {
        newErrors.title = 'Title must be 150 characters or fewer.'
      }
      if (!articleData.abstract || articleData.abstract.trim() === '') {
        newErrors.abstract = 'Please provide a 1-paragraph abstract.'
      } else if (articleData.abstract.trim().length > 500) {
        newErrors.abstract = 'Abstract must be 500 characters or fewer.'
      }
      if (!articleData.articleText || articleData.articleText.trim() === '') {
        newErrors.articleText = 'Article text cannot be empty.'
      } else if (articleData.articleText.trim().length > 10000) {
        newErrors.articleText = 'Article text must be 10000 characters or fewer.'
      }
      if (!articleData.tags || articleData.tags.trim() === '') {
        newErrors.tags = 'At least 1 tag is required.'
      } else if (countTags(articleData.tags) > 3) {
        newErrors.tags = 'Please enter no more than 3 tags.'
      }
    }

    return newErrors
  }

  // Check the form and submit to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Must be logged in
    if (!isLoggedIn || !token) {
      setPopup({
        show: true,
        type: 'error',
        title: 'Login Required',
        message: 'You must be logged in to create a post. Redirecting to login...',
      })
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setPopup({
        show: true,
        type: 'error',
        title: 'Validation Error',
        message: Object.values(newErrors).join('\n'),
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Build the post payload to send to backend
      const tags =
        postType === 'question'
          ? questionData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : articleData.tags.split(',').map((t) => t.trim()).filter(Boolean)

      const payload = {
        type: postType,
        plan: postPlan,
        title: postType === 'question' ? questionData.title.trim() : articleData.title.trim(),
        tags,
        ...(postType === 'question'
          ? {
              description: questionData.description.trim(),
            }
          : {
              abstract: articleData.abstract.trim(),
              content: articleData.articleText.trim(),
            }),
      }

      // Send to backend API endpoint (NOT directly to Firestore)
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const responseText = await res.text()
      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(`Server returned HTML or invalid JSON (HTTP ${res.status}). Check the Netlify redirect and Render API.`)
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create post.')
      }

      setPopup({
        show: true,
        type: 'success',
        title: 'Post Created Successfully!',
        message:
          postType === 'question'
            ? 'Your question has been saved successfully.'
            : 'Your article has been saved successfully.',
      })

      // Reset form
      if (postType === 'question') {
        setQuestionData({ title: '', description: '', tags: '' })
      } else {
        setArticleData({ title: '', abstract: '', articleText: '', tags: '' })
      }
      setErrors({})
    } catch (err) {
      console.error('Error creating post:', err)
      setPopup({
        show: true,
        type: 'error',
        title: 'Failed to Create Post',
        message: err.message || 'Could not save post. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="post-page-wrapper">
      <form onSubmit={handleSubmit} noValidate>
        {/* Grey Header Bar: New Post */}
        <div className="post-header-bar">New Post</div>

        {/* Post Type Selector */}
        <div className="post-type-selector">
          <span className="selector-label">Select Post Type:</span>

          <label className="post-type-radio-label">
            <input
              type="radio"
              name="postType"
              value="question"
              checked={postType === 'question'}
              onChange={() => {
                setPostType('question')
                setErrors({})
              }}
            />
            Question
          </label>

          <label className="post-type-radio-label">
            <input
              type="radio"
              name="postType"
              value="article"
              checked={postType === 'article'}
              onChange={() => {
                setPostType('article')
                setErrors({})
              }}
            />
            Article
          </label>
        </div>

        {/* Post Plan Selector */}
        <div className="post-type-selector">
          <span className="selector-label">Select Post Plan:</span>

          <label className="post-type-radio-label">
            <input
              type="radio"
              name="postPlan"
              value="free"
              checked={postPlan === 'free'}
              onChange={() => setPostPlan('free')}
            />
            Free
          </label>

          <label className="post-type-radio-label">
            <input
              type="radio"
              name="postPlan"
              value="paid"
              checked={postPlan === 'paid'}
              onChange={() => setPostPlan('paid')}
            />
            Paid
          </label>
        </div>

        {/* Grey Header Bar: What do you want to ask or share */}
        <div className="post-header-bar">What do you want to ask or share</div>

        {/* Explanatory Note with Conditional Red Text */}
        <p className="conditional-note">
          This section is designed based on the type of the post. It could be developed by conditional rendering.{' '}
          <span className="highlight-red">
            {postType === 'question'
              ? 'For post a question, the following section would be appeared.'
              : 'For post an article, the following section would be appeared.'}
          </span>
        </p>

        {/* Conditional Form Content */}
        {postType === 'question' ? (
          <div>
            {/* Title */}
            <div className="post-form-row">
              <div className="post-inline-field">
                <label htmlFor="q-title">Title</label>
                <input
                  id="q-title"
                  name="title"
                  value={questionData.title}
                  onChange={handleQuestionChange}
                  placeholder="Start your question with how, what, why, etc."
                  maxLength={150}
                />
              </div>
              {errors.title && <div className="post-error-msg">{errors.title}</div>}
            </div>

            {/* Describe your problem */}
            <div className="post-form-row">
              <div className="post-block-field">
                <label htmlFor="q-desc">Describe your problem</label>
                <textarea
                  id="q-desc"
                  name="description"
                  rows={10}
                  value={questionData.description}
                  onChange={handleQuestionChange}
                  maxLength={5000}
                />
              </div>
              {errors.description && (
                <div className="post-error-msg-block">{errors.description}</div>
              )}
            </div>

            {/* Tags */}
            <div className="post-form-row">
              <div className="post-inline-field">
                <label htmlFor="q-tags">Tags</label>
                <input
                  id="q-tags"
                  name="tags"
                  value={questionData.tags}
                  onChange={handleQuestionChange}
                  placeholder="Please add up to 3 tags to describe what your question is about e.g., Java"
                />
              </div>
              {errors.tags && <div className="post-error-msg">{errors.tags}</div>}
            </div>
          </div>
        ) : (
          <div>
            {/* Title */}
            <div className="post-form-row">
              <div className="post-inline-field">
                <label htmlFor="a-title">Title</label>
                <input
                  id="a-title"
                  name="title"
                  value={articleData.title}
                  onChange={handleArticleChange}
                  placeholder="Enter a descriptive title"
                  maxLength={150}
                />
              </div>
              {errors.title && <div className="post-error-msg">{errors.title}</div>}
            </div>

            {/* Abstract */}
            <div className="post-form-row">
              <div className="post-block-field">
                <label htmlFor="a-abstract">Abstract</label>
                <textarea
                  id="a-abstract"
                  name="abstract"
                  rows={3}
                  value={articleData.abstract}
                  onChange={handleArticleChange}
                  placeholder="Enter a 1-paragraph abstract"
                  maxLength={500}
                />
              </div>
              {errors.abstract && (
                <div className="post-error-msg-block">{errors.abstract}</div>
              )}
            </div>

            {/* Article Text */}
            <div className="post-form-row">
              <div className="post-block-field">
                <label htmlFor="a-text">Article Text</label>
                <textarea
                  id="a-text"
                  name="articleText"
                  rows={8}
                  value={articleData.articleText}
                  onChange={handleArticleChange}
                  placeholder="Write the full article content"
                  maxLength={10000}
                />
              </div>
              {errors.articleText && (
                <div className="post-error-msg-block">{errors.articleText}</div>
              )}
            </div>

            {/* Tags */}
            <div className="post-form-row">
              <div className="post-inline-field">
                <label htmlFor="a-tags">Tags</label>
                <input
                  id="a-tags"
                  name="tags"
                  value={articleData.tags}
                  onChange={handleArticleChange}
                  placeholder="Please add up to 3 tags to describe what your article is about e.g., Java"
                />
              </div>
              {errors.tags && <div className="post-error-msg">{errors.tags}</div>}
            </div>
          </div>
        )}

        {/* Post Button */}
        <div className="post-action-bar">
          <button type="submit" className="post-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Popup Dialog */}
      {popup.show && (
        <div className="simple-modal-backdrop" role="dialog" aria-modal="true" onClick={closePopup}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="simple-modal-close" onClick={closePopup}>
              ×
            </button>
            <h3 className={`simple-modal-title ${popup.type}`}>{popup.title}</h3>
            <p className="simple-modal-text">{popup.message}</p>
            <div className="simple-modal-actions">
              <button type="button" className="simple-modal-btn" onClick={closePopup}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default PostPage
