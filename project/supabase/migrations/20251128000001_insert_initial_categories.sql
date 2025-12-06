-- Migration: Insert initial categories
-- Safe to re-run: uses ON CONFLICT DO NOTHING

begin;

insert into public.categories (name, description, icon) values
  ('Albañilería', 'Construcción, reformas y reparaciones', '🧱'),
  ('Carpintería', 'Muebles, reparaciones y trabajos en madera', '🪚'),
  ('Cerrajería', 'Aperturas, cambio de cerraduras y llaves', '🔑'),
  ('Electricista', 'Instalaciones eléctricas, reparaciones y mantenimiento', '⚡'),
  ('Fumigación', 'Control de plagas y desinfección', '🦟'),
  ('Gasista', 'Instalación y reparación de gas natural y envasado', '🔥'),
  ('Herrería', 'Portones, rejas, estructuras metálicas', '🔨'),
  ('Jardinería', 'Mantenimiento de jardines y espacios verdes', '🌿'),
  ('Limpieza', 'Servicios de limpieza doméstica y comercial', '🧹'),
  ('Mampostería', 'Construcción de muros y estructuras de ladrillo', '🧱'),
  ('Mecánica Automotriz', 'Reparación y mantenimiento de vehículos', '🚗'),
  ('Pintor', 'Pintura de interiores y exteriores', '🎨'),
  ('Plomería', 'Servicios de instalación y reparación de sistemas de agua', '🔧'),
  ('Soldadura', 'Trabajos de soldadura y unión de metales', '⚙️'),
  ('Técnico Electrónico', 'Reparación de electrodomésticos y dispositivos', '💻'),
  ('Tornería', 'Mecanizado y torneado de piezas', '🔩'),
  ('Vidriería', 'Instalación y reparación de vidrios y espejos', '🪟'),
  ('Zinguería', 'Instalación de canaletas, bajadas y techos', '🏠')
on conflict (name) do nothing;

commit;
