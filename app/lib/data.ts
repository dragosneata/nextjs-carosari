import postgres from 'postgres'

import {
  Locale,
  PageQueryResult,
  PageWithRenderings,
  Rendering,
  RenderingContent,
} from './definitions'

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
})

/* ===============================
   FETCH PAGE BY SLUG
================================ */

export async function fetchPageBySlug(
  slug: string,
  locale: Locale,
): Promise<PageWithRenderings | null> {
  try {
    const rows = await sql<PageQueryResult[]>`
      SELECT 
        p.id as page_id,
        p.template,

        pr.id as rendering_id,
        pr.type,
        pr.position,
        pr.main_image,
        pr.cta_link,

        prt.title,
        prt.cta_label,

        pc.id as content_id,
        pc.position as content_position,
        pc.icon,
        pc.image,

        pct.headline,
        pct.sub_headline,
        pct.text

      FROM pages p
      JOIN page_translations pt ON p.id = pt.page_id
      JOIN page_renderings pr ON p.id = pr.page_id
      LEFT JOIN page_rendering_translations prt 
        ON pr.id = prt.rendering_id AND prt.locale = ${locale}
      LEFT JOIN page_content pc ON pr.id = pc.rendering_id
      LEFT JOIN page_content_translations pct 
        ON pc.id = pct.content_id AND pct.locale = ${locale}

      WHERE pt.slug = ${slug}
      AND pt.locale = ${locale}
      AND p.is_active = true
      AND pr.is_active = true

      ORDER BY pr.position, pc.position;
    `

    if (!rows.length) return null

    const pageId = rows[0].page_id
    const template = rows[0].template

    const renderingsMap = new Map<string, Rendering>()

    rows.forEach((row) => {
      if (!renderingsMap.has(row.rendering_id)) {
        renderingsMap.set(row.rendering_id, {
          id: row.rendering_id,
          type: row.type,
          position: row.position,
          main_image: row.main_image,
          cta_link: row.cta_link,
          title: row.title,
          cta_label: row.cta_label,
          contents: [],
        })
      }

      if (row.content_id) {
        const rendering = renderingsMap.get(row.rendering_id)!

        const content: RenderingContent = {
          id: row.content_id,
          position: row.content_position ?? 0,
          icon: row.icon,
          image: row.image,
          headline: row.headline,
          sub_headline: row.sub_headline,
          text: row.text,
        }

        rendering.contents.push(content)
      }
    })

    return {
      id: pageId,
      template,
      slug,
      renderings: Array.from(renderingsMap.values()).sort(
        (a, b) => a.position - b.position,
      ),
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch page.')
  }
}

/* ===============================
   FETCH ALL SLUGS
================================ */

export async function fetchAllSlugs(locale: Locale) {
  const data = await sql<{ slug: string }[]>`
    SELECT slug
    FROM page_translations
    WHERE locale = ${locale};
  `

  return data.map((row) => row.slug)
}
