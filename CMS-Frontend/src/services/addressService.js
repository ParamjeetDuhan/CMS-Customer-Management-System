import api from './api';

const addressService = {
  /** Fetch all saved addresses for logged-in user */
  getAddresses: async () => {
    const res = await api.get('/addresses');
    return res.data;                       // { addresses: [...] }
  },

  /** Create a new address */
  createAddress: async (data) => {
    const res = await api.post('/addresses', data);
    return res.data;                       // { address: {...} }
  },

  /** Update an existing address */
  updateAddress: async (id, data) => {
    const res = await api.put(`/addresses/${id}`, data);
    return res.data;
  },

  /** Delete an address */
  deleteAddress: async (id) => {
    const res = await api.delete(`/addresses/${id}`);
    return res.data;
  },

  /** Set an address as default */
  setDefault: async (id) => {
    const res = await api.put(`/addresses/${id}/default`);
    return res.data;
  },
};

export default addressService;