// ============================
// Tipos base de la aplicación
// ============================

export type ThemeAccent = 'purple' | 'blue' | 'green' | 'pink';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  authProvider: 'local' | 'google';
  createdAt: string;
  birthday?: string | null;
  emailVerified?: boolean;
  themeAccent?: ThemeAccent | null;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  reviewsCount: number;
  memberSince: string | null;
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  _count?: { products: number };
  products?: { images: { imageUrl: string }[] }[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
}

export interface ProductColor {
  id: string;
  colorName: string;
  hexCode?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  taxRate?: number;
  stock: number;
  sku: string;
  categoryId?: string;
  isCustomizable: boolean;
  allowsText: boolean;
  allowsImageUpload: boolean;
  allowsColorSelection: boolean;
  isActive: boolean;
  isFeatured: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  images?: ProductImage[];
  videos?: ProductVideo[];
  colors?: ProductColor[];
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customText?: string;
  customImageUrl?: string;
  selectedColorId?: string;
  unitPrice: number;
  product: Product;
  selectedColor?: ProductColor;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Customization {
  id: string;
  customText?: string;
  customImageUrl?: string;
  selectedColorId?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
  customization?: Customization;
}

export interface Payment {
  id: string;
  method: 'credit_card' | 'debit_card' | 'pse' | 'cash_on_delivery';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paidAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  estimatedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
  address?: Address;
  items: OrderItem[];
  payment?: Payment;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'> & { avatarUrl?: string };
  product?: Pick<Product, 'name' | 'slug'>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  reply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconName?: string;
  isActive: boolean;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

// ============================
// Tipos de respuesta API
// ============================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  pagination: Pagination;
  [key: string]: T[] | Pagination;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AdminDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  pendingReviews: number;
  unreadMessages: number;
  totalRevenue: number;
  recentOrders: Order[];
}
