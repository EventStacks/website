import { useRouter } from 'next/router'
import Link from 'next/link'
import moment from 'moment'
import Head from '../Head'
import BlogContext from '../../context/BlogContext'
import NavBar from '../NavBar'
import TOC from '../TOC'
import Container from './Container'
import Footer from '../Footer'
import AuthorAvatars from '../AuthorAvatars'
import Custom404 from '../../pages/404'
import React from 'react'

function translations(post) {
  if (post && Object.prototype.hasOwnProperty.call(post, 'translations')) {
    const knownTranslations = Object.keys(post.translations);
    const translationLinks = knownTranslations.reduce((acc,t) =>
      acc === null
        ? <a key={t} className="uppercase rounded-md px-2 py-1 underline" href={post.translations[t]}>{t}</a>
        : <>{acc}|{<a key={t} className="uppercase rounded-md px-2 py-1 underline" href={post.translations[t]}>{t}</a>}</>, null
    );
    return <>{post && Object.prototype.hasOwnProperty.call(post, 'translation') ? post.translation : "Translations"} : {translationLinks} </>;
  } else {
    return "";
  }
}

export default function BlogLayout({ post, children }) {
  const router = useRouter()

  if (!post) return <Custom404 />
  if (post.title === undefined) throw new Error('Post title is required')

  // During static generation, router might not be fully initialized
  if (router && !router.isFallback && !(post && post.slug)) {
    return <Custom404 />
  }

  const translationsElements = translations(post);
  const postImage = `${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ''}${post.cover}`;
  return (
    <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:pt-6 lg:pb-28 lg:px-8">
    <BlogContext.Provider value={{ post }}>
        <Container wide>
          <NavBar />
        </Container>
        <Container cssBreakingPoint="lg" flex className="pt-8">
          <main className="mt-8 px-4 sm:px-6 lg:pr-8 lg:pl-0 lg:flex-1 lg:max-w-172 xl:max-w-172">
            <header className="pr-4 sm:pr-6 md:pr-8">
              <h1 className="text-4xl font-normal text-gray-800 font-sans antialiased">{post.title}</h1>
              <div className="mt-6 flex items-center">
                <div className="relative flex-shrink-0">
                  <AuthorAvatars authors={post.authors} />
                </div>
                <div className="ml-3">
                  <p className="text-sm leading-5 font-medium text-gray-900">
                    <span className="hover:underline">
                      {post.authors.map((author, index) => author.link ? <Link key={index} title={author.name} href={author.link}>{author.name}</Link> : author.name).reduce((prev, curr) => [ prev, ' & ', curr ])}
                    </span>
                  </p>
                  <div className="flex text-sm leading-5 text-gray-500">
                    <time dateTime={post.date}>
                      {moment(post.date).format('YYYY-MM-DD')}
                    </time>
                    <span className="mx-1">
                      &middot;
                    </span>
                    <span>
                      { post.showReadTime != false ? post.readingTime + ' min read' : '' }
                    </span>
                  </div>
                </div>

                <div className="ml-3">
                  <a className="text-sm leading-5 font-medium" style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "7px",
                      textAlign: "center",
                      color: "white",
                      outline: "none",
                      width: "200px",
                      height: "32px",
                      borderRadius: "16px",
                      backgroundColor: "#0A66C2",
                    }} href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=jonaslagoni" target="_blank" rel="noreferrer">Follow on LinkedIn</a>
                  </div>
              </div>
            </header>
            <article className="mb-32">
              <Head
                title={post.title}
                description={post.excerpt}
                image={postImage}
              />
              <img src={postImage} alt={post.coverCaption} title={post.coverCaption} className="mt-6 mb-6 w-full" />
              {translationsElements}
              {children}
            </article>
          </main>
          <TOC toc={post.toc} cssBreakingPoint="lg" className="bg-blue-100 mt-4 p-4 sticky top-0 overflow-y-auto max-h-screen lg:bg-transparent lg:mt-0 lg:pt-0 lg:pb-8 lg:top-4 lg:max-h-(screen-16) lg:border-l lg:border-gray-200 lg:min-w-40 lg:max-w-64 lg:-mr-20 xl:min-w-72 xl:-mr-36" />
        </Container>
      <Footer />
    </BlogContext.Provider>
    </div>
  )
}
