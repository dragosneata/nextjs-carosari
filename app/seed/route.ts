import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createTables() {
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`

  await sql`
    CREATE TABLE IF NOT EXISTS pages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS page_translations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      locale VARCHAR(5) NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      seo_title TEXT,
      seo_description TEXT,
      UNIQUE(page_id, locale),
      UNIQUE(slug, locale)
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS page_renderings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      type VARCHAR(100) NOT NULL,
      position INTEGER NOT NULL,
      main_image TEXT,
      cta_link TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS page_rendering_translations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rendering_id UUID NOT NULL REFERENCES page_renderings(id) ON DELETE CASCADE,
      locale VARCHAR(5) NOT NULL,
      title TEXT,
      cta_label TEXT,
      UNIQUE(rendering_id, locale)
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS page_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rendering_id UUID NOT NULL REFERENCES page_renderings(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      icon TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS page_content_translations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id UUID NOT NULL REFERENCES page_content(id) ON DELETE CASCADE,
      locale VARCHAR(5) NOT NULL,
      headline TEXT,
      sub_headline TEXT,
      text TEXT,
      UNIQUE(content_id, locale)
    );
  `
}

async function seedPages() {
  // --------------------------
  // HOME PAGE
  // --------------------------

  const [home] = await sql`
    INSERT INTO pages (template)
    VALUES ('default')
    RETURNING id;
  `

  await sql`
    INSERT INTO page_translations (page_id, locale, title, slug, seo_title, seo_description)
    VALUES
    (${home.id}, 'ro', 'Acasa', 'home', 'Carosari Pitesti', 'Service auto profesionist in Pitesti'),
    (${home.id}, 'en', 'Home', 'home', 'Car Body Repair Pitesti', 'Professional auto service in Pitesti');
  `

  const [hero] = await sql`
    INSERT INTO page_renderings (page_id, type, position, main_image, cta_link)
    VALUES (${home.id}, 'hero', 1, '/images/hero.jpg', '/contact')
    RETURNING id;
  `

  await sql`
    INSERT INTO page_rendering_translations (rendering_id, locale, title, cta_label)
    VALUES
    (${hero.id}, 'ro', 'Service Auto Profesional', 'Contacteaza-ne'),
    (${hero.id}, 'en', 'Professional Auto Service', 'Contact Us');
  `

  const [heroContent] = await sql`
    INSERT INTO page_content (rendering_id, position)
    VALUES (${hero.id}, 1)
    RETURNING id;
  `

  await sql`
    INSERT INTO page_content_translations (content_id, locale, headline, text)
    VALUES
    (${heroContent.id}, 'ro', 'Calitate si Profesionalism', 'Oferim servicii complete de tinichigerie si vopsitorie.'),
    (${heroContent.id}, 'en', 'Quality and Professionalism', 'We provide complete body repair services.');
  `

  // --------------------------
  // ABOUT PAGE
  // --------------------------

  const [about] = await sql`
    INSERT INTO pages (template)
    VALUES ('default')
    RETURNING id;
  `

  await sql`
    INSERT INTO page_translations (page_id, locale, title, slug)
    VALUES
    (${about.id}, 'ro', 'Despre Noi', 'despre-noi'),
    (${about.id}, 'en', 'About Us', 'about-us');
  `

  const [intro] = await sql`
    INSERT INTO page_renderings (page_id, type, position)
    VALUES (${about.id}, 'intro', 1)
    RETURNING id;
  `

  await sql`
    INSERT INTO page_rendering_translations (rendering_id, locale, title)
    VALUES
    (${intro.id}, 'ro', 'Cine Suntem'),
    (${intro.id}, 'en', 'Who We Are');
  `

  const [introContent] = await sql`
    INSERT INTO page_content (rendering_id, position)
    VALUES (${intro.id}, 1)
    RETURNING id;
  `

  await sql`
    INSERT INTO page_content_translations (content_id, locale, text)
    VALUES
    (${introContent.id}, 'ro', 'Suntem un service auto cu peste 15 ani experienta.'),
    (${introContent.id}, 'en', 'We are an auto repair shop with over 15 years experience.');
  `
}

export async function GET() {
  try {
    await createTables()
    await seedPages()

    return Response.json({ message: 'Database seeded successfully ✅' })
  } catch (error) {
    console.error(error)
    return Response.json({ error }, { status: 500 })
  }
}
