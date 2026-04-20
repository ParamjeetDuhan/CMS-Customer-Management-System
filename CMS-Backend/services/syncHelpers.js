const Shop      = require("../models/shop");
const Product   = require("../models/product");
const Order     = require("../models/order");
const OrderItem = require("../models/orderItem");
const Review    = require("../models/review");
const Address   = require("../models/address");
const Payment   = require("../models/payment");
const Customer  = require("../models/customer");
const Invoice   = require("../models/invoice");

/* =========================
   SHOP
========================= */
const syncShop = async (shop) => {
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

  await Shop.updateOne(
    { salesforceId: shop.id },
    { $set: doc },
    { upsert: true }
  );
};

const deleteShop = async (id) => {
  if (!id) return;
  await Shop.deleteOne({ salesforceId: id });
};

/* =========================
   PRODUCT
========================= */
const syncProduct = async (p) => {
  if (!p?.id) return;

  await Product.updateOne(
    { salesforceId: p.id },
    {
      $set: {
        salesforceId: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        isAvailable: p.isAvailable,
        shopId: p.shopId,
      },
    },
    { upsert: true }
  );
};

const deleteProduct = async (id) => {
  if (!id) return;
  await Product.deleteOne({ salesforceId: id });
};

/* =========================
   ORDER + ORDER ITEMS
========================= */
const syncOrder = async (order, customerId) => {
  if (!order?.id) return;

  await Order.updateOne(
    { salesforceId: order.id },
    {
      $set: {
        salesforceId: order.id,
        customerId: order.customerId || customerId,
        shopId: order.shopId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount || order.total,
        customerAddress: order.address || "",
        customerName: order.customerName ||"",
        customerEmail: order.customerEmail || "",
        customerPhone: order.customerPhone || ""
      },
    },
    { upsert: true }
  );
};

const syncOrderItems = async (order) => {
  if (!order?.items || !order?.id) return;

  const valid = order.items.filter((i) => i?.id);

  if (!valid.length) return;

  await OrderItem.bulkWrite(
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
            unitPrice: i.price,
            subtotal: i.subtotal,
            image: i.image,
          },
        },
        upsert: true,
      },
    }))
  );
};

const deleteOrder = async (id) => {
  if (!id) return;

  await Order.deleteOne({ salesforceId: id });
  await OrderItem.deleteMany({ orderId: id });
};

/* =========================
   REVIEW
========================= */
const syncReview = async (r) => {
  if (!r?.id) return;

  await Review.updateOne(
    { salesforceId: r.id },
    {
      $set: {
        salesforceId: r.id,
        shopId: r.shopId,
        review: r.comment,
        rating: r.rating,
      },
    },
    { upsert: true }
  );
};

const deleteReview = async (id) => {
  if (!id) return;
  await Review.deleteOne({ salesforceId: id });
};

/* =========================
   ADDRESS
========================= */
const syncAddress = async (a, customerId) => {
  if (!a?.id) return;

  await Address.updateOne(
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
  );
};

const deleteAddress = async (id) => {
  if (!id) return;
  await Address.deleteOne({ salesforceId: id });
};

/* =========================
   PAYMENT
========================= */
const syncPayment = async (p, customerId) => {
  if (!p?.paymentId) return;

  await Payment.updateOne(
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
        paymentDate: p.createdAt,
      },
    },
    { upsert: true }
  );
};

const deletePayment = async (id) => {
  if (!id) return;
  await Payment.deleteOne({ salesforceId: id });
};

/* =========================
   INVOICE
========================= */
const syncInvoice = async (i, customerId) => {
  if (!i?.id) return;

  await Invoice.updateOne(
    { salesforceId: i.id },
    {
      $set: {
        salesforceId: i.id,
        orderId: i.orderId,
        shopId: i.shopId,
        customerId: i.customerId || customerId,
        invoiceNumber: i.invoiceNumber,
        totalAmount: i.totalAmount,
        status: i.status,
      },
    },
    { upsert: true }
  );
};

const deleteInvoice = async (id) => {
  if (!id) return;
  await Invoice.deleteOne({ salesforceId: id });
};

/* =========================
   CUSTOMER
========================= */
const syncCustomer = async (sfUser) => {
  try {
    const id = sfUser?.Id;
    if (!id) return;

    await Customer.updateOne(
      { salesforceId: id },
      {
        $set: {
          salesforceId: id,
          name: sfUser.Name,
          email: sfUser.Email,
          phone: sfUser.Phone,
          userType: sfUser.User_Type__c,
          isActive: sfUser.Active__c === "Yes",
          password: sfUser.Password,
          hashedToken: sfUser.HasedToken__c,
          tokenExpiry: sfUser.ExpiryAt__c,
        },
      },
      { upsert: true }
    );

  } catch (err) {
    console.error("syncCustomer error:", err);
  }
};

const deleteCustomer = async (id) => {
  if (!id) return;
  await Customer.deleteOne({ salesforceId: id });
};


/* for list data */

const syncShopList = async (shops = []) => {
  for (const shop of shops) {
    try {
      await syncShop(shop);
    } catch (err) {
      console.error("syncShopList error:", err);
    }
  }
};

const syncProductList = async (products = []) => {
  for (const p of products) {
    try {
      await syncProduct(p);
    } catch (err) {
      console.error("syncProductList error:", err);
    }
  }
};

const syncReviewList = async (reviews = []) => {
  for (const r of reviews) {
    try {
      await syncReview(r);
    } catch (err) {
      console.error("syncReviewList error:", err);
    }
  }
};

const syncAddressList = async (addresses = [], customerId) => {
  for (const a of addresses) {
    try {
      await syncAddress(a, customerId);
    } catch (err) {
      console.error("syncAddressList error:", err);
    }
  }
};

const syncInvoiceList = async (invoices = [], customerId) => {
  for (const i of invoices) {
    try {
      await syncInvoice(i, customerId);
    } catch (err) {
      console.error("syncInvoiceList error:", err);
    }
  }
};

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