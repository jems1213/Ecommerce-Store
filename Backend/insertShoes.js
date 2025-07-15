require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shoe_shop')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Shoe Model
const shoeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: Number }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Shoe = mongoose.model('Shoe', shoeSchema);

// Sample shoe data
const allShoes = [
  {
    
    name: 'Nike Air Max 270',
    brand: 'nike',
    price: 149.99,
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-mens-shoes-KkLcGR.png',
      'https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/27969006/2024/3/1/e0a00afc-2882-42f3-8c9a-922b62d914371709291687996NikeAirMax270MensShoes2.jpg',
      'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/271c303e-6efd-4444-bd74-a881adfe5d6f/W+AIR+MAX+270.png'
    ],
    colors: ['#ff0000', '#000000', '#ffffff'],
    rating: 4.5,
    discount: 10,
    sizes: [8, 9, 10, 11],
    stock: 15,
    isNew: true,
    featured: true,
    description: 'The Nike Air Max 270 delivers the brand\'s biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.'
  },
  {
    
    name: 'Adidas Ultraboost 21',
    brand: 'adidas',
    price: 179.99,
    images: [
      'https://therunningoutlet.co.uk/wp-content/uploads/2021/09/adidas-Mens-ultra-boost-S23873-side.jpg',
      'https://sneakernews.com/wp-content/uploads/2021/01/adidas-ultraboost-21-cloud-white-FY0846-1.jpg?w=1140',
      'https://houseofheat.co/app/uploads/2020/12/adidas-ultra-boost-21-official-images-FY0389.jpg'
    ],
    colors: ['#0000ff', '#000000', '#ffffff'],
    rating: 4.8,
    sizes: [7, 8, 9, 10, 11],
    stock: 8,
    featured: true,
    description: 'Ultraboost 21 running shoes combine responsive cushioning with a foot-hugging knit upper for incredible energy return.'
  },
  {
    
    name: 'Reebok Classic Leather',
    brand: 'reebok',
    price: 89.99,
    images: [
      'https://www.sportsdirect.com/images/imgzoom/12/12405101_xxl.jpg',
      'https://data.sneakers76.com/images/galleries/6315/GW4728_1_FOOTWEAR_Photography_Side-Lateral-Center-View_white.jpg'
    ],
    colors: ['#ffffff', '#000000'],
    rating: 4.2,
    sizes: [7, 8, 9, 10],
    stock: 0,
    featured: false,
    description: 'The Reebok Classic Leather sneaker delivers timeless style with a soft leather upper and cushioned midsole.'
  },
  {
    
    name: 'Puma RS-X Reinvention',
    brand: 'puma',
    price: 109.99,
    images: [
      'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376540/01/sv01/fnd/EEA/',
      'https://cdn-img.poizonapp.com/pro-img/cut-img/20220212/0fbebe876176436d85f9c7dfbd09787a.jpg?x-oss-process=image/format,webp/resize,w_800,h_800',
      'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376540/02/sv01/fnd/EEA/'
    ],
    colors: ['#ff0000', '#0000ff', '#808080'],
    rating: 4.3,
    discount: 15,
    sizes: [8, 9, 10, 11, 12],
    stock: 5,
    isNew: true,
    featured: true,
    description: 'The PUMA RS-X Reinvention features a chunky silhouette with bold colors and a cushioned sole for maximum comfort.'
  },
  {
   
    name: 'Nike React Infinity Run',
    brand: 'nike',
    price: 159.99,
    images: [
      'https://sneakernews.com/wp-content/uploads/2023/05/DR2665-003.jpg',
      'https://sneakernews.com/wp-content/uploads/2023/05/nike-react-infinity-run-4-DR2670-102.jpg'
    ],
    colors: ['#00ff00', '#000000'],
    rating: 4.7,
    sizes: [8, 9, 10, 11],
    stock: 12,
    featured: true,
    description: 'The Nike React Infinity Run Flyknit 2 is designed to help reduce injury and keep you running with a smooth, responsive ride.'
  },
   {
   
    name: "Nike Air Jordan 1 Retro High",
    brand: "nike",
    price: 180.00,
    originalPrice: 200.00,
    discount: 10,
    isNew: true,
    images: [
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-jordan-1-retro-high-og-shoes.png",
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/2f548a5e-7383-476e-8d1a-9254a8ae8d5e/air-jordan-1-retro-high-og-shoes-side.png"
    ],
    colors: ["#000000", "#e74c3c"],
    sizes: [8, 9, 10, 11, 12],
    rating: 4.8,
    stock: 15,
    featured: true,
    description: "The Air Jordan 1 Retro High OG stays true to the original 1985 design with premium leather and classic color blocking."
  },
  {
    
    name: "Adidas Ultraboost Light",
    brand: "adidas",
    price: 190.00,
    originalPrice: 220.00,
    discount: 14,
    isNew: true,
    images: [
      "https://justfreshkicks.com/wp-content/uploads/2023/02/adidas-Ultra-Boost-Light-Core-Black-HQ6339-Release-Date.jpeg",
      "https://footwearnews.com/wp-content/uploads/2023/02/Ultraboost_Light_Running_Shoes_White_HQ6351_01_standard-e1677164948948.jpg?resize=150"
    ],
    colors: ["#000000", "#ffffff"],
    sizes: [7, 8, 9, 10, 11, 12],
    rating: 4.7,
    stock: 22,
    featured: true,
    description: "The lightest Ultraboost ever delivers incredible energy return with a responsive cushioning system."
  },
  {
   
    name: "Puma RS-X Reinvention",
    brand: "puma",
    price: 110.00,
    originalPrice: 130.00,
    discount: 15,
    isNew: false,
    images: [
      "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376540/01/sv01/fnd/EEA/",
      "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376540/02/sv01/fnd/EEA/"
    ],
    colors: ["#ff0000", "#0000ff", "#808080"],
    sizes: [8, 9, 10, 11, 12],
    rating: 4.3,
    stock: 8,
    featured: true,
    description: "Bold colors and chunky silhouette with cushioned sole for maximum comfort and street-ready style."
  },
  {
    
    name: "New Balance 574 Core",
    brand: "new balance",
    price: 89.99,
    originalPrice: 89.99,
    discount: 0,
    isNew: false,
    images: [
      "https://www.aperfectdealer.com/10213-large_default/new-balance-574-core-grey-wl574evg.jpg",
      "https://cdna.lystit.com/photos/newbalance/ML574-CL-Red%20with%20White-18bcff3e-.jpeg"
    ],
    colors: ["#7f8c8d", "#e74c3c"],
    sizes: [7, 8, 9, 10, 11],
    rating: 4.5,
    stock: 30,
    featured: false,
    description: "Classic heritage style meets modern comfort in this iconic sneaker with ENCAP cushioning technology."
  },
  {
   
    name: "Converse Chuck Taylor All Star Lift",
    brand: "converse",
    price: 75.00,
    originalPrice: 80.00,
    discount: 6,
    isNew: true,
    images: [
      "https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw7633901e/images/a_107/A04689C_A_107X1.jpg",
      "https://cdn.evrysz.net/1000x1000/3/converse-chuck-taylor-all-star-lift-a03721c.png"
    ],
    colors: ["#ffffff", "#000000"],
    sizes: [6, 7, 8, 9, 10, 11],
    rating: 4.2,
    stock: 18,
    featured: true,
    description: "Elevated platform version of the classic Chuck Taylor with added cushioning and a bold new look."
  },
  {
   
    name: "Vans Old Skool Pro",
    brand: "vans",
    price: 85.00,
    originalPrice: 85.00,
    discount: 0,
    isNew: false,
    images: [
      "https://static.consortium.co.uk/media/catalog/product/cache/1/image/040ec09b1e35df139433887a97daa66f/v/a/vans-old-skool-pro-black-white-cat_1.jpg",
      "https://www.attitudeinc.co.uk/Content/ProductImages/VANS-OLD-SKOOL-PRO-50th-white-1_600x600.jpg"
    ],
    colors: ["#000000", "#ffffff"],
    sizes: [7, 8, 9, 10, 11],
    rating: 4.6,
    stock: 12,
    featured: false,
    description: "The iconic skate shoe with durable suede and canvas uppers and responsive cushioning."
  },
  {
    
    name: "ASICS Gel-Kayano 30",
    brand: "asics",
    price: 160.00,
    originalPrice: 180.00,
    discount: 11,
    isNew: true,
    images: [
      "https://images.asics.com/is/image/asics/1011B548_400_SR_RT_GLB?$zoom$",
      "https://images.asics.com/is/image/asics/1011B548_400_SR_LT_GLB?$zoom$"
    ],
    colors: ["#1f3a93", "#7ed6df"],
    sizes: [7, 8, 9, 10, 11],
    rating: 4.9,
    stock: 7,
    featured: true,
    description: "Premium stability running shoes with FF BLAST™ PLUS cushioning and 4D GUIDANCE SYSTEM."
  },
  {
    
    name: "Reebok Club C 85 Vintage",
    brand: "reebok",
    price: 90.00,
    originalPrice: 100.00,
    discount: 10,
    isNew: false,
    images: [
      "https://images.footlocker.com/is/image/EBFL2/DV6434",
      "https://static.ftshp.digital/img/p/9/1/1/3/6/8/911368.jpg"
    ],
    colors: ["#ffffff", "#95a5a6"],
    sizes: [7, 8, 9, 10, 11],
    rating: 4.4,
    stock: 14,
    featured: false,
    description: "Classic tennis-inspired sneakers with premium leather uppers and vintage detailing."
  },
  {
   
    name: "Nike React Infinity Run Flyknit 3",
    brand: "nike",
    price: 160.00,
    originalPrice: 160.00,
    discount: 0,
    isNew: true,
    images: [
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/react-infinity-run-flyknit-3-road-running-shoes.png",
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/2f548a5e-7383-476e-8d1a-9254a8ae8d5e/react-infinity-run-flyknit-3-road-running-shoes-side.png"
    ],
    colors: ["#00ffcc", "#333333"],
    sizes: [8, 9, 10, 11],
    rating: 4.7,
    stock: 9,
    featured: true,
    description: "Designed to help reduce injury and keep you running with a smooth, responsive ride and secure fit."
  },
  {
    
    name: "Hoka Bondi 8",
    brand: "hoka",
    price: 165.00,
    originalPrice: 165.00,
    discount: 0,
    isNew: true,
    images: [
      "https://cl.hoka.com/wp-content/uploads/2023/05/HK1127952BWHT_1.jpg",
      "https://s3-eu-west-1.amazonaws.com/peteblandsports/i/pzi/m_bondi_8_rhd_1.jpg?_t=241111115"
    ],
    colors: ["#000000", "#3498db"],
    sizes: [7, 8, 9, 10, 11, 12],
    rating: 4.8,
    stock: 11,
    featured: true,
    description: "Maximum cushioning meets premium comfort in this plush running shoe with meta-rocker technology."
  }
];

// Function to insert shoes
async function insertShoes() {
  try {
    // First, clear existing shoes (optional)
    await Shoe.deleteMany({});
    console.log('Cleared existing shoes');
    
    // Insert new shoes
    const insertedShoes = await Shoe.insertMany(allShoes.map(shoe => {
      // Remove the id field since MongoDB will create its own _id
      const { id, ...shoeData } = shoe;
      return shoeData;
    }));
    
    console.log(`Successfully inserted ${insertedShoes.length} shoes`);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting shoes:', error);
    process.exit(1);
  }
}

// Run the insertion
insertShoes();