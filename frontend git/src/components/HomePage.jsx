import Banner from './Banner.jsx'
import About from './About.jsx'
import Achievements from './Achievements.jsx'
import Gallery from './Gallery.jsx'
import FeaturedArticles from './FeaturedArticles.jsx'
import FeaturedTutorials from './FeaturedTutorials.jsx'
import Footer from './Footer.jsx'

// NavBar now lives in App.jsx so it shows on every page (home, login, sign up).
function HomePage() {
  return (
    <>
      <Banner />
      <About />
      <Achievements />
      <Gallery />
      <FeaturedArticles />
      <FeaturedTutorials />
      <Footer />
    </>
  )
}

export default HomePage
