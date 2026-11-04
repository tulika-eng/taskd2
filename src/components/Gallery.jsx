import { galleryImages } from '../data/gallery.js'

function Gallery() {
  return (
    <section className="py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-10">My Gallery</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.map((img) => (
          <img
            key={img.id}
            src={img.src}
            alt={img.alt}
            className="w-full h-64 object-cover rounded-lg"
          />
        ))}
      </div>
    </section>
  )
}

export default Gallery
