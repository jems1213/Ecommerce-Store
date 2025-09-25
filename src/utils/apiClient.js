import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '';

// If VITE_API_URL points to localhost but the app is running on a remote host (preview/deploy),
// fall back to same-origin so requests go to the frontend host (which may proxy to backend).
function computeBase() {
  if (!API_BASE) return window.location.origin;
  try {
    const url = new URL(API_BASE);
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const runningLocally = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && !runningLocally) {
      // running on a remote preview — avoid calling localhost from the browser
      return window.location.origin;
    }
    return API_BASE;
  } catch (e) {
    return API_BASE || window.location.origin;
  }
}

const base = computeBase();
const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' }
});

// Lightweight mock fallback for network failures when fetching shoes
const MOCK_SHOES = [
  {
    _id: 'mock1',
    name: 'AirFlex Runner',
    brand: 'nike',
    price: 129.99,
    description: 'Comfortable everyday running shoe',
    images: ['https://via.placeholder.com/300x300.png?text=AirFlex+Runner'],
    colors: ['black', 'white'],
    sizes: [7,8,9,10,11],
    rating: 4.5,
    discount: 10,
    stock: 20,
    isNew: true,
    isNewArrival: true,
    featured: true
  },
  {
    _id: 'mock2',
    name: 'Street Classic',
    brand: 'adidas',
    price: 89.99,
    description: 'Casual sneaker with retro vibes',
    images: ['https://via.placeholder.com/300x300.png?text=Street+Classic'],
    colors: ['navy', 'red'],
    sizes: [6,7,8,9,10],
    rating: 4.2,
    discount: 5,
    stock: 15,
    isNew: false,
    isNewArrival: false,
    featured: true
  }
];

// Interceptor: on network error or server 5xx, return mock shoes for GET /api/shoes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;

    try {
      const requestUrl = (config.url || '').toString();
      const isGetShoes = config.method === 'get' && requestUrl.includes('/api/shoes');

      if (isGetShoes && (isNetworkError || isServerError)) {
        // return a successful-like response with mock data so UI can continue to function
        return Promise.resolve({
          data: {
            status: 'success',
            data: { shoes: MOCK_SHOES }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      }
    } catch (e) {
      // fall through to reject
    }

    return Promise.reject(error);
  }
);

export default api;
