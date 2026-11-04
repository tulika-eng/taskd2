import ContentCard from './ContentCard.jsx'
import { articles } from '../data/articles.js'

function FeaturedArticles() {
  return (
    <section className="py-16 px-6 text-center bg-gray-50">
      <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        {articles.map((article) => (
          <ContentCard
            key={article.id}
            image={article.image}
            imageLabel="Article image"
            name={article.name}
            description={article.description}
            rating={article.rating}
            person={article.author}
          />
        ))}
      </div>
      <button className="bg-gray-200 hover:bg-gray-300 rounded-full px-6 py-2 text-sm">
        See all articles
      </button>
    </section>
  )
}

export default FeaturedArticles
