const Shop      = require("../models/shop");
const Product   = require("../models/product");
const Order     = require("../models/order");
const OrderItem = require("../models/orderItem");
const Review    = require("../models/review");
const Address   = require("../models/address");
const Payment   = require("../models/payment");
const Customer  = require("../models/customer");
const Invoice   = require("../models/invoice");

/* 🔥 Safe async wrapper */
const safe = (label, fn) =>
  setImmediate(async () => {
    try {
      await fn();
    } catch (e) {
      console.error(`[syncHelpers/${label}]`, e.message);
    }
  });

/* =========================
   SHOP
========================= */
const syncShop = (shop) => {
  if (!shop?.id) return;

  const doc = {
    salesforceId: shop.id,
    name: shop.name,
    category: shop.category,
    city: shop.city,
    address: shop.address,
    phone: shop.phone,
    email: shop.email,
    image: shop.image,
    rating: shop.rating,
    totalReviews: shop.totalReviews,
    isOpen: shop.isOpen,
    openTime: shop.openTime,
    closeTime: shop.closeTime,
    ownerId: shop.ownerId,
  };

  if (shop.lat && shop.lng) {
    doc.location = {
      type: "Point",
      coordinates: [shop.lng, shop.lat],
    };
  }

  safe("syncShop", () =>
    Shop.updateOne({ salesforceId: shop.id }, { $set: doc }, { upsert: true })
  );
};

const deleteShop = (id) => {
  if (!id) return;
  safe("deleteShop", () => Shop.deleteOne({ salesforceId: id }));
};

/* =========================
   PRODUCT
========================= */
const syncProduct = (p, shopId) => {
  if (!p?.id) return;

  safe("syncProduct", () =>
    Product.updateOne(
      { salesforceId: p.id },
      {
        $set: {
          salesforceId: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          isAvailable: p.isAvailable,
          shopId: p.shopId || shopId,
        },
      },
      { upsert: true }
    )
  );
};

const deleteProduct = (id) => {
  if (!id) return;
  safe("deleteProduct", () =>
    Product.deleteOne({ salesforceId: id })
  );
};

/* =========================
   ORDER + ORDER ITEMS
========================= */
const syncOrder = (order, customerId) => {
  if (!order?.id) return;

  safe("syncOrder", () =>
    Order.updateOne(
      { salesforceId: order.id },
      {
        $set: {
          salesforceId: order.id,
          customerId: order.customerId || customerId,
          shopId: order.shopId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount || order.total,

          customerName: order.customerName || "",
          customerEmail: order.customerEmail || "",
          customerPhone: order.customerPhone || "",
          customerAddress: order.customerAddress || order.address || "",

          items: (order.items || []).map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            total: i.subtotal || i.price * i.quantity,
          })),
        },
      },
      { upsert: true }
    )
  );
};

const syncOrderItems = (order) => {
  if (!order?.items || !order?.id) return;

  const valid = order.items.filter((i) => i?.id);
  if (!valid.length) return;

  safe("syncOrderItems", () =>
    OrderItem.bulkWrite(
      valid.map((i) => ({
        updateOne: {
          filter: { salesforceId: i.id },
          update: {
            $set: {
              salesforceId: i.id,
              orderId: order.id,
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
              subtotal: i.subtotal,
              image: i.image,
            },
          },
          upsert: true,
        },
      }))
    )
  );
};

const deleteOrder = (id) => {
  if (!id) return;
  safe("deleteOrder", () => {
    Order.deleteOne({ salesforceId: id });
    OrderItem.deleteMany({ orderId: id }); 
  });
};

/* =========================
   REVIEW
========================= */
const syncReview = (r, shopId) => {
  if (!r?.id) return;

  safe("syncReview", () =>
    Review.updateOne(
      { salesforceId: r.id },
      {
        $set: {
          salesforceId: r.id,
          shopId: r.shopId || shopId,
          review: r.comment || r.review,
          rating: r.rating,
        },
      },
      { upsert: true }
    )
  );
};

const deleteReview = (id) => {
  if (!id) return;
  safe("deleteReview", () =>
    Review.deleteOne({ salesforceId: id })
  );
};

