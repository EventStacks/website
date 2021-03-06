export default function AuthorAvatars({ authors = [] }) {
  return (
    authors.map((author, index) => {
      let avatar = <img
        key={index}
        title={author.name}
        alt={`${author.name} Avatar`}
        className={`${index > 0 ? `absolute left-${index * 7} top-0` : `relative mr-${(authors.length - 1) * 7}`} z-${(authors.length - 1 - index) * 10} h-10 w-10 border-2 border-white rounded-full object-cover hover:z-50`}
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ''}${author.photo}`}
      />

      return author.link ? <a key={author.name} href={author.link}>{avatar}</a> : {avatar}
    })
  )
}