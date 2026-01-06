import { useState } from 'react'
import Scrollspy from 'react-scrollspy'
import Link from 'next/link'
import ArrowRight from './icons/ArrowRight'

export default function TOC({
  className,
  cssBreakingPoint = 'xl',
  toc,
  contentSelector,
  depth = 2,
}) {
  const [open, setOpen] = useState(true)

  if (!toc || !toc.length) return null
  const minLevel = toc.reduce((mLevel, item) => (!mLevel || item.lvl < mLevel) ? item.lvl : mLevel, 0)
  const tocItems = toc.filter(item => item.lvl <= minLevel + depth).map(item => ({
    ...item,
    content: item.content.replace(/[\s]?\{\#[\w\d\-_]+\}$/, '').replace(/(<([^>]+)>)/gi, ''),
    //For TOC rendering in specification files in the spec repo we have "a" tags added manually to the spec markdown document
    //MDX takes these "a" tags and uses them to render the "id" for headers like a-namedefinitionsapplicationaapplication
    //slugWithATag contains transformed heading name that is later used for scroll spy identification
    slugWithATag: item.content.replace(/<|>|"|\\|\/|=/gi, '').replace(/\s/gi, '-').toLowerCase()
}))


  return (
    <div className={`${className} ${tocItems.length ? '' : 'hidden'} ${cssBreakingPoint}:block z-20`}>
      <div className={`flex cursor-pointer ${tocItems.length ? '' : 'hidden'} ${cssBreakingPoint}:cursor-auto`} onClick={() => setOpen(!open)}>
        <h5 className={`mb-4 flex-1 text-gray-600 font-normal uppercase tracking-wide text-xs font-sans antialiased`}>
          On this page
        </h5>
        <div className={`text-underline text-center p4 ${cssBreakingPoint}:hidden`}>
          <ArrowRight className={`${ open ? '-rotate-90' : 'rotate-90' } transform transition duration-200 ease-in-out h-6 -mt-0.5 text-gray-400`} />
        </div>
      </div>
      <div className={`${cssBreakingPoint}:block ${!open ? 'hidden' : ''}`}>
        <Scrollspy
          items={tocItems.map(item => item.slugWithATag)}
          currentClassName="text-blue-600 font-semibold border-l-2 border-blue-600"
          componentTag="div"
          rootEl={contentSelector}
        >
          {
            tocItems.map((item, index) => (
              <Link
                href={`#${item.slug}`}
                key={index}
                className={`pl-${(item.lvl - minLevel) * 2 + 2} block py-1 transition duration-100 ease-in-out text-gray-600 font-normal text-sm font-sans antialiased hover:text-gray-900 border-l-2 border-transparent`}
              >
                {item.content}
              </Link>
            ))
          }
        </Scrollspy>
      </div>
    </div>
  )
}
