import { query } from './neon';
import { Product, Order, Message, OrderItem } from '../src/types';
import { deleteFromCloudinary, MAX_IMAGES_PER_PRODUCT } from './cloudinary';

function formatProduct(p: any): Product {
  let colorsStr = '';
  if (typeof p.colors === 'string') {
    colorsStr = p.colors;
  } else if (Array.isArray(p.colors)) {
    colorsStr = p.colors.map((c: any) => (typeof c === 'object' && c ? c.name || JSON.stringify(c) : String(c))).join(', ');
  } else if (p.color) {
    colorsStr = String(p.color);
  }

  return {
    id: String(p.id),
    title: p.title || '',
    category: p.category || '',
    description: p.description || '',
    price: Number(p.price || 0),
    images: Array.isArray(p.images) ? p.images : [],
    colors: colorsStr,
    available: Boolean(p.available),
    createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString()
  };
}

// Database operations for Products
export const dbProducts = {
  getAll: async (): Promise<Product[]> => {
    const res = await query(
      `SELECT id, title, category, description, price, images, color, colors, available, created_at, updated_at
       FROM products
       ORDER BY created_at DESC`
    );
    return res.rows.map(formatProduct);
  },

  getById: async (id: string): Promise<Product | null> => {
    const res = await query(
      `SELECT id, title, category, description, price, images, color, colors, available, created_at, updated_at
       FROM products
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return formatProduct(res.rows[0]);
  },

  add: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    if (product.images && product.images.length > MAX_IMAGES_PER_PRODUCT) {
      throw new Error(`Maximum ${MAX_IMAGES_PER_PRODUCT} images are allowed for one product.`);
    }

    const res = await query(
      `INSERT INTO products (title, category, description, price, images, colors, color, available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, category, description, price, images, color, colors, available, created_at, updated_at`,
      [
        product.title,
        product.category,
        product.description,
        product.price,
        product.images || [],
        product.colors || '',
        product.colors || '',
        product.available !== undefined ? product.available : true
      ]
    );
    return formatProduct(res.rows[0]);
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    if (updates.images && updates.images.length > MAX_IMAGES_PER_PRODUCT) {
      throw new Error(`Maximum ${MAX_IMAGES_PER_PRODUCT} images are allowed for one product.`);
    }

    // Capture previous images to clean up removed Cloudinary assets
    let previousImages: string[] = [];
    if (updates.images !== undefined) {
      const prev = await dbProducts.getById(id);
      if (prev && Array.isArray(prev.images)) {
        previousImages = prev.images;
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramIndex++}`);
      values.push(updates.price);
    }
    if (updates.images !== undefined) {
      fields.push(`images = $${paramIndex++}`);
      values.push(updates.images);
    }
    if (updates.colors !== undefined) {
      fields.push(`colors = $${paramIndex++}`);
      values.push(updates.colors);
      fields.push(`color = $${paramIndex++}`);
      values.push(updates.colors);
    }
    if (updates.available !== undefined) {
      fields.push(`available = $${paramIndex++}`);
      values.push(updates.available);
    }

    if (fields.length === 0) {
      return dbProducts.getById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE products
                 SET ${fields.join(', ')}
                 WHERE id = $${paramIndex}
                 RETURNING id, title, category, description, price, images, color, colors, available, created_at, updated_at`;

    const res = await query(sql, values);
    if (res.rows.length === 0) return null;

    // After DB update succeeds, clean up any removed Cloudinary images
    if (updates.images !== undefined && previousImages.length > 0) {
      const newSet = new Set(updates.images);
      const removed = previousImages.filter(img => !newSet.has(img));
      for (const removedImg of removed) {
        deleteFromCloudinary(removedImg).catch(err =>
          console.error('Cloudinary cleanup error for removed asset:', err)
        );
      }
    }

    return formatProduct(res.rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const prev = await dbProducts.getById(id);
    const res = await query(`DELETE FROM products WHERE id = $1`, [id]);
    const success = (res.rowCount ?? 0) > 0;

    // After DB delete succeeds, clean up all associated Cloudinary assets
    if (success && prev && prev.images && prev.images.length > 0) {
      for (const img of prev.images) {
        deleteFromCloudinary(img).catch(err =>
          console.error('Cloudinary cleanup error on product deletion:', err)
        );
      }
    }

    return success;
  }
};

// Database operations for Orders
export const dbOrders = {
  getAll: async (): Promise<Order[]> => {
    const ordersRes = await query(
      `SELECT id, order_ref, customer_name, customer_email, customer_phone, shipping_address,
              total_amount, status, delivery_preference, payment_method, special_notes, created_at
       FROM orders
       ORDER BY created_at DESC`
    );

    const orders = ordersRes.rows;
    if (orders.length === 0) return [];

    const orderIds = orders.map((o) => o.id);
    const itemsRes = await query(
      `SELECT id, order_id, product_id, product_title, product_image, color, quantity, price
       FROM order_items
       WHERE order_id = ANY($1::uuid[])`,
      [orderIds]
    );

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const item of itemsRes.rows) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push({
        productId: item.product_id,
        productTitle: item.product_title,
        productImage: item.product_image,
        color: item.color || '',
        quantity: Number(item.quantity),
        price: Number(item.price)
      });
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map((order) => ({
      id: String(order.id),
      orderRef: order.order_ref,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      items: itemsByOrder.get(order.id) || [],
      totalAmount: Number(order.total_amount),
      status: order.status,
      deliveryPreference: order.delivery_preference,
      paymentMethod: order.payment_method,
      specialNotes: order.special_notes,
      createdAt: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString()
    }));
  },

  add: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const orderRef = order.orderRef || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderRes = await query(
      `INSERT INTO orders (order_ref, customer_name, customer_email, customer_phone, shipping_address,
                           total_amount, status, delivery_preference, payment_method, special_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, order_ref, customer_name, customer_email, customer_phone, shipping_address,
                 total_amount, status, delivery_preference, payment_method, special_notes, created_at`,
      [
        orderRef,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.shippingAddress,
        order.totalAmount,
        order.status || 'Pending',
        order.deliveryPreference || '',
        order.paymentMethod || '',
        order.specialNotes || ''
      ]
    );

    const createdOrder = orderRes.rows[0];

    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await query(
          `INSERT INTO order_items (order_id, product_id, product_title, product_image, color, quantity, price)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            createdOrder.id,
            item.productId || null,
            item.productTitle,
            item.productImage,
            item.color || '',
            item.quantity,
            item.price
          ]
        );
      }
    }

    return {
      id: String(createdOrder.id),
      orderRef: createdOrder.order_ref,
      customerName: createdOrder.customer_name,
      customerEmail: createdOrder.customer_email,
      customerPhone: createdOrder.customer_phone,
      shippingAddress: createdOrder.shipping_address,
      items: order.items || [],
      totalAmount: Number(createdOrder.total_amount),
      status: createdOrder.status,
      deliveryPreference: createdOrder.delivery_preference,
      paymentMethod: createdOrder.payment_method,
      specialNotes: createdOrder.special_notes,
      createdAt: createdOrder.created_at ? new Date(createdOrder.created_at).toISOString() : new Date().toISOString()
    };
  },

  updateStatus: async (id: string, status: string): Promise<Order | null> => {
    const res = await query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, order_ref, customer_name, customer_email, customer_phone, shipping_address,
                 total_amount, status, delivery_preference, payment_method, special_notes, created_at`,
      [status, id]
    );

    if (res.rows.length === 0) return null;
    const order = res.rows[0];

    const itemsRes = await query(
      `SELECT product_id, product_title, product_image, color, quantity, price
       FROM order_items
       WHERE order_id = $1`,
      [id]
    );

    const items: OrderItem[] = itemsRes.rows.map((item) => ({
      productId: item.product_id,
      productTitle: item.product_title,
      productImage: item.product_image,
      color: item.color || '',
      quantity: Number(item.quantity),
      price: Number(item.price)
    }));

    return {
      id: String(order.id),
      orderRef: order.order_ref,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      items,
      totalAmount: Number(order.total_amount),
      status: order.status,
      deliveryPreference: order.delivery_preference,
      paymentMethod: order.payment_method,
      specialNotes: order.special_notes,
      createdAt: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString()
    };
  }
};

// Database operations for Messages
export const dbMessages = {
  getAll: async (): Promise<Message[]> => {
    const res = await query(
      `SELECT id, name, email, phone, subject, message, read, created_at
       FROM messages
       ORDER BY created_at DESC`
    );

    return res.rows.map((m) => ({
      id: String(m.id),
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      subject: m.subject,
      message: m.message,
      read: Boolean(m.read),
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString()
    }));
  },

  add: async (message: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> => {
    const res = await query(
      `INSERT INTO messages (name, email, phone, subject, message, read)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, name, email, phone, subject, message, read, created_at`,
      [message.name, message.email, message.phone || null, message.subject, message.message]
    );

    const m = res.rows[0];
    return {
      id: String(m.id),
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      subject: m.subject,
      message: m.message,
      read: Boolean(m.read),
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString()
    };
  },

  toggleRead: async (id: string, read: boolean): Promise<Message | null> => {
    const res = await query(
      `UPDATE messages
       SET read = $1
       WHERE id = $2
       RETURNING id, name, email, phone, subject, message, read, created_at`,
      [read, id]
    );

    if (res.rows.length === 0) return null;
    const m = res.rows[0];
    return {
      id: String(m.id),
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      subject: m.subject,
      message: m.message,
      read: Boolean(m.read),
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString()
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await query(`DELETE FROM messages WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }
};

