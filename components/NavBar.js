import Link from 'next/link'

export default function NavBar() {
  return (
  <div className="inset-0 leading-8 mb-6">
    <div className="max-w-4xl block px-4 sm:px-6 lg:px-8 container mx-auto clear-both" >
      <nav className="-mx-5 -my-2 flex flex-wrap">
        <div className="px-5 py-2">
          <a className="site-title" rel="author" href="/posts/eventstack">EventStack</a>
        </div>
        <div className="flex-grow"></div>

        <div className="px-5 py-2">
          <Link href="/" className="text-base leading-6 text-gray-500 hover:text-gray-900">
            Projects
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link href="/posts" className="text-base leading-6 text-gray-500 hover:text-gray-900">
            Posts
          </Link>
        </div>
      </nav>
    </div>
  </div>
  );
}