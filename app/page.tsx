// import { fetchPageBySlug } from '@/app/lib/data'
// import { notFound } from 'next/navigation'

// export default async function Page({
//   params,
// }: {
//   params: { slug: string }
// }) {
//   const page = await fetchPageBySlug(params.slug, 'ro')

//   if (!page) return notFound()

//   return (
//     <>
//       {page.renderings.map((rendering) => (
//         <section key={rendering.id}>
//           {rendering.title && <h2>{rendering.title}</h2>}

//           {rendering.contents.map((content) => (
//             <div key={content.id}>
//               {content.headline && <h3>{content.headline}</h3>}
//               {content.text && <p>{content.text}</p>}
//             </div>
//           ))}
//         </section>
//       ))}
//     </>
//   )
// }

export default function Page(){
    return <p>Dashboard Page</p>;
}