// Database operations for Admin Authentication
export const dbAdmin = {
  verifyPassword: async (password: string): Promise<boolean> => {
    try {
      const res = await query(
        `SELECT id, admin_password_hash FROM admin_settings ORDER BY updated_at DESC LIMIT 1`
      );

      if (res.rows.length === 0) {
        // Fallback default admin password if table not yet seeded
        return password === 'wengi123' || password === 'wengel6567';
      }

      return res.rows[0].admin_password_hash === password;
    } catch (error) {
      console.error('Error verifying admin password:', error);
      return false;
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const isValid = await dbAdmin.verifyPassword(currentPassword);
      if (!isValid) return false;

      const currentSettings = await query(`SELECT id FROM admin_settings ORDER BY updated_at DESC LIMIT 1`);
      if (currentSettings.rows.length > 0) {
        await query(
          `UPDATE admin_settings
           SET admin_password_hash = $1, updated_at = NOW()
           WHERE id = $2`,
          [newPassword, currentSettings.rows[0].id]
        );
      } else {
        await query(
          `INSERT INTO admin_settings (admin_password_hash) VALUES ($1)`,
          [newPassword]
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating admin password:', error);
      return false;
    }
  },

  initializeAdminPassword: async (defaultPassword: string): Promise<void> => {
    try {
      const res = await query(`SELECT id FROM admin_settings LIMIT 1`);
      if (res.rows.length === 0) {
        await query(`INSERT INTO admin_settings (admin_password_hash) VALUES ($1)`, [defaultPassword]);
      } else {
        await query(`UPDATE admin_settings SET admin_password_hash = $1, updated_at = NOW() WHERE id = $2`, [
          defaultPassword,
          res.rows[0].id
        ]);
      }
    } catch (error) {
      console.error('Error initializing admin password:', error);
      throw error;
    }
  }
};