import api from './api';

const shopService = {
  /** Get nearby shops by coordinates */
  getNearbyShops: async ({ lat, lng, category, sort ,q}) => {
    const params = { lat, lng,};
    if (category && category !== 'All') params.category = category;
    if (sort) params.sort = sort;
    if(q) params.q = q;
    const res = await api.get('/shops/nearby', { params });
    return res.data;
  },

  /** Get all shops (fallback) */
  getAllShops: async (params) => {
    const res = await api.get('/shops', { params });
    return res.data;
  },

  /** Get single shop details */
  getShopById: async (id) => {
    const res = await api.get(`/shops/${id}`);
    return res.data;
  },

  /** Search shops */
  searchShops: async (query) => {
    const res = await api.get('/shops/search', { params: { q: query } });
    return res.data;
  },

  /** Get products of a shop */
  getShopProducts: async (shopId, params = {}) => {
    const res = await api.get(`/shops/${shopId}/products`, { params });
    return res.data;
    
  },

  /** Get single product */
  getProductById: async (productId) => {
    const res = await api.get(`/products/${productId}`);
    return res.data;
  },

  /** Search products in a shop */
  searchProducts: async (shopId, query) => {
    const res = await api.get(`/shops/${shopId}/products/search`, { params: { q: query } });
    return res.data;
  },

  /** Get product categories for a shop */
  getProductCategories: async (shopId) => {
    const res = await api.get(`/shops/${shopId}/categories`);
    return res.data;
  },

  /** Get shop reviews */
  getShopReviews: async (shopId) => {
    const res = await api.get(`/shops/${shopId}/reviews`);
    return res.data;
  },

  /** Submit shop review */
  submitReview: async (shopId, data) => {
    const res = await api.post(`/shops/${shopId}/reviews`, data);
    return res.data;
  },
};

export default shopService;
