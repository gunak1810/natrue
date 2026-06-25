import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, setDoc, increment, arrayUnion, arrayRemove, writeBatch
} from 'firebase/firestore';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ============ PRODUCTS ============
export async function getProducts(filters = {}) {
  let q = collection(db, 'products');
  const constraints = [];
  
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  if (filters.featured) {
    constraints.push(where('featured', '==', true));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  q = query(q, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getProductBySlug(slug) {
  const q = query(collection(db, 'products'), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getProductById(id) {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function addProduct(productData) {
  const docRef = await addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateProduct(id, data) {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id));
}

// ============ CATEGORIES ============
export async function getCategories() {
  const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCategoryBySlug(slug) {
  const q = query(collection(db, 'categories'), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function addCategory(data) {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateCategory(id, data) {
  await updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, 'categories', id));
}

// ============ ORDERS ============
export async function getOrders(filters = {}) {
  let q = collection(db, 'orders');
  const constraints = [];
  
  if (filters.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  // NOTE: If neither userId nor status are provided (Admin fetching all)
  // we could orderBy. But combining equality clauses with orderBy requires a composite index.
  // To bypass this for now, we will fetch and sort in JavaScript.
  
  q = query(q, ...constraints);
  const snapshot = await getDocs(q);
  
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Client-side sort to avoid composite index requirement
  results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  
  if (filters.limit) {
    results = results.slice(0, filters.limit);
  }
  
  return results;
}

export async function getOrderById(id) {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function createOrder(orderData) {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateOrderStatus(id, status) {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date().toISOString() });
}

// ============ USERS ============
export async function createUserProfile(userId, data) {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    role: 'customer',
    createdAt: new Date().toISOString()
  });
}

export async function getUserProfile(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateUserProfile(userId, data) {
  await setDoc(doc(db, 'users', userId), data, { merge: true });
}

export async function getUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============ REVIEWS ============
export async function getReviews(productId) {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addReview(data) {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function getAllReviews() {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============ BANNERS ============
export async function getBanners() {
  const q = query(collection(db, 'banners'), where('active', '==', true), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllBanners() {
  const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addBanner(data) {
  const docRef = await addDoc(collection(db, 'banners'), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateBanner(id, data) {
  await updateDoc(doc(db, 'banners', id), data);
}

export async function deleteBanner(id) {
  await deleteDoc(doc(db, 'banners', id));
}

// ============ SETTINGS ============
export async function getStoreSettings() {
  const docRef = doc(db, 'settings', 'store');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data();
}

export async function updateStoreSettings(data) {
  await setDoc(doc(db, 'settings', 'store'), data, { merge: true });
}

// ============ FILE UPLOAD ============
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

// ============ SEARCH ============
export async function searchProducts(searchTerm) {
  const q = query(collection(db, 'products'), orderBy('name'));
  const snapshot = await getDocs(q);
  const term = searchTerm.toLowerCase();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(p => 
      p.name.toLowerCase().includes(term) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(term))) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
}

// ============ SEED DATA ============
export async function seedSampleData() {
  const batch = writeBatch(db);
  
  // Categories
  const categories = [
    { name: 'Return Gifts', slug: 'return-gifts', image: '/images/categories/return-gifts.jpg', order: 1, description: 'Perfect birthday return gifts for kids' },
    { name: 'New Arrivals', slug: 'new-arrivals', image: '/images/categories/new-arrivals.jpg', order: 2, description: 'Latest and trending products' },
    { name: 'Stationery', slug: 'stationery', image: '/images/categories/stationery.jpg', order: 3, description: 'Fancy stationery sets and supplies' },
    { name: 'DIY Kits', slug: 'diy-kits', image: '/images/categories/diy-kits.jpg', order: 4, description: 'Creative DIY and craft kits' },
    { name: 'Toys & Games', slug: 'toys-games', image: '/images/categories/toys-games.jpg', order: 5, description: 'Fun toys and brain games' },
    { name: 'LED Lamps', slug: 'led-lamps', image: '/images/categories/led-lamps.jpg', order: 6, description: 'Beautiful night lamps and desk lights' },
    { name: 'Bags & Pouches', slug: 'bags-pouches', image: '/images/categories/bags-pouches.jpg', order: 7, description: 'School bags, sling bags and pouches' },
    { name: 'Gift Hampers', slug: 'gift-hampers', image: '/images/categories/gift-hampers.jpg', order: 8, description: 'Curated gift hamper boxes' },
    { name: 'Keychains', slug: 'keychains', image: '/images/categories/keychains.jpg', order: 9, description: 'Personalized and cute keychains' },
    { name: 'Water Bottles', slug: 'water-bottles', image: '/images/categories/water-bottles.jpg', order: 10, description: 'Fun water bottles and sippers' },
    { name: 'Lunch Boxes', slug: 'lunch-boxes', image: '/images/categories/lunch-boxes.jpg', order: 11, description: 'Cute and fun lunch boxes for kids' },
    { name: 'Personalization', slug: 'personalization', image: '/images/categories/personalization.jpg', order: 12, description: 'Customized gifts with name printing' },
  ];
  
  for (const cat of categories) {
    const catRef = doc(collection(db, 'categories'));
    batch.set(catRef, { ...cat, createdAt: new Date().toISOString() });
  }
  
  // Products
  const products = [
    { name: 'Adorable Kids Cartoon Handbag', slug: 'adorable-kids-cartoon-handbag', description: 'Vibrant Colors | Perfect for Birthday Return Gifts. These cute cartoon handbags come in multiple colors and are perfect for gifting to kids.', price: 299, salePrice: 225, images: ['/images/products/handbag-1.jpg'], category: 'return-gifts', tags: ['handbag', 'kids', 'return gift', 'cartoon'], stock: 150, rating: 4.82, reviewCount: 17, featured: true, variants: [{ name: 'Color', options: ['Pink', 'Blue', 'Green', 'Yellow'] }] },
    { name: 'Vibrant Sling Chest Shoulder Bag', slug: 'vibrant-sling-bag', description: 'Sling It & Go! A vibrant and trendy sling/chest shoulder bag perfect for kids and teens.', price: 299, salePrice: 199, images: ['/images/products/sling-bag-1.jpg'], category: 'bags-pouches', tags: ['sling bag', 'shoulder bag', 'kids', 'return gift'], stock: 200, rating: 4.93, reviewCount: 14, featured: true },
    { name: 'Jewellery Box Organizer', slug: 'jewellery-box-organizer', description: 'A beautiful jewelry box organizer perfect as a return gift. Compact, cute, and personizable!', price: 299, salePrice: 199, images: ['/images/products/jewelry-box-1.jpg'], category: 'return-gifts', tags: ['jewellery box', 'organizer', 'return gift', 'personalized'], stock: 100, rating: 4.81, reviewCount: 16, featured: true },
    { name: 'Wood Intelligence Jigsaw Puzzle', slug: 'wood-jigsaw-puzzle', description: 'Tetris Board Fun! A wooden intelligence jigsaw puzzle that kids love. Great brain training toy.', price: 199, salePrice: 119, images: ['/images/products/puzzle-1.jpg'], category: 'toys-games', tags: ['puzzle', 'wooden', 'brain game', 'tetris'], stock: 80, rating: 4.62, reviewCount: 8, featured: true },
    { name: '5-in-1 Ultimate Stationery Set', slug: '5-in-1-stationery-set', description: 'The ultimate stationery set with 5 essential items. Perfect for school and return gifts.', price: 49, salePrice: 49, images: ['/images/products/stationery-set-1.jpg'], category: 'stationery', tags: ['stationery', 'set', 'school', 'return gift'], stock: 300, rating: 4.67, reviewCount: 3, featured: true },
    { name: 'Cartoon Design LED Wristband Spinner', slug: 'led-wristband-spinner', description: 'A fun glowing wristband with spinning LED lights. Kids absolutely love these!', price: 149, salePrice: 88, images: ['/images/products/wristband-1.jpg'], category: 'return-gifts', tags: ['led', 'wristband', 'spinner', 'glow'], stock: 500, rating: 4.63, reviewCount: 27, featured: true },
    { name: 'Cute Magnetic Cartoon Bookmarks', slug: 'magnetic-bookmarks', description: 'A set of cute magnetic cartoon bookmarks. Fun, functional, and great for return gifts!', price: 79, salePrice: 49, images: ['/images/products/bookmarks-1.jpg'], category: 'stationery', tags: ['bookmarks', 'magnetic', 'cartoon', 'kids'], stock: 400, rating: 4.89, reviewCount: 19, featured: false },
    { name: 'Magic Scratch Notebook Diary', slug: 'magic-scratch-notebook', description: 'Scratch away the surface to reveal rainbow colors! 10 sheets of magical scratchable pages.', price: 49, salePrice: 29, images: ['/images/products/scratch-notebook-1.jpg'], category: 'stationery', tags: ['scratch', 'notebook', 'rainbow', 'magic'], stock: 600, rating: 4.84, reviewCount: 25, featured: true },
    { name: 'DIY Construction Vehicle Puzzle Sharpener', slug: 'diy-vehicle-puzzle-sharpener', description: 'Build your own construction vehicle that doubles as a pencil sharpener! Fun and functional DIY kit.', price: 129, salePrice: 89, images: ['/images/products/diy-vehicle-1.jpg'], category: 'diy-kits', tags: ['diy', 'construction', 'vehicle', 'sharpener'], stock: 100, rating: 5.0, reviewCount: 1, featured: false },
    { name: 'Rotating Star Projector Night Lamp', slug: 'star-projector-lamp', description: '360-Degree Galaxy & Moon Lamp. Creates a stunning starry sky projection in any room.', price: 599, salePrice: 399, images: ['/images/products/star-lamp-1.jpg'], category: 'led-lamps', tags: ['lamp', 'projector', 'star', 'galaxy', 'night light'], stock: 50, rating: 4.8, reviewCount: 5, featured: true },
    { name: 'Personalized Metal Keychain Round', slug: 'personalized-metal-keychain', description: 'Beautiful round metal keychain with custom name or logo engraving. Perfect for gifts!', price: 149, salePrice: 99, images: ['/images/products/keychain-1.jpg'], category: 'keychains', tags: ['keychain', 'personalized', 'metal', 'engraved'], stock: 1000, rating: 4.91, reviewCount: 102, featured: true },
    { name: 'Burger Lunch Box for Kids', slug: 'burger-lunch-box', description: 'A fun burger-shaped lunch box with spoon & fork. Makes lunchtime exciting for kids!', price: 349, salePrice: 249, images: ['/images/products/lunch-box-1.jpg'], category: 'lunch-boxes', tags: ['lunch box', 'burger', 'kids', 'fun'], stock: 80, rating: 4.7, reviewCount: 6, featured: false },
    { name: 'Kawaii Cartoon Steel Tumbler 700ml', slug: 'kawaii-steel-tumbler', description: 'Cute kawaii cartoon printed insulated stainless steel tumbler. Keeps drinks hot or cold.', price: 499, salePrice: 349, images: ['/images/products/tumbler-1.jpg'], category: 'water-bottles', tags: ['tumbler', 'steel', 'insulated', 'kawaii'], stock: 60, rating: 4.8, reviewCount: 4, featured: false },
    { name: 'LCD Drawing Tablet 8.5 Inch', slug: 'lcd-drawing-tablet', description: 'Digital slate pad for kids. Draw, write and create. One-button erase. Perfect tech gift!', price: 599, salePrice: 399, images: ['/images/products/lcd-tablet-1.jpg'], category: 'toys-games', tags: ['lcd', 'tablet', 'drawing', 'digital', 'tech'], stock: 70, rating: 4.9, reviewCount: 8, featured: true },
    { name: 'Cute Cartoon Fanny Pack Waist Bag', slug: 'cartoon-fanny-pack', description: 'Trendy lightweight adjustable waist bag with cute cartoon designs. Perfect for outings!', price: 299, salePrice: 199, images: ['/images/products/fanny-pack-1.jpg'], category: 'bags-pouches', tags: ['fanny pack', 'waist bag', 'cartoon', 'trendy'], stock: 120, rating: 4.7, reviewCount: 5, featured: false },
    { name: 'Personalized Pen & Keychain Set', slug: 'pen-keychain-set', description: 'Corporate gift set with personalized metal pen and keychain. Perfect for employees and clients.', price: 399, salePrice: 299, images: ['/images/products/pen-keychain-1.jpg'], category: 'personalization', tags: ['pen', 'keychain', 'corporate', 'personalized', 'gift set'], stock: 200, rating: 4.9, reviewCount: 10, featured: true },
    { name: 'Matchstick Handheld Mini Fan', slug: 'matchstick-mini-fan', description: 'Cute matchstick-shaped USB rechargeable handheld mini fan. Perfect for summer!', price: 249, salePrice: 149, images: ['/images/products/mini-fan-1.jpg'], category: 'return-gifts', tags: ['fan', 'mini', 'usb', 'handheld', 'matchstick'], stock: 150, rating: 4.6, reviewCount: 3, featured: false },
    { name: '3D Unicorn Mechanical Pencil', slug: '3d-unicorn-pencil', description: 'Beautiful 3D unicorn topped mechanical pencil with 0.7mm lead. Kids love these!', price: 49, salePrice: 29, images: ['/images/products/unicorn-pencil-1.jpg'], category: 'stationery', tags: ['pencil', 'unicorn', 'mechanical', '3d'], stock: 500, rating: 4.8, reviewCount: 7, featured: false },
    { name: 'DIY Diamond Crystal Painting Kit', slug: 'diamond-painting-kit', description: 'Create sparkling diamond art! Random designs included. Great for creative kids.', price: 149, salePrice: 99, images: ['/images/products/diamond-painting-1.jpg'], category: 'diy-kits', tags: ['diy', 'diamond', 'painting', 'crystal', 'art'], stock: 100, rating: 5.0, reviewCount: 2, featured: false },
    { name: 'Frog Silicone Night Light Phone Holder', slug: 'frog-night-light', description: '2-in-1 Little Frog Silicone Night Light & Phone Holder. Cute and functional bedside companion.', price: 399, salePrice: 279, images: ['/images/products/frog-light-1.jpg'], category: 'led-lamps', tags: ['night light', 'frog', 'silicone', 'phone holder'], stock: 40, rating: 4.7, reviewCount: 3, featured: false },
  ];
  
  for (const product of products) {
    const prodRef = doc(collection(db, 'products'));
    batch.set(prodRef, { ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  // Settings
  const settingsRef = doc(db, 'settings', 'store');
  batch.set(settingsRef, {
    name: 'CraftsZone',
    tagline: 'Premium Gifts & Personalized Products',
    announcement: '🎉 FREE Shipping on orders above ₹500! | Free Name Customization on all eligible products ✨',
    contactEmail: 'support@craftszone.in',
    contactPhone: '+91 9322990002',
    shippingThreshold: 500,
    whatsappNumber: '+919322990002',
    socialLinks: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      twitter: 'https://twitter.com/',
      youtube: 'https://youtube.com/',
      pinterest: 'https://pinterest.com/'
    }
  });
  
  await batch.commit();
  console.log('Sample data seeded successfully!');
}
