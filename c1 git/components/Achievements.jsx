import AchievementCard from './AchievementCard.jsx'
import { achievements } from '../data/achievements.js'

function Achievements() {
  return (
    <section id="work" className="bg-white py-10 px-2 mt-4 text-center">
      <h2 className="text-2xl font-bold mx-auto">Things I have done after joining college</h2>
      <section className="py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          {achievements.map((item) => (
            <AchievementCard
              key={item.id}
              title={item.title}
              image={item.image}
              description={item.description}
            />
          ))}
        </div>
      </section>
    </section>
  )
}

export default Achievements
