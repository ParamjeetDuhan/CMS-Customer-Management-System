import api from './api';

const orderService = {
  /** Place a new order */
  placeOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  /** Get customer's order history */
  getMyOrders: async (params = {}) => {
    const res = await api.get('/orders/my', { params });
    return res.data;
  },

  /** Get single order details */
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  /** Cancel order */
  cancelOrder: async (id, reason) => {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  /** Reorder (duplicate previous order) */
  reorder: async (id) => {
    const res = await api.post(`/orders/${id}/reorder`);
    return res.data;
  },

  /** Initiate payment */
  initiatePayment: async (orderId, paymentData) => {
    const res = await api.post(`/payments/initiate`, { orderId, ...paymentData });
    return res.data;
  },

  /** Verify / confirm payment */
  verifyPayment: async (paymentData) => {
    const res = await api.post('/payments/verify', paymentData);
    return res.data;
  },

  /** Get payment status */
  getPaymentStatus: async (orderId) => {
    const res = await api.get(`/payments/status/${orderId}`);
    return res.data;
  },

  /** Submit feedback for a completed order */
  submitFeedback: async (orderId, feedbackData) => {
    const res = await api.post(`/orders/${orderId}/feedback`, feedbackData);
    return res.data;
  },

  /** Get order tracking info */
  trackOrder: async (id) => {
    const res = await api.get(`/orders/${id}/track`);
    return res.data;
  },
};

export default orderService;
