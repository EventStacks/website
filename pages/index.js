import Container from '../components/layout/Container'
import Head from '../components/Head'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import LogoAsyncAPI from '../components/LogoAsyncAPI'
import TextTruncate from 'react-text-truncate'
import IconTwitter from '../components/icons/Twitter'
import IconGithub from '../components/icons/Github'
import IconLinkedIn from '../components/icons/LinkedIn'
import IconYoutube from '../components/icons/YouTube'


export default function PostPage() {
  return (
    <div>
      <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:pt-6 lg:pb-28 lg:px-8">
        <Container wide>
          <NavBar />
        </Container>
        <Container wide>
          <Head title="EventStack" />
        </Container>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="mt-12 grid gap-5 max-w-lg lg:grid-cols-12 lg:max-w-none">
            <div className="h-60 col-span-6 object-cover">
              <center>
                <LogoAsyncAPI style={{"width":"70%"}}/>
              </center>
            </div>
            <div className="col-span-5 bg-white p-6 justify-between">
              <h3 className="mt-2 text-xl leading-7 font-semibold text-gray-900">
                AsyncAPI
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-500">
                <TextTruncate element="span" line={4} text="The core of everything, any other projects are derivatives." />
              </p>
              <div className="grid grid-cols-2 gap-1 mt-15">
                <a href="/posts?tag=AsyncAPI" className="text-center">
                  Relevant posts
                </a>
                <a href="https://asyncapi.com" className="text-center">
                    To Project
                  <p className="mt-1 text-base leading-6 text-gray-500">
                    <TextTruncate element="span" line={4} text="asyncapi.com" />
                    <div className="mt-8 flex justify-center">
                      <a href="https://linkedin.com/company/asyncapi" target="_blank" className="text-gray-400 hover:text-blue-500" rel="noreferrer">
                        <span className="sr-only">LinkedIn</span>
                        <IconLinkedIn className="h-6 w-6" />
                      </a>
                      <a href="https://youtube.com/asyncapi" target="_blank" className="ml-6 text-gray-400 hover:text-blue-500" rel="noreferrer">
                        <span className="sr-only">YouTube</span>
                        <IconYoutube className="h-6 w-6" />
                      </a>
                      <a href="https://twitter.com/AsyncAPISpec" target="_blank" className="ml-6 text-gray-400 hover:text-blue-500" rel="noreferrer">
                        <span className="sr-only">Twitter</span>
                        <IconTwitter className="h-6 w-6" />
                      </a>
                      <a href="https://github.com/asyncapi" target="_blank" className="ml-6 text-gray-400 hover:text-gray-500" rel="noreferrer">
                        <span className="sr-only">GitHub</span>
                        <IconGithub className="h-6 w-6" />
                      </a>
                    </div>
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="mt-12 grid gap-5 max-w-lg lg:grid-cols-12 lg:max-w-none">
            <div className="col-span-5 bg-white p-6 justify-between">
              <h3 className="mt-2 text-xl leading-7 font-semibold text-gray-900">
                Gaming API
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-500">
                <TextTruncate element="span" line={4} text="Enabling everyone to easily interact with game servers through AsyncAPI as the backbone." />
              </p>
              <div className="grid grid-cols-2 gap-1 mt-15">
                <a href="/posts?tags=GamingAPI" className="place-self-center text-center">
                  Relevant posts
                </a>
                <a href="https://gamingapi.org" className="place-self-center text-center">
                    To Project
                  <p className="mt-1 text-base leading-6 text-gray-500">
                    <TextTruncate element="span" line={4} text="gamingapi.org" />
                    <div className="mt-8 flex justify-center">
                      <a href="https://github.com/GamingAPI/" target="_blank" className="text-gray-400 hover:text-gray-500" rel="noreferrer">
                        <span className="sr-only">GitHub</span>
                        <IconGithub className="h-6 w-6" />
                      </a>
                    </div>
                  </p>
                </a>
              </div>
            </div>
            <img className="h-60 col-span-6 object-cover" alt="" width="100%" src="/img/event-stack.webp" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
