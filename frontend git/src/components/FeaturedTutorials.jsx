import ContentCard from './ContentCard.jsx'
import { tutorials } from '../data/tutorials.js'

function FeaturedTutorials() {
  return (
    <section className="py-16 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8">Featured Tutorials</h2>
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        {tutorials.map((tutorial) => (
          <ContentCard
            key={tutorial.id}
            image={tutorial.image}
            imageLabel="Tutorial image"
            name={tutorial.name}
            description={tutorial.description}
            rating={tutorial.rating}
            person={tutorial.username}
          />
        ))}
      </div>
      <button className="bg-gray-200 hover:bg-gray-300 rounded-full px-6 py-2 text-sm">
        See all tutorials
      </button>
    </section>
  )
}

export default FeaturedTutorials
