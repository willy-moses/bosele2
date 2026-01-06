
import Header from '../components/Header'
import Hero from '../components/Hero'
import About from '../components/About'
import Statistics from '../components/Statistics'
import Calendar from '../components/Calendar'
import Activities from '../components/Activities'
import Gallery from '../components/Gallery'
import Resources from '../components/Resources'
import Committee from '../components/Committee'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import News from '../components/News'
import QuickLinks from '../components/QuickLinks'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import WhatsAppFloat from '../components/WhatsAppFloat'
import ScrollToTop from '../components/ScrollToTop'

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <main className="min-h-screen">
        <About />
        <Statistics />
        <Calendar />
        <Activities />
        <Gallery />
        <Resources />
        <Committee />
        <Testimonials />
        <FAQ />
        <News />
        <QuickLinks />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </>
  )
}
