import { Product, Order, Message } from '../types';

const heroImg = '/src/assets/images/wengi_hero_crochet_1785323531326.jpg';
const toteImg = '/src/assets/images/wengi_crochet_tote_1785323544902.jpg';
const cardiganImg = '/src/assets/images/wengi_crochet_cardigan_1785323557878.jpg';
const flowersImg = '/src/assets/images/wengi_crochet_flowers_1785323568097.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: "The Royal Atelier Structured Tote",
    category: 'Bags',
    description: "Handwoven with 100% organic combed Egyptian cotton yarn. Features structured French geometric stitching, genuine Adobe orange hand-stitched leather straps, and solid brass hardware finish.",
    price: 285,
    images: [
      toteImg,
      heroImg,
    ],
    colors: 'Classic Navy, Warm Adobe, Cream Beige',
    available: true,
    createdAt: '2026-07-20T10:00:00.000Z'
  },
  {
    id: 'prod-002',
    title: "Parisian Lattice Knit Cardigan",
    category: 'Garments',
    description: "An airy, luxury crochet cardigan incorporating vintage French lace stitches. Designed for effortless year-round draping with custom horn buttons and reinforced cuffs.",
    price: 340,
    images: [
      cardiganImg,
      heroImg,
    ],
    colors: 'Cream Beige, Warm Sand, Classic Navy',
    available: true,
    createdAt: '2026-07-21T11:30:00.000Z'
  },
  {
    id: 'prod-003',
    title: "Artisanal Botanical Bouquet Set",
    category: 'Home & Floral',
    description: "Forever-blooming handcrafted crochet floral bouquet featuring sculpted calla lilies, French roses, and eucalyptus sprigs in harmonized navy, adobe, and warm sand yarns.",
    price: 165,
    images: [
      flowersImg,
      heroImg,
    ],
    colors: 'Sunset Harmony, Midnight Garden, Sand & Ivory',
    available: true,
    createdAt: '2026-07-22T14:15:00.000Z'
  },
  {
    id: 'prod-004',
    title: "Wengi Signature Micro Shoulder Bag",
    category: 'Bags',
    description: "Compact luxury shoulder pouch with hand-braided gold yarn chain, satin interior lining, and magnetic flap enclosure. Lightweight yet elegant evening accessory.",
    price: 195,
    images: [
      heroImg,
      toteImg,
    ],
    colors: 'Warm Adobe, Classic Navy',
    available: true,
    createdAt: '2026-07-23T09:00:00.000Z'
  },
  {
    id: 'prod-005',
    title: "Heritage Woven Crochet Shawl",
    category: 'Accessories',
    description: "Ultra-soft draped shoulder shawl with hand-tied tassel fringe. Expertly crafted using fine alpaca and bamboo thread for exceptional softness and warmth.",
    price: 220,
    images: [
      cardiganImg,
      flowersImg,
    ],
    colors: 'Warm Sand, Classic Navy, Soft Cream',
    available: true,
    createdAt: '2026-07-24T16:45:00.000Z'
  },
  {
    id: 'prod-006',
    title: "Architectural Crochet Sun Hat",
    category: 'Accessories',
    description: "Wide-brimmed structured sun hat woven with natural raffia and soft cream cotton yarn. Packable, shape-retaining, and finished with an Adobe orange ribbon band.",
    price: 145,
    images: [
      heroImg,
      cardiganImg,
    ],
    colors: 'Natural & Adobe, Natural & Navy',
    available: true,
    createdAt: '2026-07-25T11:20:00.000Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    customerName: 'Claire Dubois',
    customerEmail: 'claire.dubois@fashionhouse.fr',
    customerPhone: '+33 6 12 34 56 78',
    shippingAddress: '42 Avenue Montaigne, 75008 Paris, France',
    items: [
      {
        productId: 'prod-001',
        productTitle: 'The Royal Atelier Structured Tote',
        productImage: toteImg,
        color: 'Classic Navy',
        quantity: 1,
        price: 285
      }
    ],
    totalAmount: 285,
    status: 'Pending',
    deliveryPreference: 'Express Courier',
    paymentMethod: 'Credit / Debit Card',
    specialNotes: 'Please include bespoke gift wrapping with navy satin ribbon.',
    createdAt: '2026-07-28T14:30:00.000Z'
  },
  {
    id: 'ORD-8820',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@designstudio.co.uk',
    customerPhone: '+44 7700 900077',
    shippingAddress: '18 Kensington Church St, London W8 4EP, UK',
    items: [
      {
        productId: 'prod-003',
        productTitle: 'Artisanal Botanical Bouquet Set',
        productImage: flowersImg,
        color: 'Sunset Harmony',
        quantity: 1,
        price: 165
      },
      {
        productId: 'prod-004',
        productTitle: 'Wengi Signature Micro Shoulder Bag',
        productImage: heroImg,
        color: 'Warm Adobe',
        quantity: 1,
        price: 195
      }
    ],
    totalAmount: 360,
    status: 'Processing',
    deliveryPreference: 'Express Courier',
    paymentMethod: 'Credit / Debit Card',
    specialNotes: 'Anniversary gift for my wife. Thank you!',
    createdAt: '2026-07-27T09:15:00.000Z'
  },
  {
    id: 'ORD-8819',
    customerName: 'Sophia Lin',
    customerEmail: 'sophia.lin@atelier.com',
    customerPhone: '+1 415 555 0192',
    shippingAddress: '780 Broadway, San Francisco, CA 94133, USA',
    items: [
      {
        productId: 'prod-002',
        productTitle: 'Parisian Lattice Knit Cardigan',
        productImage: cardiganImg,
        color: 'Cream Beige',
        quantity: 1,
        price: 340
      }
    ],
    totalAmount: 340,
    status: 'Delivered',
    deliveryPreference: 'Standard Delivery',
    paymentMethod: 'Credit / Debit Card',
    createdAt: '2026-07-24T18:00:00.000Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'MSG-301',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@vogue.co',
    phone: '+1 212 555 0188',
    subject: 'Bespoke Bridal Party Commission Inquiry',
    message: 'Hello Wengi, I loved your Royal Atelier Tote! I am interested in ordering 6 custom bridesmaid crochet clutches in Soft Cream Beige with customized embroidered initials. Could we arrange a consultation?',
    read: false,
    createdAt: '2026-07-28T16:20:00.000Z'
  },
  {
    id: 'MSG-302',
    name: 'Jean-Luc Moreau',
    email: 'jmoreau@boutique-paris.fr',
    phone: '+33 1 42 68 55 00',
    subject: 'Wholesale Stockist Inquiry - Paris Boutique',
    message: 'Greetings from Le Marais! We would love to feature Wengi\'s Touch handcrafted garments in our autumn collection window display. Please send your wholesale catalogue.',
    read: true,
    createdAt: '2026-07-26T11:05:00.000Z'
  }
];
