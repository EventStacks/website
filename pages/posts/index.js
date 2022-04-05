import { useContext, useState } from 'react'
import Link from 'next/link'
import Container from '../../components/layout/Container'
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import BlogPostItem from '../../components/BlogPostItem'
import Filter from "../../components/PostFilter";
import BlogContext from '../../context/BlogContext'
import NavBar from '../../components/NavBar'

export default function PostPage() {
  const { navItems } = useContext(BlogContext);

  const [posts, setPosts] = useState(
    navItems.sort((i1, i2) => {
      const i1Date = new Date(i1.date);
      const i2Date = new Date(i2.date);

      if (i1.featured && !i2.featured) return -1;
      if (!i1.featured && i2.featured) return 1;
      return i2Date - i1Date;
    })
  );

  const onFilter = (data) => setPosts(data);
  const toFilter = [
    {
      name: "type",
    },
    {
      name: "tags",
    },
  ];

  return (
    <div>
       <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:pt-6 lg:pb-28 lg:px-8">
       <Container wide>
          <NavBar />
        </Container>
        <Container wide>
          <Head title="EventStack Posts" description="EventStack Posts real life use-cases for tooling and specification which revolves around AsyncAPI, JSON Schema, OpenAPI and GamingAPI."/>
        </Container>
        <div className="relative max-w-9xl mx-auto">
          <div className="text-center">
            <div className="mt-12 mx:64 md:flex md:justify-center">
              <Filter
                data={navItems}
                onFilter={onFilter}
                className="w-full mx-px md:mt-0 md:w-1/6 md: md:text-sm"
                checks={toFilter}
              />
              <span className="text-sm leading-10">
                <Link href="/posts" passHref><a> Clear filters</a></Link>
              </span>
            </div>
          </div>
          <div className="mt-12 grid gap-5 mx-auto xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:max-w-none">
            {
              posts.map((post, index) => (
                <BlogPostItem key={index} post={post} />
              ))
            }
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="max-w-2xl mx-auto text-md leading-7 text-gray-400">
          <img className="ml-1 text-primary-500 hover:text-primary-400" style={{ display: 'inline' }} src={`${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ''}/img/logos/rss.svg`} height="18px" width="18px" /> <Link className="ml-1 text-primary-500 hover:text-primary-400" href="/rss.xml">RSS Feed</Link>
        </p>
      </div>
      <Footer />
    </div>
  )
}
