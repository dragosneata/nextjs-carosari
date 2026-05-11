// =============================
// Locale
// =============================

export type Locale = 'ro' | 'en'

// =============================
// Raw Query Result (flat SQL)
// =============================

export type PageQueryResult = {
  page_id: string
  template: string

  rendering_id: string
  type: string
  position: number
  main_image: string | null
  cta_link: string | null

  title: string | null
  cta_label: string | null

  content_id: string | null
  content_position: number | null
  icon: string | null
  image: string | null

  headline: string | null
  sub_headline: string | null
  text: string | null
}


// =============================
// UI Layer Types
// =============================

export type RenderingContent = {
  id: string
  position: number
  icon: string | null
  image: string | null
  headline: string | null
  sub_headline: string | null
  text: string | null
}

export type Rendering = {
  id: string
  type: string
  position: number
  main_image: string | null
  cta_link: string | null
  title: string | null
  cta_label: string | null
  contents: RenderingContent[]
}

export type PageWithRenderings = {
  id: string
  template: string
  slug: string
  renderings: Rendering[]
}
