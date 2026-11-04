function Banner() {
  return (
    <section className="relative h-[700px] group overflow-hidden">
      <img src="/images/banner.png" alt="Deakin University" className="w-full h-full object-cover" />
      <div
        className="absolute bottom-0 left-0 w-full bg-black/70 text-white text-center py-4
                   opacity-0 group-hover:opacity-100 transition duration-300"
      >
        <h2 className="text-2xl">Hello, I am Tulika. Welcome to my personal Webpage</h2>
      </div>
    </section>
  )
}

export default Banner
