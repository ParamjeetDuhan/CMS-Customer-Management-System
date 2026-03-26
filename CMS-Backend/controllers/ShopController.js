const { GetShopes } = require("../Services/SalesforceNearByShopes");

const Shop = async (req, res) => {
    try {
        const result = await GetShopes(req.query);

        return res.status(200).json({
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = { Shop };