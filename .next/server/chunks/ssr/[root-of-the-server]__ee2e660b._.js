module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/context/LanguageContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "getProductTranslation",
    ()=>getProductTranslation,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const translations = {
    en: {
        // Nav
        'nav.collection': 'Collection Showcase',
        'nav.contact': 'Atelier & Contact',
        'nav.admin': 'Admin Portal',
        'nav.adminDashboard': 'Admin Dashboard',
        'nav.searchPlaceholder': 'Search crochet...',
        'nav.orderList': 'Order List',
        // Hero
        'hero.badge': 'Parisian & Ethiopian High-Fashion Atelier',
        'hero.title': 'Haute Crochet Artisan Crafted in Paris & Addis',
        'hero.description': 'Discover exclusive handcrafted crochet totes, luxury lace garments, and botanical textile arrangements woven with master French architectural discipline and Ethiopian heritage.',
        'hero.exploreBtn': 'Explore Collection',
        'hero.customRequestBtn': 'Request Custom Piece',
        'hero.handcrafted': '100% Handcrafted',
        'hero.masterArtisan': 'Master Artisan',
        // Hero rotating products
        'hero.prod1.title': 'The Royal Atelier Tote',
        'hero.prod1.cat': 'Handbags & Totes',
        'hero.prod1.craft': '28h Handwoven',
        'hero.prod1.desc': 'Classic Navy & Warm Adobe Leather Handles',
        'hero.prod1.tag': 'Round 1 • Sample Bag Product',
        'hero.prod2.title': 'Parisian Lace Cardigan',
        'hero.prod2.cat': 'Haute Couture Garments',
        'hero.prod2.craft': '36h Handwoven',
        'hero.prod2.desc': 'Structural Cream Beige Open Weave Pattern',
        'hero.prod2.tag': 'Round 2 • Garment Collection',
        'hero.prod3.title': 'Botanical Bouquet Arrangement',
        'hero.prod3.cat': 'Home & Floral Art',
        'hero.prod3.craft': '18h Handwoven',
        'hero.prod3.desc': 'Everlasting Handcrafted Wildflower Stems',
        'hero.prod3.tag': 'Round 3 • Floral Artwork',
        'hero.prod4.title': 'Haute Crochet Masterpiece',
        'hero.prod4.cat': 'Signature Atelier Series',
        'hero.prod4.craft': '45h Handwoven',
        'hero.prod4.desc': 'Exclusive Architectural Thread Artwork',
        'hero.prod4.tag': 'Round 4 • Hero Masterpiece',
        // Showcase
        'showcase.subtitle': 'Handcrafted Luxury',
        'showcase.title': 'Bespoke Crochet Collections',
        'showcase.desc': 'Explore our limited-edition handcrafted pieces woven with organic cotton yarns and luxury merino blends.',
        'showcase.cat.all': 'All Pieces',
        'showcase.cat.bags': 'Bags & Totes',
        'showcase.cat.garments': 'Haute Garments',
        'showcase.cat.accessories': 'Accessories',
        'showcase.cat.home': 'Home & Floral',
        'showcase.showing': 'Showing',
        'showcase.pieces': 'crochet pieces',
        'showcase.order': 'Order',
        'showcase.viewDetails': 'View Details',
        'showcase.bestseller': 'Bestseller',
        'showcase.featured': 'Featured Atelier',
        'showcase.craftTime': 'Hours Handwoven',
        'showcase.madeToOrder': 'Made to Order Only',
        'showcase.empty': 'No crochet pieces found matching your criteria.',
        // Details Modal
        'details.craftSpecs': 'Craftsmanship Specifications',
        'details.materials': 'Materials Used',
        'details.craftTime': 'Dedicated Craft Time',
        'details.hours': 'Hours of Precision Weaving',
        'details.shade': 'Selected Shade / Color',
        'details.size': 'Dimensions / Fit',
        'details.quantity': 'Order Quantity',
        'details.order': 'Order',
        'details.orderNow': 'Order Now',
        'details.addedNotice': 'Added to your order list!',
        'details.customNote': 'Each piece is handwoven to order. Slight unique variations reflect authentic artisan craftsmanship.',
        // Order Modal
        'orderModal.title': 'Complete Your Order',
        'orderModal.subtitle': 'Provide your contact details and choose your delivery timeframe.',
        'orderModal.sectionTitle': 'Order Information',
        'orderModal.nameLabel': 'Full Name *',
        'orderModal.namePlaceholder': 'Enter your full name',
        'orderModal.phoneLabel': 'Phone Number *',
        'orderModal.phonePlaceholder': 'Enter your phone number',
        'orderModal.deliveryLabel': 'Delivery Option (Days) *',
        'orderModal.placeOrder': 'Place Order',
        'orderModal.processing': 'Processing Order...',
        'orderModal.successTitle': 'Order Successfully Placed!',
        'orderModal.successDesc': 'We have received your order request! Our master artisans are preparing your bespoke piece. We will contact you at',
        'orderModal.customerName': 'Customer Name:',
        'orderModal.customerPhone': 'Phone Number:',
        'orderModal.deliveryOption': 'Delivery Option:',
        'orderModal.totalAmount': 'Total Amount:',
        'orderModal.closeBtn': 'Close Window',
        // Cart Drawer
        'cart.title': 'Your Cart',
        'cart.emptyTitle': 'Your cart is currently empty',
        'cart.emptyDesc': 'Explore our handcrafted crochet collection and click Order to add pieces.',
        'cart.total': 'Cart Total:',
        'cart.checkout': 'Place Order Now',
        // Brand Story
        'story.badge': 'Atelier Heritage',
        'story.title': 'The Legacy of Wengi\'s Touch',
        'story.desc1': 'Founded with a passion for preserving timeless textile artistry, Wengi\'s Touch brings high-fashion crochet into modern luxury living.',
        'story.desc2': 'Combining architectural precision with rich Ethiopian cultural weaving techniques, every stitch is executed by hand with utmost patience and dedication.',
        'story.val1Title': 'Sustainable Luxury',
        'story.val1Desc': '100% natural, ethically sourced cotton, silk, and wool fibers.',
        'story.val2Title': 'Architectural Precision',
        'story.val2Desc': 'Structured stitch counts designed for enduring durability and shape retention.',
        'story.val3Title': 'Authentic Ethiopian Heritage',
        'story.val3Desc': 'Celebrating traditional artisan craftsmanship passed through generations.',
        // Contact Page
        'contact.badge': 'Get in Touch',
        'contact.title': 'Atelier & Custom Commissions',
        'contact.desc': 'Have a custom design in mind or a question about our collections? Send us a message below.',
        'contact.name': 'Your Full Name *',
        'contact.namePlaceholder': 'e.g. Abebe Bikila',
        'contact.email': 'Email Address *',
        'contact.emailPlaceholder': 'abebe@example.com',
        'contact.phone': 'Phone / WhatsApp (Optional)',
        'contact.phonePlaceholder': '+251 911 234 567',
        'contact.message': 'Your Message or Custom Request *',
        'contact.messagePlaceholder': 'Describe your request, dimensions, or custom design idea...',
        'contact.send': 'Send Message',
        'contact.sending': 'Sending Message...',
        'contact.successTitle': 'Message Received!',
        'contact.successDesc': 'Thank you for reaching out to Wengi\'s Touch. Our team will get back to you shortly.',
        'contact.atelierTitle': 'Visit Our Atelier',
        'contact.atelierLoc': 'Addis Ababa & Paris Atelier',
        'contact.directPhone': 'Direct Phone / WhatsApp',
        'contact.atelierHours': 'Atelier Hours',
        'contact.hoursVal': 'Monday - Saturday: 9:00 AM - 7:00 PM',
        // Footer
        'footer.tagline': 'High-end handcrafted crochet handbags, garments, and floral textile sculptures.',
        'footer.quickNav': 'Quick Navigation',
        'footer.gazette': 'Atelier Gazette',
        'footer.gazetteDesc': 'Receive exclusive preview invites to new collection drops and bespoke releases.',
        'footer.subscribe': 'Subscribe',
        'footer.subscribed': 'Subscribed!',
        'footer.rights': 'All Rights Reserved. Handcrafted with passion.',
        // Admin
        'admin.portal': 'Admin Portal',
        'admin.dashboard': 'Dashboard',
        'admin.products': 'Products',
        'admin.orders': 'Orders',
        'admin.messages': 'Messages',
        'admin.logout': 'Logout',
        'admin.loginTitle': 'Admin Authentication',
        'admin.username': 'Username',
        'admin.password': 'Password',
        'admin.loginBtn': 'Login to Dashboard',
        // Admin Dashboard
        'adminDash.totalProducts': 'Total Products',
        'adminDash.inStock': 'In Stock',
        'adminDash.totalOrders': 'Total Orders',
        'adminDash.available': 'Available',
        'adminDash.readyToShip': 'Ready to Ship',
        'adminDash.newOrders': 'New Orders',
        'adminDash.pendingAction': 'Pending Action',
        'adminDash.completed': 'Completed',
        'adminDash.delivered': 'Delivered',
        'adminDash.totalRevenue': 'Total Revenue',
        'adminDash.allTimeSales': 'All Time Sales',
        'adminDash.recentOrders': 'Recent Order Requests',
        'adminDash.recentOrdersDesc': 'Latest customer activity requiring fulfillment',
        'adminDash.viewAllOrders': 'View All Orders',
        'adminDash.quickActions': 'Atelier Quick Actions',
        'adminDash.addProduct': 'Add New Crochet Piece',
        'adminDash.viewMessages': 'View Messages',
        'adminDash.recentMessages': 'Recent Messages',
        'adminDash.noMessages': 'No recent messages',
        // Admin Products
        'adminProd.title': 'Product Catalogue Management',
        'adminProd.desc': 'Add, update pricing, colors, sizes, and availability status for atelier items',
        'adminProd.addProduct': 'Add New Product',
        'adminProd.search': 'Search catalogue...',
        'adminProd.category': 'Category',
        'adminProd.allCategories': 'All Categories',
        'adminProd.titleCategory': 'Piece Title & Category',
        'adminProd.price': 'Price',
        'adminProd.colorsSizes': 'Colors & Sizes',
        'adminProd.craftTime': 'Craft Time',
        'adminProd.availability': 'Availability',
        'adminProd.actions': 'Actions',
        'adminProd.edit': 'Edit',
        'adminProd.delete': 'Delete',
        'adminProd.cancel': 'Cancel',
        'adminProd.save': 'Save Product',
        'adminProd.editProduct': 'Edit Product',
        'adminProd.addNewProduct': 'Add New Product',
        'adminProd.titleLabel': 'Product Title',
        'adminProd.categoryLabel': 'Category',
        'adminProd.descriptionLabel': 'Description',
        'adminProd.priceLabel': 'Price',
        'adminProd.originalPriceLabel': 'Original Price',
        'adminProd.imageUrlLabel': 'Image URL',
        'adminProd.colorsLabel': 'Colors (format: Name (Hex))',
        'adminProd.sizesLabel': 'Sizes (comma separated)',
        'adminProd.materialsLabel': 'Materials (comma separated)',
        'adminProd.craftTimeLabel': 'Craft Time (hours)',
        'adminProd.availableLabel': 'Available',
        'adminProd.featuredLabel': 'Featured',
        'adminProd.bestsellerLabel': 'Bestseller',
        'adminProd.bags': 'Bags',
        'adminProd.garments': 'Garments',
        'adminProd.accessories': 'Accessories',
        'adminProd.homeFloral': 'Home & Floral',
        // Admin Orders
        'adminOrders.title': 'Orders & Atelier Commissions Management',
        'adminOrders.desc': 'Track order status, customer details, fulfillment progress, and historical logs',
        'adminOrders.totalOrders': 'Total Orders',
        'adminOrders.search': 'Search Order ID, Name, Email...',
        'adminOrders.orderRef': 'Order Ref',
        'adminOrders.customerInfo': 'Customer Info',
        'adminOrders.itemsCount': 'Items Count',
        'adminOrders.totalAmount': 'Total Amount',
        'adminOrders.currentStatus': 'Current Status',
        'adminOrders.orderDate': 'Order Date',
        'adminOrders.details': 'Details',
        'adminOrders.all': 'All',
        'adminOrders.pending': 'Pending',
        'adminOrders.confirmed': 'Confirmed',
        'adminOrders.processing': 'Processing',
        'adminOrders.delivered': 'Delivered',
        'adminOrders.cancelled': 'Cancelled',
        'adminOrders.orderDetails': 'Order Details',
        'adminOrders.customerContact': 'Customer Contact',
        'adminOrders.orderItems': 'Order Items',
        'adminOrders.item': 'Item',
        'adminOrders.quantity': 'Quantity',
        'adminOrders.price': 'Price',
        'adminOrders.orderSummary': 'Order Summary',
        'adminOrders.subtotal': 'Subtotal',
        'adminOrders.close': 'Close',
        // Admin Messages
        'adminMsg.title': 'Customer Inquiries & Atelier Messages',
        'adminMsg.desc': 'Review contact form submissions, bridal requests, and stockist inquiries',
        'adminMsg.unreadMessages': 'Unread Messages',
        'adminMsg.search': 'Search Messages, Email, Subject...',
        'adminMsg.all': 'All',
        'adminMsg.unreadOnly': 'Unread Only',
        'adminMsg.read': 'Read',
        'adminMsg.noMessages': 'No Messages Found',
        'adminMsg.readFull': 'Read Full',
        'adminMsg.markUnread': 'Mark Unread',
        'adminMsg.markRead': 'Mark Read',
        'adminMsg.delete': 'Delete Message',
        'adminMsg.inquiryDetails': 'Inquiry Details',
        'adminMsg.from': 'From',
        'adminMsg.phone': 'Phone',
        'adminMsg.date': 'Date',
        'adminMsg.message': 'Message'
    },
    am: {
        // Nav
        'nav.collection': 'የምርት ስብስብ',
        'nav.contact': 'አቴሌየር እና ግንኙነት',
        'nav.admin': 'የአድሚን ገፅ',
        'nav.adminDashboard': 'የአድሚን ዳሽቦርድ',
        'nav.searchPlaceholder': 'ክሮሼቶችን ይፈልጉ...',
        'nav.orderList': 'የትእዛዝ ዝርዝር',
        // Hero
        'hero.badge': 'የፓሪስ እና የኢትዮጵያ ከፍተኛ ደረጃ የክሮሼት አቴሌየር',
        'hero.title': 'በእጅ የተሰሩ ከፍተኛ ደረጃ የክሮሼት ጥበቦች',
        'hero.description': 'በፓሪስ የህንጻ ጥበብ እና በኢትዮጵያ ባህላዊ የእጅ ጥበብ ቅርስ በተፈጥሮ ጥጥ በእጅ የተሰሩ ልዩ የክሮሼት ቦርሳዎች፣ አልባሳት እና የጌጣጌጥ ውጤቶችን ያግኙ።',
        'hero.exploreBtn': 'ስብስቡን ይመልከቱ',
        'hero.customRequestBtn': 'ልዩ ትእዛዝ ይጠይቁ',
        'hero.handcrafted': '100% በእጅ የተሰራ',
        'hero.masterArtisan': 'ባለሙያ የክሮሼት አርቲስት',
        // Hero rotating products
        'hero.prod1.title': 'ዘ ሮያል አቴሌየር ቦርሳ',
        'hero.prod1.cat': 'የእጅ ቦርሳዎች',
        'hero.prod1.craft': '28 ሰዓት በእጅ የተሸመነ',
        'hero.prod1.desc': 'ክላሲክ ናቪ እና የቆዳ እጀታ ያለው ቦርሳ',
        'hero.prod1.tag': 'ዙር 1 • ናሙና ቦርሳ',
        'hero.prod2.title': 'ፓሪሲያን ሌስ ካርዲጋን',
        'hero.prod2.cat': 'ከፍተኛ የፋሽን አልባሳት',
        'hero.prod2.craft': '36 ሰዓት በእጅ የተሸመነ',
        'hero.prod2.desc': 'ክሬም ቤጅ ክፍት የሽመና ዲዛይን',
        'hero.prod2.tag': 'ዙር 2 • የአልባሳት ስብስብ',
        'hero.prod3.title': 'የተፈጥሮ አበቦች ስብስብ',
        'hero.prod3.cat': 'የቤት እና የአበባ ጌጣጌጥ',
        'hero.prod3.craft': '18 ሰዓት በእጅ የተሸመነ',
        'hero.prod3.desc': 'ለዘላለም የሚቆዩ በእጅ የተሰሩ የአበባ ዘንጎች',
        'hero.prod3.tag': 'ዙር 3 • የአበባ ስራ',
        'hero.prod4.title': 'ልዩ የክሮሼት ጥበብ',
        'hero.prod4.cat': 'ልዩ አቴሌየር ተከታታይ',
        'hero.prod4.craft': '45 ሰዓት በእጅ የተሸመነ',
        'hero.prod4.desc': 'ልዩ እና ድንቅ የፈትል ጥበብ',
        'hero.prod4.tag': 'ዙር 4 • ዋና የጥበብ ስራ',
        // Showcase
        'showcase.subtitle': 'በእጅ የተሰራ የቅንጦት ጥበብ',
        'showcase.title': 'ልዩ የተመረጡ የክሮሼት ስብስቦች',
        'showcase.desc': 'በተፈጥሮ ጥጥ እና ከፍተኛ ጥራት ባላቸው ፈትሎች በእጅ የተሰሩ የክሮሼት ስብስቦቻችንን ይመልከቱ።',
        'showcase.cat.all': 'ሁሉም ምርቶች',
        'showcase.cat.bags': 'ቦርሳዎች',
        'showcase.cat.garments': 'አልባሳት',
        'showcase.cat.accessories': 'ጌጣጌጦች',
        'showcase.cat.home': 'የቤት እና አበቦች',
        'showcase.showing': 'የሚታዩት',
        'showcase.pieces': 'የክሮሼት ስራዎች',
        'showcase.order': 'እዘዝ',
        'showcase.viewDetails': 'ዝርዝር ይመልከቱ',
        'showcase.bestseller': 'በብዛት የተወደደ',
        'showcase.featured': 'ልዩ አቴሌየር',
        'showcase.craftTime': 'ሰዓታት በእጅ የተሸመነ',
        'showcase.madeToOrder': 'በትእዛዝ ብቻ የሚሰራ',
        'showcase.empty': 'ከፍለጋዎ ጋር የሚጣጣም የክሮሼት ምርት አልተገኘም።',
        // Details Modal
        'details.craftSpecs': 'የእጅ ጥበቡ መግለጫ',
        'details.materials': 'የተጠቀሙባቸው ቁሳቁሶች',
        'details.craftTime': 'የፈጀው ሰዓት',
        'details.hours': 'ሰዓታት የፈጀ ጥበብ',
        'details.shade': 'የተመረጠው ቀለም',
        'details.size': 'መጠን / ስፋት',
        'details.quantity': 'የትእዛዝ ብዛት',
        'details.order': 'እዘዝ',
        'details.orderNow': 'አሁኑኑ እዘዝ',
        'details.addedNotice': 'ወደ ትእዛዝ ዝርዝርዎ ተጨምሯል!',
        'details.customNote': 'እያንዳንዱ ምርት በጥንቃቄ በእጅ የተሰራ ነው። ትናንሽ ልዩነቶች የእጅ ጥበቡን እውነተኛነት ያሳያሉ።',
        // Order Modal
        'orderModal.title': 'ትእዛዝዎን ያጠናቅቁ',
        'orderModal.subtitle': 'እባክዎን መረጃዎን ይሙሉ እና የማድረሻ ጊዜዎን ይምረጡ።',
        'orderModal.sectionTitle': 'የትእዛዝ መረጃ',
        'orderModal.nameLabel': 'ሙሉ ስም *',
        'orderModal.namePlaceholder': 'ሙሉ ስምዎን ያስገቡ',
        'orderModal.phoneLabel': 'ስልክ ቁጥር *',
        'orderModal.phonePlaceholder': 'ስልክ ቁጥርዎን ያስገቡ',
        'orderModal.deliveryLabel': 'የማድረሻ ጊዜ (ቀናት) *',
        'orderModal.placeOrder': 'ትእዛዝ ያስገቡ',
        'orderModal.processing': 'ትእዛዝዎ እየተስተናገደ ነው...',
        'orderModal.successTitle': 'ትእዛዝዎ በተሳካ ሁኔታ ተልኳል!',
        'orderModal.successDesc': 'ትእዛዝዎን ተቀብለናል! አርቲስቶቻችን ምርትዎን ማዘጋጀት ይጀምራሉ። በስልክ ቁጥርዎ በቅርቡ እንገናኛለን፡',
        'orderModal.customerName': 'የደንበኛ ስም:',
        'orderModal.customerPhone': 'ስልክ ቁጥር:',
        'orderModal.deliveryOption': 'የማድረሻ ጊዜ:',
        'orderModal.totalAmount': 'ጠቅላላ ዋጋ:',
        'orderModal.closeBtn': 'ዝጋ',
        // Cart Drawer
        'cart.title': 'የእቃዎች ዝርዝር',
        'cart.emptyTitle': 'የእቃዎች ዝርዝርዎ ባዶ ነው',
        'cart.emptyDesc': 'እባክዎን የክሮሼት ስብስቦቻችንን ይመልከቱ እና ምርት ለመምረጥ እዘዝ የሚለውን ይጫኑ።',
        'cart.total': 'ጠቅላላ ዋጋ:',
        'cart.checkout': 'አሁኑኑ ይዘዙ',
        // Brand Story
        'story.badge': 'የአቴሌየር ቅርስ',
        'story.title': 'የወንጊ ታች (Wengi\'s Touch) ታሪክ',
        'story.desc1': 'ወንጊ ታች የተመሰረተው የጥንታዊ የጨርቃጨርቅ እና የክሮሼት ጥበብን በመጠበቅ እና ለዘመናዊ የቅንጦት ህይወት በማቅረብ ፍላጎት ነው።',
        'story.desc2': 'የህንጻ ጥበብ ትክክለኝነትን ከኢትዮጵያ ሀብታም የባህል ሽመና ቴክኒኮች ጋር በማቀናጀት እያንዳንዱ ስፌት በትእግስት እና በፍቅር በእጅ ይሰራል።',
        'story.val1Title': 'ዘላቂ የቅንጦት ጥበብ',
        'story.val1Desc': '100% ተፈጥሯዊ እና ጥራት ያላቸው የጥጥ፣ ሐር እና የበግ ጠጉር ፈትሎች።',
        'story.val2Title': 'ትክክለኛ የስፌት ጥበብ',
        'story.val2Desc': 'ለረጅም ጊዜ ጥንካሬን የሚጠብቅ እና ቅርጹን የማይቀይር የስፌት ጥበብ።',
        'story.val3Title': 'እውነተኛ የኢትዮጵያ ቅርስ',
        'story.val3Desc': 'ከትውልድ ወደ ትውልድ የተላለፈውን የኢትዮጵያ የእጅ ጥበብ ቅርስ የሚያከብር።',
        // Contact Page
        'contact.badge': 'ያግኙን',
        'contact.title': 'አቴሌየር እና ልዩ ትእዛዞች',
        'contact.desc': 'ልዩ የፈለጉት የክሮሼት ዲዛይን አለዎት ወይስ ስለ ምርቶቻችን ጥያቄ አለዎት? እባክዎን መልእክት ይላኩልን።',
        'contact.name': 'ሙሉ ስምዎ *',
        'contact.namePlaceholder': 'ምሳሌ፡ አበበ ቢቂላ',
        'contact.email': 'ኢሜይል አድራሻ *',
        'contact.emailPlaceholder': 'abebe@example.com',
        'contact.phone': 'ስልክ / ዋትስአፕ (አማራጭ)',
        'contact.phonePlaceholder': '+251 911 234 567',
        'contact.message': 'መልእክትዎ ወይም ልዩ ትእዛዝዎ *',
        'contact.messagePlaceholder': 'ስለ ትእዛዝዎ፣ መጠኑ ወይም ልዩ ፍላጎትዎ እዚህ ይጻፉ...',
        'contact.send': 'መልእክት ላክ',
        'contact.sending': 'መልእክቱ እየተላከ ነው...',
        'contact.successTitle': 'መልእክትዎ ደርሶናል!',
        'contact.successDesc': 'ወንጊ ታችን ስላገኙ እናመሰግናለን። ቡድናችን በቅርቡ ያናግርዎታል።',
        'contact.atelierTitle': 'አቴሌየራችንን ይጎብኙ',
        'contact.atelierLoc': 'አዲስ አበባ እና ፓሪስ አቴሌየር',
        'contact.directPhone': 'የቀጥታ ስልክ / ዋትስአፕ',
        'contact.atelierHours': 'የስራ ሰዓት',
        'contact.hoursVal': 'ሰኞ - ቅዳሜ፡ ከጠዋቱ 3:00 - ከሰአት 1:00',
        // Footer
        'footer.tagline': 'በእጅ የተሰሩ ከፍተኛ ደረጃ የክሮሼት ቦርሳዎች፣ አልባሳት እና አበቦች።',
        'footer.quickNav': 'ፈጣን ማውጫ',
        'footer.gazette': 'የአቴሌየር ዜና',
        'footer.gazetteDesc': 'ስለ አዳዲስ የምርት ስብስቦች እና ልዩ ቅናሾች መረጃ ለማግኘት ይመዝገቡ።',
        'footer.subscribe': 'ተመዝገብ',
        'footer.subscribed': 'ተመዝግበዋል!',
        'footer.rights': 'መብቱ በህግ የተጠበቀ ነው። በጥበብ እና በእጅ የተሰራ።',
        // Admin
        'admin.portal': 'የአድሚን ገፅ',
        'admin.dashboard': 'ዳሽቦርድ',
        'admin.products': 'ምርቶች',
        'admin.orders': 'ትእዛዞች',
        'admin.messages': 'መልእክቶች',
        'admin.logout': 'ውጣ',
        'admin.loginTitle': 'የአድሚን መግቢያ',
        'admin.username': 'የተጠቃሚ ስም',
        'admin.password': 'የይለፍ ቃል',
        'admin.loginBtn': 'ወደ ዳሽቦርድ ግባ',
        // Admin Dashboard
        'adminDash.totalProducts': 'ጠቅላላ ምርቶች',
        'adminDash.inStock': 'በመጪረዣ ላይ',
        'adminDash.totalOrders': 'ጠቅላላ ትእዛዞች',
        'adminDash.available': 'ዝግጁ',
        'adminDash.readyToShip': 'ለመላክ ዝግጁ',
        'adminDash.newOrders': 'አዳዲስ ትእዛዞች',
        'adminDash.pendingAction': 'በመጠባበባ ላይ',
        'adminDash.completed': 'ተጠናቋል',
        'adminDash.delivered': 'ተልኳል',
        'adminDash.totalRevenue': 'ጠቅላላ ገቢዎች',
        'adminDash.allTimeSales': 'ሁሉም የሽያጭ ዋጋ',
        'adminDash.recentOrders': 'የቅርብ ትእዛዞች',
        'adminDash.recentOrdersDesc': 'የደንበኞች የቅርብ እንቃት',
        'adminDash.viewAllOrders': 'ሁሉንም ትእዛዞች ይመልከቱ',
        'adminDash.quickActions': 'ፈጣን ተግባራት',
        'adminDash.addProduct': 'አዲስ ምርት ያክሉ',
        'adminDash.viewMessages': 'መልእክቶችን ይመልከቱ',
        'adminDash.recentMessages': 'የቅርብ መልእክቶች',
        'adminDash.noMessages': 'የቅርብ መልእክቶች የለም',
        // Admin Products
        'adminProd.title': 'የምርት ካታሎግ አስተዳደር',
        'adminProd.desc': 'ምርቶችን ለመጨመር፣ ዋጋን ለመቀየር፣ ቀለሞችን እና ለመገልገል',
        'adminProd.addProduct': 'አዲስ ምርት ያክሉ',
        'adminProd.search': 'ካታሎግን ይፈልጉ...',
        'adminProd.category': 'ምድብ',
        'adminProd.allCategories': 'ሁሉም ምድቦች',
        'adminProd.titleCategory': 'ርዕስ እና ምድብ',
        'adminProd.price': 'ዋጋ',
        'adminProd.colorsSizes': 'ቀለሞች እና መጠኖች',
        'adminProd.craftTime': 'የፈጀው ጊዜ',
        'adminProd.availability': 'ዝግጁነት',
        'adminProd.actions': 'ተግባራት',
        'adminProd.edit': 'አርትዕ',
        'adminProd.delete': 'ሰርዝ',
        'adminProd.cancel': 'ተውል',
        'adminProd.save': 'ምርት ያስቀምጡ',
        'adminProd.editProduct': 'ምርት አርትዕ',
        'adminProd.addNewProduct': 'አዲስ ምርት ያክሉ',
        'adminProd.titleLabel': 'የምርት ርዕስ',
        'adminProd.categoryLabel': 'ምድብ',
        'adminProd.descriptionLabel': 'መግለጫ',
        'adminProd.priceLabel': 'ዋጋ',
        'adminProd.originalPriceLabel': 'የመጀመሪያ ዋጋ',
        'adminProd.imageUrlLabel': 'የምስል አድራሻ',
        'adminProd.colorsLabel': 'ቀለሞች (ቅጽ: ስም (Hex))',
        'adminProd.sizesLabel': 'መጠኖች (በነጥብ የተለያዩ)',
        'adminProd.materialsLabel': 'ዕቃዎች (በነጥብ የተለያዩ)',
        'adminProd.craftTimeLabel': 'የፈጀው ጊዜ (ሰዓታት)',
        'adminProd.availableLabel': 'ዝግጁ',
        'adminProd.featuredLabel': 'የተመረጠ',
        'adminProd.bestsellerLabel': 'በብዛት የተወደ',
        'adminProd.bags': 'ቦርሳዎች',
        'adminProd.garments': 'አልባሳት',
        'adminProd.accessories': 'ጌጣጌጦች',
        'adminProd.homeFloral': 'የቤት እና አበቦች',
        // Admin Orders
        'adminOrders.title': 'የትእዛዝ እና የአከር አስተዳደር',
        'adminOrders.desc': 'የትእዛዝ ሁኔታ፣ የደንበኛ መረጃ፣ እና ታሪክ',
        'adminOrders.totalOrders': 'ጠቅላላ ትእዛዞች',
        'adminOrders.search': 'የትእዛዝ ID፣ ስም፣ ኢሜይል...',
        'adminOrders.orderRef': 'የትእዛዝ ማመልከቻ',
        'adminOrders.customerInfo': 'የደንበኛ መረጃ',
        'adminOrders.itemsCount': 'የእቃዎች ብዛት',
        'adminOrders.totalAmount': 'ጠቅላላ ዋጋ',
        'adminOrders.currentStatus': 'የአሁኑት ሁኔታ',
        'adminOrders.orderDate': 'የትእዛዝ ቀን',
        'adminOrders.details': 'ዝርዝሮች',
        'adminOrders.all': 'ሁሉም',
        'adminOrders.pending': 'በመጠባበባ',
        'adminOrders.confirmed': 'ተረጋግጧል',
        'adminOrders.processing': 'በስራ ላይ',
        'adminOrders.delivered': 'ተልኳል',
        'adminOrders.cancelled': 'ተሰርዟል',
        'adminOrders.orderDetails': 'የትእዛዝ ዝርዝሮች',
        'adminOrders.customerContact': 'የደንበኛ ግንኙነት',
        'adminOrders.orderItems': 'የትእዛዝ እቃዎች',
        'adminOrders.item': 'እቃ',
        'adminOrders.quantity': 'ብዛት',
        'adminOrders.price': 'ዋጋ',
        'adminOrders.orderSummary': 'የትእዛዝ ማጠቃል',
        'adminOrders.subtotal': 'ንፅስ',
        'adminOrders.close': 'ዝጋ',
        // Admin Messages
        'adminMsg.title': 'የደንበኞች ጥያቄዎች እና መልእክቶች',
        'adminMsg.desc': 'የአንገሮች መልእክቶችን እና ጥያቄዎችን ይመልከቱ',
        'adminMsg.unreadMessages': 'ያልተነቡ መልእክቶች',
        'adminMsg.search': 'መልእክቶችን፣ ኢሜይልን ይፈልጉ...',
        'adminMsg.all': 'ሁሉም',
        'adminMsg.unreadOnly': 'ያልተነቡ ብቻ',
        'adminMsg.read': 'ተነቡ',
        'adminMsg.noMessages': 'መልእክቶች አልተገኙም',
        'adminMsg.readFull': 'ሙሉ ይነቡ',
        'adminMsg.markUnread': 'እንደ ያልተነቡ ምልክ',
        'adminMsg.markRead': 'እንደ ተነበረ ምልክ',
        'adminMsg.delete': 'ሰርዝ',
        'adminMsg.inquiryDetails': 'የጥያቄ ዝርዝሮች',
        'adminMsg.from': 'ከ',
        'adminMsg.phone': 'ስልክ',
        'adminMsg.date': 'ቀን',
        'adminMsg.message': 'መልእክት'
    }
};
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const LanguageProvider = ({ children })=>{
    const [language, setLanguageState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return 'en';
    });
    const setLanguage = (lang)=>{
        setLanguageState(lang);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    };
    const toggleLanguage = ()=>{
        const nextLang = language === 'en' ? 'am' : 'en';
        setLanguage(nextLang);
    };
    const t = (key)=>{
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage,
            toggleLanguage,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/LanguageContext.tsx",
        lineNumber: 567,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useLanguage = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
const getProductTranslation = (productTitle, category, language)=>{
    if (language === 'en') {
        return {
            title: productTitle,
            category
        };
    }
    // Amharic mapping for products
    const categoryMap = {
        'Bags': 'ቦርሳዎች',
        'Garments': 'አልባሳት',
        'Accessories': 'ጌጣጌጦች',
        'Home & Floral': 'የቤት እና አበቦች'
    };
    const titleMap = {
        'The Royal Atelier Structured Tote': 'ዘ ሮያል አቴሌየር ቦርሳ',
        'Parisian Lattice Knit Cardigan': 'ፓሪሲያን ሌስ ካርዲጋን',
        'Artisanal Botanical Bouquet Set': 'የተፈጥሮ አበቦች ስብስብ',
        'Haute Couture Velvet Crochet Clutch': 'የቨልቬት ክሮሼት ቦርሳ',
        'Ethereal Summer Mesh Coverup': 'የበጋ ሜሽ አልባሳት',
        'Artisan Crochet Hair Ribbon & Clip': 'የክሮሼት የጸጉር ጌጥ'
    };
    return {
        title: titleMap[productTitle] || productTitle,
        category: categoryMap[category] || category
    };
};
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ee2e660b._.js.map