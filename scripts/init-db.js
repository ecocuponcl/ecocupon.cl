#!/usr/bin/env node
/**
 * Database initialization script for EcoCupon
 * Uses direct PostgreSQL connection
 * 
 * Usage: node scripts/init-db.js
 */

const postgres = require('postgres')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Use DATABASE_URL if available, otherwise construct from individual vars
const DATABASE_URL = process.env.DATABASE_URL_NON_POOLING || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: Missing DATABASE_URL in .env.local')
  console.error('   Please set DATABASE_URL or DATABASE_URL_NON_POOLING')
  process.exit(1)
}

async function runMigration() {
  console.log('🔗 Connecting to PostgreSQL...')
  console.log(`   URL: ${DATABASE_URL.replace(/:[^:]*@/, ':***@')}\n`)
  
  let sql
  
  try {
    sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 })
    
    // Test connection
    await sql`SELECT 1`
    console.log('✅ Connected to database\n')
  } catch (err) {
    console.error(`❌ Connection error: ${err.message}`)
    console.log('\n💡 Please run the SQL manually in the Supabase Dashboard:')
    console.log(`   https://supabase.com/dashboard/project/uyxvzztnsvfcqmgkrnol/sql/new\n`)
    process.exit(1)
  }
  
  let errors = 0
  
  try {
    console.log('📝 Creating categories table...')
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image TEXT
      )
    `
    console.log('✅ categories table created')
    
    console.log('📝 Creating products table...')
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image TEXT,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ products table created')
    
    console.log('📝 Creating product_specs table...')
    await sql`
      CREATE TABLE IF NOT EXISTS product_specs (
        id SERIAL PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        value TEXT NOT NULL
      )
    `
    console.log('✅ product_specs table created')
    
    console.log('📝 Creating knasta_prices table...')
    await sql`
      CREATE TABLE IF NOT EXISTS knasta_prices (
        id SERIAL PRIMARY KEY,
        product_id TEXT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
        price INTEGER NOT NULL,
        url TEXT,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ knasta_prices table created')
    
    console.log('📝 Enabling Row Level Security...')
    await sql`ALTER TABLE categories ENABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE products ENABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE knasta_prices ENABLE ROW LEVEL SECURITY`
    console.log('✅ RLS enabled')
    
    console.log('📝 Creating policies...')
    await sql`CREATE POLICY IF NOT EXISTS "Public read access" ON categories FOR SELECT USING (true)`
    await sql`CREATE POLICY IF NOT EXISTS "Public read access" ON products FOR SELECT USING (true)`
    await sql`CREATE POLICY IF NOT EXISTS "Public read access" ON product_specs FOR SELECT USING (true)`
    await sql`CREATE POLICY IF NOT EXISTS "Public read access" ON knasta_prices FOR SELECT USING (true)`
    console.log('✅ Policies created')
    
    console.log('📝 Inserting categories...')
    const categories = [
      { id: 'technology', name: 'Tecnologia', slug: 'technology', description: 'Productos tecnologicos y electronicos', image: '/placeholder.svg?height=400&width=600' },
      { id: 'fashion', name: 'Moda', slug: 'fashion', description: 'Ropa, calzado y accesorios', image: '/placeholder.svg?height=400&width=600' },
      { id: 'home', name: 'Hogar', slug: 'home', description: 'Productos para el hogar y decoracion', image: '/placeholder.svg?height=400&width=600' },
      { id: 'books', name: 'Libros', slug: 'books', description: 'Libros y material de lectura', image: '/placeholder.svg?height=400&width=600' },
      { id: 'office', name: 'Oficina', slug: 'office', description: 'Articulos de oficina y papeleria', image: '/placeholder.svg?height=400&width=600' }
    ]
    
    for (const cat of categories) {
      await sql`
        INSERT INTO categories (id, name, slug, description, image)
        VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description}, ${cat.image})
        ON CONFLICT (id) DO NOTHING
      `
    }
    console.log('✅ Categories inserted')
    
    console.log('📝 Inserting products...')
    const products = [
      { id: 'skechers-edgeride', name: 'Zapatilla Urbana Skechers Edgeride Mujer', description: 'Zapatillas urbanas comodas y ligeras para uso diario.', price: 39990, image: '/placeholder.svg?height=400&width=400', category_id: 'fashion' },
      { id: 'blackie-books', name: 'Blackie Books - Blackwater', description: 'Libro Blackie Books - Blackwater', price: 12836, image: '/placeholder.svg?height=400&width=400', category_id: 'books' },
      { id: 'bic-cristal', name: 'Lapiz Pasta Negro Bic Cristal', description: 'Lapiz Pasta Negro Bic Cristal 50 Unidades', price: 22990, image: '/placeholder.svg?height=400&width=400', category_id: 'office' },
      { id: 'maui-poleron', name: 'Poleron Surf Maui And Sons', description: 'Poleron Surf And Skate Company Crew Azul', price: 19590, image: '/placeholder.svg?height=400&width=400', category_id: 'fashion' },
      { id: 'hp-laserjet', name: 'Impresora HP LaserJet Pro', description: 'Impresora HP LaserJet Pro M404dw', price: 198400, image: '/placeholder.svg?height=400&width=400', category_id: 'technology' },
      { id: 'latam-base-cama', name: 'Base cama europea Latam Home', description: 'Base cama europea 1.5 plazas Zen rosa', price: 116990, image: '/placeholder.svg?height=400&width=400', category_id: 'home' },
      { id: 'samsung-s23', name: 'Samsung Galaxy S23', description: 'Smartphone Samsung Galaxy S23 8GB RAM 256GB', price: 899990, image: '/placeholder.svg?height=400&width=400', category_id: 'technology' },
      { id: 'iphone-14', name: 'iPhone 14 Pro', description: 'Apple iPhone 14 Pro A16 Bionic 48MP', price: 1299990, image: '/placeholder.svg?height=400&width=400', category_id: 'technology' },
      { id: 'macbook-air', name: 'MacBook Air M2', description: 'Laptop Apple MacBook Air M2 8GB 256GB SSD', price: 1099990, image: '/placeholder.svg?height=400&width=400', category_id: 'technology' },
      { id: 'sony-wh1000xm5', name: 'Sony WH-1000XM5', description: 'Audifonos inalambricos con cancelacion de ruido', price: 349990, image: '/placeholder.svg?height=400&width=400', category_id: 'technology' },
      { id: 'nike-air-max', name: 'Nike Air Max 90', description: 'Zapatillas Nike Air Max 90 para hombre', price: 129990, image: '/placeholder.svg?height=400&width=400', category_id: 'fashion' },
      { id: 'dyson-v11', name: 'Dyson V11 Absolute', description: 'Aspiradora inalambrica Dyson V11', price: 699990, image: '/placeholder.svg?height=400&width=400', category_id: 'home' }
    ]
    
    for (const prod of products) {
      await sql`
        INSERT INTO products (id, name, description, price, image, category_id)
        VALUES (${prod.id}, ${prod.name}, ${prod.description}, ${prod.price}, ${prod.image}, ${prod.category_id})
        ON CONFLICT (id) DO NOTHING
      `
    }
    console.log('✅ Products inserted')
    
    console.log('📝 Inserting knasta prices...')
    const knastaPrices = [
      { product_id: 'skechers-edgeride', price: 34990, url: 'https://knasta.cl/producto/zapatilla-urbana-skechers-edgeride-mujer' },
      { product_id: 'blackie-books', price: 10528, url: 'https://knasta.cl/producto/blackie-books-blackwater' },
      { product_id: 'bic-cristal', price: 13990, url: 'https://knasta.cl/producto/lapiz-pasta-negro-bic-cristal' },
      { product_id: 'maui-poleron', price: 15990, url: 'https://knasta.cl/producto/poleron-surf-maui-and-sons' },
      { product_id: 'hp-laserjet', price: 138500, url: 'https://knasta.cl/producto/impresora-hp-laserjet-pro' },
      { product_id: 'latam-base-cama', price: 74990, url: 'https://knasta.cl/producto/base-cama-europea-latam-home' },
      { product_id: 'samsung-s23', price: 799990, url: 'https://knasta.cl/producto/samsung-galaxy-s23' },
      { product_id: 'iphone-14', price: 1199990, url: 'https://knasta.cl/producto/iphone-14-pro' },
      { product_id: 'macbook-air', price: 999990, url: 'https://knasta.cl/producto/macbook-air-m2' },
      { product_id: 'sony-wh1000xm5', price: 299990, url: 'https://knasta.cl/producto/sony-wh-1000xm5' },
      { product_id: 'nike-air-max', price: 99990, url: 'https://knasta.cl/producto/nike-air-max-90' },
      { product_id: 'dyson-v11', price: 599990, url: 'https://knasta.cl/producto/dyson-v11-absolute' }
    ]
    
    for (const kp of knastaPrices) {
      await sql`
        INSERT INTO knasta_prices (product_id, price, url)
        VALUES (${kp.product_id}, ${kp.price}, ${kp.url})
        ON CONFLICT (product_id) DO UPDATE SET
          price = EXCLUDED.price,
          url = EXCLUDED.url,
          last_updated = NOW()
      `
    }
    console.log('✅ Knasta prices inserted')
    
  } catch (err) {
    console.error(`❌ Error: ${err.message}`)
    errors++
  } finally {
    // Close connection
    if (sql) {
      await sql.end()
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  if (errors === 0) {
    console.log('✅ Database initialization completed successfully!')
  } else {
    console.log(`⚠️  Database initialization completed with ${errors} errors.`)
  }
  console.log('\n💡 You can now run: npm run dev')
}

runMigration().catch(console.error)
