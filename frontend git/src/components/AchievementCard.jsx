function AchievementCard({ title, image, description }) {
  return (
    <div className="bg-white rounded-lg flex-1">
      <img src={image} alt={title} className="w-full h-64 object-cover rounded-lg" />
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default AchievementCard
