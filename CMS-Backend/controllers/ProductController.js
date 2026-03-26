const { GetProduct } = require('../Services/GetProductByShopid');

const Products = async (req, res) => {
    try {
        const { Shopid, price, category, minPrice, search } = req.query;

        // Get all products (from Redis or Salesforce)
        const products = await GetProduct(Shopid);

        //  Apply filters HERE
        let filtered = products;

        if (price) {
            filtered = filtered.filter(p => p.price <= Number(price));
        }

        if (minPrice) {
            filtered = filtered.filter(p => p.price >= Number(minPrice));
        }

        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        if (search) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return res.status(200).json({
            total: products.length,
            filtered: filtered.length,
            data: filtered
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = { Products };