-- Migración para agregar la columna email a profiles
ALTER TABLE public.profiles ADD COLUMN email text;
