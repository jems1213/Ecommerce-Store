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

// Interceptor: on network error or server 5xx, return mock data for key account endpoints so UI remains usable in previews
const MOCK_ADDRESSES = [
  { _id: 'addr-mock-1', type: 'Home', street: '123 Main St', city: 'Example', state: 'EX', zip: '00000', country: 'USA', phone: '555-0001', isDefault: true }
];

const MOCK_PAYMENTS = [
  { _id: 'pm-mock-1', type: 'Visa', last4: '4242', expiry: '12/25', providerId: '', isDefault: true }
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;

    try {
      const requestUrl = (config.url || '').toString();
      const method = (config.method || '').toLowerCase();

      const shouldFallback = isNetworkError || isServerError;

      if (!shouldFallback) return Promise.reject(error);

      // shoes fallback (existing)
      if (method === 'get' && requestUrl.includes('/api/shoes')) {
        return Promise.resolve({
          data: { status: 'success', data: { shoes: MOCK_SHOES } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      }

      // auth/me fallback: try to use cached user from localStorage if available
      if (method === 'get' && requestUrl.includes('/api/auth/me')) {
        try {
          const cached = typeof window !== 'undefined' && localStorage.getItem('user');
          if (cached) {
            return Promise.resolve({ data: { status: 'success', user: JSON.parse(cached) }, status: 200, config });
          }
        } catch (e) {
          // ignore
        }
      }

      // Orders fallback
      if (method === 'get' && requestUrl.includes('/api/orders')) {
        return Promise.resolve({ data: { status: 'success', data: { orders: [] } }, status: 200, config });
      }

      // Addresses
      if (requestUrl.includes('/api/addresses')) {
        if (method === 'get') {
          return Promise.resolve({ data: { status: 'success', data: { addresses: MOCK_ADDRESSES } }, status: 200, config });
        }
        if (method === 'post') {
          const body = config.data ? JSON.parse(config.data) : {};
          const created = { _id: `addr-local-${Date.now()}`, ...body };
          return Promise.resolve({ data: { status: 'success', data: { address: created } }, status: 201, config });
        }
        if (method === 'put') {
          const body = config.data ? JSON.parse(config.data) : {};
          const id = requestUrl.split('/').pop();
          const updated = { _id: id, ...body };
          return Promise.resolve({ data: { status: 'success', data: { address: updated } }, status: 200, config });
        }
        if (method === 'delete') {
          return Promise.resolve({ data: { status: 'success', message: 'Address removed' }, status: 200, config });
        }
      }

      // Payment methods
      if (requestUrl.includes('/api/payment-methods')) {
        if (method === 'get') {
          return Promise.resolve({ data: { status: 'success', data: { paymentMethods: MOCK_PAYMENTS } }, status: 200, config });
        }
        if (method === 'post') {
          const body = config.data ? JSON.parse(config.data) : {};
          const created = { _id: `pm-local-${Date.now()}`, ...body };
          return Promise.resolve({ data: { status: 'success', data: { paymentMethod: created } }, status: 201, config });
        }
        if (method === 'put') {
          const body = config.data ? JSON.parse(config.data) : {};
          const id = requestUrl.split('/').pop();
          const updated = { _id: id, ...body };
          return Promise.resolve({ data: { status: 'success', data: { paymentMethod: updated } }, status: 200, config });
        }
        if (method === 'delete') {
          return Promise.resolve({ data: { status: 'success', message: 'Payment removed' }, status: 200, config });
        }
      }
    } catch (e) {
      // fall through
    }

    return Promise.reject(error);
  }
);

export default api;
