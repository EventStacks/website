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
          <Head title="Projects" />
        </Container>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:max-w-none">
            <div className="h-60 lg:col-span-6 sm:col-span-12 object-cover">
              <center>
                <LogoAsyncAPI className={"h-60 w-auto mt-0.5"}/>
              </center>
            </div>
            <div className="lg:col-span-6 sm:col-span-12 bg-white p-6 justify-between">
              <h3 className="mt-2 text-xl leading-7 font-semibold text-gray-900">
                AsyncAPI
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-500">
                <TextTruncate element="span" line={4} text="Used as single source of truth for any application within a system. This is the core project any other derive from." />
              </p>
              <div className="grid grid-cols-2 gap-1 mt-15">
                <div className="col-span-1 bg-white p-6 justify-between">
                  <a href="/posts?tags=AsyncAPI" className="text-center">
                    Relevant posts
                  </a>
                </div>
                <div className="col-span-1 bg-white p-6 justify-between">
                  <p className="text-center">
                    <a href="https://asyncapi.com" className="text-center">
                      To Project
                      <p className="mt-1 text-base leading-6 text-gray-500">asyncapi.com</p>
                    </a>
                  </p>
                  <p className="mt-1 text-base leading-6 text-gray-500">
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:max-w-none">
            <div className="lg:col-span-6 sm:col-span-12 bg-white p-6 justify-between">
              <h3 className="mt-2 text-xl leading-7 font-semibold text-gray-900">
                GamingAPI
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-500">
                <TextTruncate element="span" line={4} text="Enabling everyone to easily interact with game servers through AsyncAPI as the backbone. When AsyncAPI is used as a single source of truth you get amazing documentation, segregation of messages, code generation, versioning, ..., all in one bucket." />
              </p>
              <div className="grid grid-cols-2 gap-1 mt-15">
                <div className="col-span-1 bg-white p-6 justify-between">
                  <a href="/posts?tags=GamingAPI" className="place-self-center text-center">
                    Relevant posts
                  </a>
                </div>
                <div className="col-span-1 bg-white p-6 justify-between">
                  <p className="text-center">
                    <a href="https://gamingapi.org" className="text-center">
                      To Project
                      <p className="mt-1 text-base leading-6 text-gray-500">gamingapi.org</p>
                    </a>
                  </p>
                  <p className="mt-1 text-base leading-6 text-gray-500">
                    <div className="mt-8 flex justify-center">
                      <a href="https://github.com/GamingAPI/" target="_blank" className="text-gray-400 hover:text-gray-500" rel="noreferrer">
                        <span className="sr-only">GitHub</span>
                        <IconGithub className="h-6 w-6" />
                      </a>
                    </div>
                  </p>
                </div>
              </div>
            </div>
            <img className="h-60 lg:col-span-6 sm:col-span-12 object-cover" alt="" width="100%" src="/img/event-stack.webp" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
