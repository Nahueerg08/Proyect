export type UserRole = 'admin' | 'technician' | 'client';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type TechnicianProfile = {
  id: string;
  category_id: string | null;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  price_range: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  availability: string | null;
  is_approved: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  category?: Category;
};

export type TechnicianImage = {
  id: string;
  technician_id: string;
  image_url: string;
  caption: string | null;
  order_index: number;
  created_at: string;
};

export type Review = {
  id: string;
  technician_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  client?: Profile;
};

export type Favorite = {
  id: string;
  client_id: string;
  technician_id: string;
  created_at: string;
  technician?: TechnicianProfile;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: 'review' | 'system' | 'promotion';
  created_at: string;
};

export type ContactLog = {
  id: string;
  client_id: string | null;
  technician_id: string;
  contact_type: string;
  created_at: string;
};
