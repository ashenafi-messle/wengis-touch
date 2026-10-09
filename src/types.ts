export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  colors: string;
  available: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  color: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderRef?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryPreference: string;
  paymentMethod: string;
  specialNotes?: string;
  createdAt: string;
  telegramDeepLink?: string;
  telegramAppDeepLink?: string;
  telegramToken?: string;
  telegramNotificationStatus?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username?: string;
  token?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  quantity: number;
}
