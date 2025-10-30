export type CategoryIcon =
  | 'zap'
  | 'droplet'
  | 'hard-hat'
  | 'flame'
  | 'tree-deciduous'
  | 'sparkles'
  | 'baby'
  | 'accessibility'
  | 'paintbrush'
  | 'hammer'
  | 'wrench';

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  'Electricista': 'zap',
  'Plomero': 'droplet',
  'Albañil': 'hard-hat',
  'Gasista': 'flame',
  'Jardinero': 'tree-deciduous',
  'Limpieza': 'sparkles',
  'Cuidador de niños': 'baby',
  'Cuidador de adultos mayores': 'accessibility',
  'Pintor': 'paintbrush',
  'Carpintero': 'hammer',
};