/* =========================
   ADDRESS
========================= */
const syncAddress = (a, customerId) => {
  if (!a?.id) return;

  safe("syncAddress", () =>
    Address.updateOne(
      { salesforceId: a.id },
      {
        $set: {
          salesforceId: a.id,
          customerId: a.customerId || customerId,
          label: a.label,
          name: a.name,
          phone: a.phone,
          line1: a.line1,
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          isDefault: a.isDefault,
        },
      },
      { upsert: true }
    )
  );
};

const deleteAddress = (id) => {
  if (!id) return;
  safe("deleteAddress", () =>
    Address.deleteOne({ salesforceId: id })
  );
};

/* =========================
   PAYMENT
========================= */
const syncPayment = (p, customerId) => {
  if (!p?.paymentId) return;

  safe("syncPayment", () =>
    Payment.updateOne(
      { salesforceId: p.paymentId },
      {
        $set: {
          salesforceId: p.paymentId,
          orderId: p.orderId,
          customerId,
          paymentMethod: p.paymentMethod,
          transactionId: p.transactionId,
          amount: p.amount,
          status: p.status,
          paymentDate: p.paymentDate || p.createdAt,
        },
      },
      { upsert: true }
    )
  );
};

const deletePayment = (id) => {
  if (!id) return;
  safe("deletePayment", () =>
    Payment.deleteOne({ salesforceId: id })
  );
};

/* =========================
   INVOICE
========================= */
const syncInvoice = (i, customerId) => {
  if (!i?.id) return;

  safe("syncInvoice", () =>
    Invoice.updateOne(
      { salesforceId: i.id },
      {
        $set: {
          salesforceId: i.id,
          orderId: i.orderId,
          shopId: i.shopId,
          customerId: i.customerId || customerId,
          invoiceNumber: i.invoiceNumber,
          totalAmount: i.totalAmount,
          taxAmount: i.taxAmount,
          discount: i.discount,
          status: i.status,
          issueDate: i.issueDate,
          dueDate: i.dueDate,
          pdfUrl: i.pdfUrl,
        },
      },
      { upsert: true }
    )
  );
};

const deleteInvoice = (id) => {
  if (!id) return;
  safe("deleteInvoice", () =>
    Invoice.deleteOne({ salesforceId: id })
  );
};

/* =========================
   CUSTOMER
========================= */
const syncCustomer = (sfUser) => {
  const id = sfUser?.Account_ID || sfUser?.Id || sfUser?.id;
  if (!id) return;

  safe("syncCustomer", () =>
    Customer.updateOne(
      { salesforceId: id },
      {
        $set: {
          salesforceId: id,
          name: sfUser.Name || "",
          email: sfUser.Email || "",
          phone: sfUser.Phone || "",
          userType: sfUser.User_Type__c || "",
          isActive: sfUser.Active__c ?? true,
          password: sfUser.Password,
          hashedToken: sfUser.HasedToken__c, 
          tokenExpiry: sfUser.ExpiryAt__c,
        },
      },
      { upsert: true }
    )
  );
};

const deleteCustomer = (id) => {
  if (!id) return;
  safe("deleteCustomer", () =>
    Customer.deleteOne({ salesforceId: id })
  );
};

/* =========================
   LIST HELPERS (WRAPPERS)
========================= */

const syncShopList = (shops = []) => {
  shops.forEach(syncShop);
};

const syncProductList = (products = [], shopId) => {
  products.forEach((p) => syncProduct(p, shopId));
};

const syncReviewList = (reviews = [], shopId) => {
  reviews.forEach((r) => syncReview(r, shopId));
};

const syncAddressList = (addresses = [], customerId) => {
  addresses.forEach((a) => syncAddress(a, customerId));
};

const syncInvoiceList = (invoices = [], customerId) => {
  invoices.forEach((i) => syncInvoice(i, customerId));
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  syncShop, deleteShop,
  syncProduct, deleteProduct,
  syncOrder, syncOrderItems, deleteOrder,
  syncReview, deleteReview,
  syncAddress, deleteAddress,
  syncPayment, deletePayment,
  syncInvoice, deleteInvoice,
  syncCustomer, deleteCustomer,
syncShopList,
syncProductList,
syncReviewList,
syncAddressList,
syncInvoiceList,
};