import { supabaseAdmin } from './supabase';
import { Product, Order, Message, OrderItem } from '../src/types';

// Database operations for Products
export const dbProducts = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      price: Number(p.price),
      images: p.images,
      colors: typeof p.colors === 'string' ? p.colors : 
        (Array.isArray(p.colors) ? p.colors.map((c: any) => c.name || c).join(', ') : JSON.stringify(p.colors)),
      available: p.available,
      createdAt: p.created_at
    }));
  },

  add: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        title: product.title,
        category: product.category,
        description: product.description,
        price: product.price,
        images: product.images,
        colors: product.colors,
        available: product.available
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      description: data.description,
      price: Number(data.price),
      images: data.images,
      colors: typeof data.colors === 'string' ? data.colors : 
        (Array.isArray(data.colors) ? data.colors.map((c: any) => c.name || c).join(', ') : JSON.stringify(data.colors)),
      available: data.available,
      createdAt: data.created_at
    };
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.category) updateData.category = updates.category;
    if (updates.description) updateData.description = updates.description;
    if (updates.price) updateData.price = updates.price;
    if (updates.images) updateData.images = updates.images;
    if (updates.colors) updateData.colors = updates.colors;
    if (updates.available !== undefined) updateData.available = updates.available;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      description: data.description,
      price: Number(data.price),
      images: data.images,
      colors: typeof data.colors === 'string' ? data.colors : 
        (Array.isArray(data.colors) ? data.colors.map((c: any) => c.name || c).join(', ') : JSON.stringify(data.colors)),
      available: data.available,
      createdAt: data.created_at
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Database operations for Orders
export const dbOrders = {
  getAll: async (): Promise<Order[]> => {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const { data: items } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        return {
          id: order.id,
          orderRef: order.order_ref,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          shippingAddress: order.shipping_address,
          items: items?.map((item: any) => ({
            productId: item.product_id,
            productTitle: item.product_title,
            productImage: item.product_image,
            color: item.color_name,
            quantity: item.quantity,
            price: Number(item.price)
          })) || [],
          totalAmount: Number(order.total_amount),
          status: order.status,
          deliveryPreference: order.delivery_preference,
          paymentMethod: order.payment_method,
          specialNotes: order.special_notes,
          createdAt: order.created_at
        };
      })
    );
    
    return ordersWithItems;
  },

  add: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const orderRef = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_ref: orderRef,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address: order.shippingAddress,
        total_amount: order.totalAmount,
        status: order.status || 'Pending',
        delivery_preference: order.deliveryPreference,
        payment_method: order.paymentMethod,
        special_notes: order.specialNotes
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = order.items.map(item => ({
      order_id: orderData.id,
      product_id: item.productId,
      product_title: item.productTitle,
      product_image: item.productImage,
      color_name: item.color,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return {
      id: orderData.id,
      orderRef: orderData.order_ref,
      customerName: orderData.customer_name,
      customerEmail: orderData.customer_email,
      customerPhone: orderData.customer_phone,
      shippingAddress: orderData.shipping_address,
      items: order.items,
      totalAmount: Number(orderData.total_amount),
      status: orderData.status,
      deliveryPreference: orderData.delivery_preference,
      paymentMethod: orderData.payment_method,
      specialNotes: orderData.special_notes,
      createdAt: orderData.created_at
    };
  },

  updateStatus: async (id: string, status: string): Promise<Order | null> => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Get order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', data.id);
    
    return {
      id: data.id,
      orderRef: data.order_ref,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      shippingAddress: data.shipping_address,
      items: items?.map((item: any) => ({
        productId: item.product_id,
        productTitle: item.product_title,
        productImage: item.product_image,
        color: item.color_name,
        quantity: item.quantity,
        price: Number(item.price)
      })) || [],
      totalAmount: Number(data.total_amount),
      status: data.status,
      deliveryPreference: data.delivery_preference,
      paymentMethod: data.payment_method,
      specialNotes: data.special_notes,
      createdAt: data.created_at
    };
  }
};

// Database operations for Messages
export const dbMessages = {
  getAll: async (): Promise<Message[]> => {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      read: m.read,
      createdAt: m.created_at
    }));
  },

  add: async (message: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> => {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        read: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      read: data.read,
      createdAt: data.created_at
    };
  },

  toggleRead: async (id: string, read: boolean): Promise<Message | null> => {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ read })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      read: data.read,
      createdAt: data.created_at
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Database operations for Admin Authentication
export const dbAdmin = {
  verifyPassword: async (password: string): Promise<boolean> => {
    try {
      // Get the stored password hash from admin_settings table
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('admin_password_hash')
        .single();
      
      if (error || !data) {
        console.error('Error fetching admin settings:', error);
        return false;
      }
      
      // Simple comparison (in production, use bcrypt for proper hashing)
      // For now, we'll store plain text or simple hash
      return data.admin_password_hash === password;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // First verify current password
      const isValid = await dbAdmin.verifyPassword(currentPassword);
      if (!isValid) {
        return false;
      }
      
      // Update password
      const { error } = await supabaseAdmin
        .from('admin_settings')
        .update({ admin_password_hash: newPassword, updated_at: new Date().toISOString() })
        .eq('id', (await supabaseAdmin.from('admin_settings').select('id').single()).data?.id);
      
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  },

  initializeAdminPassword: async (defaultPassword: string): Promise<void> => {
    try {
      // Check if admin settings exist
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('id')
        .maybeSingle();
      
      if (error) throw error;
      
      // If no settings exist, create with default password
      if (!data) {
        const { error: insertError } = await supabaseAdmin
          .from('admin_settings')
          .insert({ admin_password_hash: defaultPassword });
        
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error initializing admin password:', error);
    }
  }
};