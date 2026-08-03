import { Product, Order, Message } from '../src/types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_MESSAGES } from '../src/data/initialData';

// In-memory data store for API runtime state
let productsStore: Product[] = [...INITIAL_PRODUCTS];
let ordersStore: Order[] = [...INITIAL_ORDERS];
let messagesStore: Message[] = [...INITIAL_MESSAGES];
let adminPasswordHash = 'wengi123'; // Default admin password

export const store = {
  products: {
    getAll: () => productsStore,
    add: (product: Product) => {
      productsStore.unshift(product);
      return product;
    },
    update: (id: string, updates: Partial<Product>) => {
      const index = productsStore.findIndex(p => p.id === id);
      if (index === -1) return null;
      productsStore[index] = { ...productsStore[index], ...updates, id };
      return productsStore[index];
    },
    delete: (id: string) => {
      productsStore = productsStore.filter(p => p.id !== id);
      return true;
    }
  },
  orders: {
    getAll: () => ordersStore,
    add: (order: Order) => {
      ordersStore.unshift(order);
      return order;
    },
    updateStatus: (id: string, status: string) => {
      const order = ordersStore.find(o => o.id === id);
      if (!order) return null;
      order.status = status as any;
      return order;
    }
  },
  messages: {
    getAll: () => messagesStore,
    add: (message: Message) => {
      messagesStore.unshift(message);
      return message;
    },
    toggleRead: (id: string, read: boolean) => {
      const msg = messagesStore.find(m => m.id === id);
      if (!msg) return null;
      msg.read = read;
      return msg;
    },
    delete: (id: string) => {
      messagesStore = messagesStore.filter(m => m.id !== id);
      return true;
    }
  },
  admin: {
    login: (username: string, password: string) => {
      if ((username === 'admin' || username === 'wengi') && password === adminPasswordHash) {
        return {
          success: true,
          token: `wengi-session-${Date.now()}`,
          username: 'Admin Wengi'
        };
      }
      return { success: false, message: 'Invalid credentials. Password hint: wengi123' };
    },
    resetPassword: (currentPassword: string, newPassword: string) => {
      if (currentPassword !== adminPasswordHash) {
        return { success: false, message: 'Current password incorrect.' };
      }
      adminPasswordHash = newPassword;
      return { success: true, message: 'Password updated successfully.' };
    }
  }
};
