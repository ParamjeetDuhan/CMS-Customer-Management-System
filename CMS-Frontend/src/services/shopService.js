import api from './api';

const shopService = {
  /** Get nearby shops by coordinates */
  getNearbyShops: async ({ lat, lng, category, sort, q }) => {
    if (!lat || !lng) throw new Error('lat and lng are required');
    const params = { lat, lng };
    if (category && category !== 'All') params.category = category;
    if (sort) params.sort = sort;
    if (q)    params.q   = q;
    const res = await api.get('/shops/nearby', { params });
    return res.data;
  },

  /** Get all shops */
  getAllShops: async (params) => {
    const res = await api.get('/shops', { params });
    return res.data;
  },

  /** Get single shop details */
  getShopById: async (id) => {
    if (!id) return null;
    const res = await api.get(`/shops/${id}`);
    return res.data;
  },

  /** Get products of a shop */
  getShopProducts: async (shopId, params = {}) => {
    if (!shopId) return { products: [], total: 0 };
    const res = await api.get(`/shops/${shopId}/products`, { params });
    return res.data;
  },

  /** Get single product */
  getProductById: async (productId) => {
    if (!productId) return null;
    const res = await api.get(`/products/${productId}`);
    return res.data;
  },

  /** Get shop reviews */
  getShopReviews: async (shopId) => {
    if (!shopId) return { reviews: [], total: 0 };
    const res = await api.get(`/shops/${shopId}/reviews`);
    return res.data;
  },

  /** Submit shop review */
  submitReview: async (shopId, data) => {
    if (!shopId) throw new Error('shopId is required');
    const res = await api.post(`/shops/${shopId}/reviews`, data);
    return res.data;
  },
};

export default shopService;
