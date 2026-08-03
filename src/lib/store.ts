import { Product, Order, Message } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_MESSAGES } from '../data/initialData';

// Global in-memory storage for Next.js API backend routes
declare global {
  var _productsStore: Product[] | undefined;
  var _ordersStore: Order[] | undefined;
  var _messagesStore: Message[] | undefined;
  var _adminPasswordHash: string | undefined;
}

if (!globalThis._productsStore) {
  globalThis._productsStore = [...INITIAL_PRODUCTS];
}
if (!globalThis._ordersStore) {
  globalThis._ordersStore = [...INITIAL_ORDERS];
}
if (!globalThis._messagesStore) {
  globalThis._messagesStore = [...INITIAL_MESSAGES];
}
if (!globalThis._adminPasswordHash) {
  globalThis._adminPasswordHash = 'wengi123';
}

export const getProducts = () => globalThis._productsStore!;
export const setProducts = (products: Product[]) => {
  globalThis._productsStore = products;
};

export const getOrders = () => globalThis._ordersStore!;
export const setOrders = (orders: Order[]) => {
  globalThis._ordersStore = orders;
};

export const getMessages = () => globalThis._messagesStore!;
export const setMessages = (messages: Message[]) => {
  globalThis._messagesStore = messages;
};

export const getAdminPassword = () => globalThis._adminPasswordHash!;
export const setAdminPassword = (pwd: string) => {
  globalThis._adminPasswordHash = pwd;
};
