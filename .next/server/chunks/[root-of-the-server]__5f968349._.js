module.exports = [
"[project]/.next-internal/server/app/api/admin/initialize/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://xiutwblkoardcbavhsem.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdXR3Ymxrb2FyZGNiYXZoc2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODkyOTUsImV4cCI6MjEwMTA2NTI5NX0.GG9A-UK9rbWyveM5K2bMThbhb0Y6fFxepSCmkW67-5g");
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dbAdmin",
    ()=>dbAdmin,
    "dbMessages",
    ()=>dbMessages,
    "dbOrders",
    ()=>dbOrders,
    "dbProducts",
    ()=>dbProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
;
const dbProducts = {
    getAll: async ()=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('products').select('*').order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return data.map((p)=>({
                id: p.id,
                title: p.title,
                category: p.category,
                description: p.description,
                price: Number(p.price),
                originalPrice: p.original_price ? Number(p.original_price) : undefined,
                images: p.images,
                colors: p.colors,
                sizes: p.sizes,
                materials: p.materials,
                craftTimeHours: p.craft_time_hours,
                available: p.available,
                isFeatured: p.is_featured,
                isBestseller: p.is_bestseller,
                createdAt: p.created_at
            }));
    },
    add: async (product)=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('products').insert({
            title: product.title,
            category: product.category,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice,
            images: product.images,
            colors: product.colors,
            sizes: product.sizes,
            materials: product.materials,
            craft_time_hours: product.craftTimeHours,
            available: product.available,
            is_featured: product.isFeatured,
            is_bestseller: product.isBestseller
        }).select().single();
        if (error) throw error;
        return {
            id: data.id,
            title: data.title,
            category: data.category,
            description: data.description,
            price: Number(data.price),
            originalPrice: data.original_price ? Number(data.original_price) : undefined,
            images: data.images,
            colors: data.colors,
            sizes: data.sizes,
            materials: data.materials,
            craftTimeHours: data.craft_time_hours,
            available: data.available,
            isFeatured: data.is_featured,
            isBestseller: data.is_bestseller,
            createdAt: data.created_at
        };
    },
    update: async (id, updates)=>{
        const updateData = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.category) updateData.category = updates.category;
        if (updates.description) updateData.description = updates.description;
        if (updates.price) updateData.price = updates.price;
        if (updates.originalPrice) updateData.original_price = updates.originalPrice;
        if (updates.images) updateData.images = updates.images;
        if (updates.colors) updateData.colors = updates.colors;
        if (updates.sizes) updateData.sizes = updates.sizes;
        if (updates.materials) updateData.materials = updates.materials;
        if (updates.craftTimeHours) updateData.craft_time_hours = updates.craftTimeHours;
        if (updates.available !== undefined) updateData.available = updates.available;
        if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
        if (updates.isBestseller !== undefined) updateData.is_bestseller = updates.isBestseller;
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('products').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return null;
        return {
            id: data.id,
            title: data.title,
            category: data.category,
            description: data.description,
            price: Number(data.price),
            originalPrice: data.original_price ? Number(data.original_price) : undefined,
            images: data.images,
            colors: data.colors,
            sizes: data.sizes,
            materials: data.materials,
            craftTimeHours: data.craft_time_hours,
            available: data.available,
            isFeatured: data.is_featured,
            isBestseller: data.is_bestseller,
            createdAt: data.created_at
        };
    },
    delete: async (id)=>{
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('products').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};
const dbOrders = {
    getAll: async ()=>{
        const { data: orders, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('orders').select('*').order('created_at', {
            ascending: false
        });
        if (error) throw error;
        const ordersWithItems = await Promise.all(orders.map(async (order)=>{
            const { data: items } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('order_items').select('*').eq('order_id', order.id);
            return {
                id: order.id,
                orderRef: order.order_ref,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                shippingAddress: order.shipping_address,
                items: items?.map((item)=>({
                        productId: item.product_id,
                        productTitle: item.product_title,
                        productImage: item.product_image,
                        color: item.color_name,
                        colorHex: item.color_hex,
                        size: item.size,
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
        }));
        return ordersWithItems;
    },
    add: async (order)=>{
        const orderRef = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        // Create order
        const { data: orderData, error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('orders').insert({
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
        }).select().single();
        if (orderError) throw orderError;
        // Create order items
        const orderItems = order.items.map((item)=>({
                order_id: orderData.id,
                product_id: item.productId,
                product_title: item.productTitle,
                product_image: item.productImage,
                color_name: item.color,
                color_hex: item.colorHex,
                size: item.size,
                quantity: item.quantity,
                price: item.price
            }));
        const { error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('order_items').insert(orderItems);
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
    updateStatus: async (id, status)=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('orders').update({
            status
        }).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return null;
        // Get order items
        const { data: items } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('order_items').select('*').eq('order_id', data.id);
        return {
            id: data.id,
            orderRef: data.order_ref,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            shippingAddress: data.shipping_address,
            items: items?.map((item)=>({
                    productId: item.product_id,
                    productTitle: item.product_title,
                    productImage: item.product_image,
                    color: item.color_name,
                    colorHex: item.color_hex,
                    size: item.size,
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
const dbMessages = {
    getAll: async ()=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('messages').select('*').order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return data.map((m)=>({
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
    add: async (message)=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('messages').insert({
            name: message.name,
            email: message.email,
            phone: message.phone,
            subject: message.subject,
            message: message.message,
            read: false
        }).select().single();
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
    toggleRead: async (id, read)=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('messages').update({
            read
        }).eq('id', id).select().single();
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
    delete: async (id)=>{
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('messages').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};
const dbAdmin = {
    verifyPassword: async (password)=>{
        try {
            // Get the stored password hash from admin_settings table
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('admin_settings').select('admin_password_hash').single();
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
    updatePassword: async (currentPassword, newPassword)=>{
        try {
            // First verify current password
            const isValid = await dbAdmin.verifyPassword(currentPassword);
            if (!isValid) {
                return false;
            }
            // Update password
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('admin_settings').update({
                admin_password_hash: newPassword,
                updated_at: new Date().toISOString()
            }).eq('id', (await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('admin_settings').select('id').single()).data?.id);
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
    initializeAdminPassword: async (defaultPassword)=>{
        try {
            // Check if admin settings exist
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('admin_settings').select('id').maybeSingle();
            if (error) throw error;
            // If no settings exist, create with default password
            if (!data) {
                const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('admin_settings').insert({
                    admin_password_hash: defaultPassword
                });
                if (insertError) throw insertError;
            }
        } catch (error) {
            console.error('Error initializing admin password:', error);
        }
    }
};
}),
"[project]/app/api/admin/initialize/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const { password } = body;
        if (!password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Password is required'
            }, {
                status: 400
            });
        }
        if (password.length < 6) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Password must be at least 6 characters long'
            }, {
                status: 400
            });
        }
        // Initialize admin password in Supabase
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbAdmin"].initializeAdminPassword(password);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Admin password initialized successfully'
        });
    } catch (error) {
        console.error('Error during admin initialization:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: 'Initialization failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5f968349._.js.map