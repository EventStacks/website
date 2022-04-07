import Container from '../components/layout/Container'
import Head from '../components/Head'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'

export default function Custom404() {
  return (
    <div>
      <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:pt-6 lg:pb-28 lg:px-8">
        <Container wide>
          <NavBar />
        </Container>
        <Container wide>
          <Head title="404" />
        </Container>
        <div className="grid grid-cols-1 justify-items-center">
          <h3 className="mt-2 text-xl leading-7 font-semibold text-gray-900">
            Not Found
          </h3>
          <h5 className="mt-2 text-md leading-7 font-semibold text-gray-500">
            We could unfortunately not find the content you where looking for
          </h5>
        </div>
      </div>
      <Footer />
    </div>
  )
}
