import IconTwitter from './icons/Twitter'
import IconGithub from './icons/Github'
import IconLinkedIn from './icons/LinkedIn'
import IconStackOverflow from './icons/StackOverflow'

export default function Footer() {
  return (
    <div className="bg-white mt-12">
      <div className="max-w-screen-xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="mt-8 flex justify-center">
          <a href="https://linkedin.com/in/jonaslagoni" target="_blank" className="text-gray-400 hover:text-blue-500" rel="noreferrer">
            <span className="sr-only">LinkedIn</span>
            <IconLinkedIn className="h-6 w-6" />
          </a>
          <a href="https://twitter.com/jonaslagoni" target="_blank" className="ml-6 text-gray-400 hover:text-blue-500" rel="noreferrer">
            <span className="sr-only">Twitter</span>
            <IconTwitter className="h-6 w-6" />
          </a>
          <a href="https://github.com/jonaslagoni" target="_blank" className="ml-6 text-gray-400 hover:text-gray-500" rel="noreferrer">
            <span className="sr-only">GitHub</span>
            <IconGithub className="h-6 w-6" />
          </a>
          <a href="https://stackoverflow.com/users/6803886/jonaslagoni" target="_blank" className="ml-6 text-gray-400 hover:text-gray-500" rel="noreferrer">
            <span className="sr-only">StackOverflow</span>
            <IconStackOverflow className="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  )
}