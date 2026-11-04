import { useState } from 'react'
import './PostPage.css'

function PostPage() {
  const [postType, setPostType] = useState('question')
  const [questionData, setQuestionData] = useState({ title: '', description: '', tags: '' })
  const [articleData, setArticleData] = useState({ title: '', abstract: '', articleText: '', tags: '' })
  const [errors, setErrors] = useState({})
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  // Update question fields
  const handleQuestionChange = (e) => {
    setQuestionData({ ...questionData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  // Update article fields
  const handleArticleChange = (e) => {
    setArticleData({ ...articleData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  // Count the tags (separated by commas or spaces)
  const countTags = (tags) => {
    return tags.split(/[, ]+/).filter((tag) => tag.trim() !== '').length
  }

  // Close the popup
  const closePopup = () => {
    setPopup({ ...popup, show: false })
  }

  // Check the form before posting
  const handleSubmit = (e) => {
    e.preventDefault()
    let newErrors = {}

    if (postType === 'question') {
      if (questionData.title.trim() === '') {
        newErrors.title = 'Title is required for your question.'
      }
      if (questionData.description.trim() === '') {
        newErrors.description = 'Please describe your problem.'
      }
      if (questionData.tags.trim() === '') {
        newErrors.tags = 'At least 1 tag is required.'
      } else if (countTags(questionData.tags) > 3) {
        newErrors.tags = 'Please enter no more than 3 tags.'
      }
    } else {
      if (articleData.title.trim() === '') {
        newErrors.title = 'Title is required for your article.'
      }
      if (articleData.abstract.trim() === '') {
        newErrors.abstract = 'Please provide a 1-paragraph abstract.'
      }
      if (articleData.articleText.trim() === '') {
        newErrors.articleText = 'Article text cannot be empty.'
      }
      if (articleData.tags.trim() === '') {
        newErrors.tags = 'At least 1 tag is required.'
      } else if (countTags(articleData.tags) > 3) {
        newErrors.tags = 'Please enter no more than 3 tags.'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setPopup({
        show: true,
        type: 'error',
        title: 'Validation Error',
        message: Object.values(newErrors).join('\n')
      })
      return
    }

    setPopup({
      show: true,
      type: 'success',
      title: 'Post Sent Successfully!',
      message: postType === 'question'
        ? 'Your question has been posted successfully. (Feature simulation)'
        : 'Your article has been posted successfully. (Feature simulation)'
    })

    if (postType === 'question') {
      setQuestionData({ title: '', description: '', tags: '' })
    } else {
      setArticleData({ title: '', abstract: '', articleText: '', tags: '' })
    }
    setErrors({})
  }

  return (
    <div className="post-page-wrapper">
      <form onSubmit={handleSubmit} noValidate>
        {/* Section: New Post */}
        <div className="post-header-bar">
          New Post
        </div>

        {/* Radio Selector */}
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

        {/* Section: What do you want to ask or share */}
        <div className="post-header-bar">
          What do you want to ask or share
        </div>

        {/* Conditional explanatory note matching prompt */}
        <div className="conditional-note">
          This section is designed based on the type of the post. It could be developed by conditional rendering.{' '}
          <span className="highlight-red">
            {postType === 'question'
              ? 'For post a question, the following section would be appeared.'
              : 'For post an article, the following section would be appeared.'}
          </span>
        </div>

        {/* Conditional Form Rendering */}
        {postType === 'question' ? (
          <div>
            {/* Title */}
            <div className="post-form-row">
              <div className="post-inline-field">
                <label htmlFor="q-title">Title</label>
                <input
                  id="q-title"
                  name="title"
                  type="text"
                  value={questionData.title}
                  onChange={handleQuestionChange}
                  placeholder="Start your question with how, what, why, etc."
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
                  rows={11}
                  value={questionData.description}
                  onChange={handleQuestionChange}
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
                  type="text"
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
                  type="text"
                  value={articleData.title}
                  onChange={handleArticleChange}
                  placeholder="Enter a descriptive title"
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
                  rows={9}
                  value={articleData.articleText}
                  onChange={handleArticleChange}
                  placeholder="Enter a 1-paragraph abstract"
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
                  type="text"
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
          <button type="submit" className="post-btn">
            Post
          </button>
        </div>
      </form>

      {/* Simple Popup Modal */}
      {popup.show && (
        <div className="simple-modal-backdrop" onClick={closePopup}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={closePopup}
              className="simple-modal-close"
              aria-label="Close"
            >
              &times;
            </button>

            <h3 className={`simple-modal-title ${popup.type}`}>
              {popup.title}
            </h3>
            <p className="simple-modal-text">
              {popup.message}
            </p>

            <div className="simple-modal-actions">
              <button
                type="button"
                onClick={closePopup}
                className="simple-modal-btn"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostPage
