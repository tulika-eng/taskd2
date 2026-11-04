import { Star } from 'lucide-react'

function ContentCard({ image, imageLabel, name, description, rating, person }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-64 text-left">
      <div className="w-full h-36 rounded-md overflow-hidden mb-3 bg-gray-100 flex items-center justify-center">
        <img src={image} alt={imageLabel || name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-lg font-bold mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-3">
        Description
        <br />
        <span className="text-gray-400">e.g., {description}</span>
      </p>
      <hr className="border-dashed mb-2" />
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1 font-semibold">
          <Star size={16} fill="#f5b301" stroke="#f5b301" /> {rating}
        </span>
        <span className="text-blue-600 font-medium">{person}</span>
      </div>
    </div>
  )
}

export default ContentCard
