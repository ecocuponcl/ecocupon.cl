DROP TABLE IF EXISTS product_specs CASCADE;
DROP TABLE IF EXISTS knasta_prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_specs (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE knasta_prices (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knasta_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_specs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON knasta_prices FOR SELECT USING (true);

INSERT INTO categories (id, name, slug, description, image) VALUES
  ('technology', 'Tecnologia', 'technology', 'Productos tecnologicos y electronicos', '/placeholder.svg?height=400&width=600'),
  ('fashion', 'Moda', 'fashion', 'Ropa, calzado y accesorios', '/placeholder.svg?height=400&width=600'),
  ('home', 'Hogar', 'home', 'Productos para el hogar y decoracion', '/placeholder.svg?height=400&width=600'),
  ('books', 'Libros', 'books', 'Libros y material de lectura', '/placeholder.svg?height=400&width=600'),
  ('office', 'Oficina', 'office', 'Articulos de oficina y papeleria', '/placeholder.svg?height=400&width=600');

INSERT INTO products (id, name, description, price, image, category_id) VALUES
  ('skechers-edgeride', 'Zapatilla Urbana Skechers Edgeride Mujer', 'Zapatillas urbanas comodas y ligeras para uso diario.', 39990, '/placeholder.svg?height=400&width=400', 'fashion'),
  ('blackie-books', 'Blackie Books - Blackwater', 'Libro Blackie Books - Blackwater', 12836, '/placeholder.svg?height=400&width=400', 'books'),
  ('bic-cristal', 'Lapiz Pasta Negro Bic Cristal', 'Lapiz Pasta Negro Bic Cristal 50 Unidades', 22990, '/placeholder.svg?height=400&width=400', 'office'),
  ('maui-poleron', 'Poleron Surf Maui And Sons', 'Poleron Surf And Skate Company Crew Azul', 19590, '/placeholder.svg?height=400&width=400', 'fashion'),
  ('hp-laserjet', 'Impresora HP LaserJet Pro', 'Impresora HP LaserJet Pro M404dw', 198400, '/placeholder.svg?height=400&width=400', 'technology'),
  ('latam-base-cama', 'Base cama europea Latam Home', 'Base cama europea 1.5 plazas Zen rosa', 116990, '/placeholder.svg?height=400&width=400', 'home'),
  ('samsung-s23', 'Samsung Galaxy S23', 'Smartphone Samsung Galaxy S23 8GB RAM 256GB', 899990, '/placeholder.svg?height=400&width=400', 'technology'),
  ('iphone-14', 'iPhone 14 Pro', 'Apple iPhone 14 Pro A16 Bionic 48MP', 1299990, '/placeholder.svg?height=400&width=400', 'technology'),
  ('macbook-air', 'MacBook Air M2', 'Laptop Apple MacBook Air M2 8GB 256GB SSD', 1099990, '/placeholder.svg?height=400&width=400', 'technology'),
  ('sony-wh1000xm5', 'Sony WH-1000XM5', 'Audifonos inalambricos con cancelacion de ruido', 349990, '/placeholder.svg?height=400&width=400', 'technology'),
  ('nike-air-max', 'Nike Air Max 90', 'Zapatillas Nike Air Max 90 para hombre', 129990, '/placeholder.svg?height=400&width=400', 'fashion'),
  ('dyson-v11', 'Dyson V11 Absolute', 'Aspiradora inalambrica Dyson V11', 699990, '/placeholder.svg?height=400&width=400', 'home');

INSERT INTO knasta_prices (product_id, price, url) VALUES
  ('skechers-edgeride', 34990, 'https://knasta.cl/producto/zapatilla-urbana-skechers-edgeride-mujer'),
  ('blackie-books', 10528, 'https://knasta.cl/producto/blackie-books-blackwater'),
  ('bic-cristal', 13990, 'https://knasta.cl/producto/lapiz-pasta-negro-bic-cristal'),
  ('maui-poleron', 15990, 'https://knasta.cl/producto/poleron-surf-maui-and-sons'),
  ('hp-laserjet', 138500, 'https://knasta.cl/producto/impresora-hp-laserjet-pro'),
  ('latam-base-cama', 74990, 'https://knasta.cl/producto/base-cama-europea-latam-home'),
  ('samsung-s23', 799990, 'https://knasta.cl/producto/samsung-galaxy-s23'),
  ('iphone-14', 1199990, 'https://knasta.cl/producto/iphone-14-pro'),
  ('macbook-air', 999990, 'https://knasta.cl/producto/macbook-air-m2'),
  ('sony-wh1000xm5', 299990, 'https://knasta.cl/producto/sony-wh-1000xm5'),
  ('nike-air-max', 99990, 'https://knasta.cl/producto/nike-air-max-90'),
  ('dyson-v11', 599990, 'https://knasta.cl/producto/dyson-v11-absolute')
ON CONFLICT (product_id) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  last_updated = NOW();

INSERT INTO product_specs (product_id, name, value) VALUES
  ('skechers-edgeride', 'Tipo', 'Zapatilla Urbana'),
  ('skechers-edgeride', 'Genero', 'Mujer'),
  ('skechers-edgeride', 'Marca', 'Skechers'),
  ('hp-laserjet', 'Marca', 'HP'),
  ('hp-laserjet', 'Modelo', 'LaserJet Pro M404dw'),
  ('hp-laserjet', 'Velocidad', '38ppm'),
  ('hp-laserjet', 'Resolucion', '4800x600dpi'),
  ('latam-base-cama', 'Tamano', '1.5 plazas'),
  ('latam-base-cama', 'Color', 'Rosa'),
  ('latam-base-cama', 'Modelo', 'Zen'),
  ('bic-cristal', 'Marca', 'Bic'),
  ('bic-cristal', 'Color', 'Negro'),
  ('bic-cristal', 'Cantidad', '50 unidades');
