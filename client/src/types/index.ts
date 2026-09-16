export interface User {
  id: number;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended';
  avatar_url?: string;
  discord_id?: string;
  discord_tag?: string;
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price: number | string;
  category: 'Scripts' | 'UI' | 'Framework' | 'Vehicles' | 'Maps' | 'Misc';
  frameworks: string[];
  version: string;
  status: 'active' | 'draft' | 'archived';
  featured: boolean | number;
  thumbnail: string;
  gallery?: string[];
  video_url?: string;
  dependencies?: string[];
  features?: string[];
  download_filename: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductDoc {
  id: number;
  product_id: number;
  section_slug: string;
  section_title: string;
  order_index: number;
  content_markdown: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  price: number | string;
  product_title: string;
  slug?: string;
  thumbnail?: string;
  license_key?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  username?: string;
  total_amount: number | string;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  payment_method: 'stripe' | 'paypal' | 'test_sandbox';
  transaction_id: string;
  customer_email: string;
  created_at: string;
  items?: OrderItem[];
}

export interface License {
  id: number;
  license_key: string;
  user_id: number;
  product_id: number;
  order_id: number;
  status: 'active' | 'expired' | 'revoked';
  bound_server_ip?: string | null;
  max_ips: number;
  created_at: string;
  expires_at?: string | null;
  product_title?: string;
  product_slug?: string;
  product_version?: string;
  thumbnail?: string;
  username?: string;
  email?: string;
  order_number?: string;
}

export interface DownloadLog {
  id: number;
  user_id: number;
  product_id: number;
  license_id?: number;
  version: string;
  ip_address: string;
  user_agent?: string;
  downloaded_at: string;
  product_title?: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  user_id: number;
  product_id?: number | null;
  subject: string;
  category: 'purchase' | 'installation' | 'bug' | 'license' | 'general';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  product_title?: string;
  message_count?: number;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  message: string;
  attachments?: string[];
  is_staff: boolean;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  username?: string;
  avatar_url?: string;
  discord_tag?: string;
  product_title?: string;
  product_slug?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  badge: string;
  link_url?: string;
  is_active: boolean;
  published_at: string;
}

export interface Changelog {
  id: number;
  product_id: number;
  version: string;
  title: string;
  content: {
    added?: string[];
    fixed?: string[];
    improved?: string[];
  };
  release_date: string;
  product_title?: string;
  product_slug?: string;
  thumbnail?: string;
}

export interface SiteSettings {
  site_stats?: {
    resources: string;
    customers: string;
    positiveFeedback: string;
    support: string;
  };
  discord_widget?: {
    serverName: string;
    inviteUrl: string;
    onlineCount: number;
    totalMembers: number;
    status: string;
  };
  theme_settings?: {
    primaryColor: string;
    accentMode: string;
    allowUserAccentSelection: boolean;
  };
}
