const models = require('../../models');

async function getSeller(req, res) {
    try {
        const sellers = await models['Seller'].findAll();
        res.status(200).json(sellers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addSeller(req, res) {
    try {
        const { seller_Name, seller_Phone, seller_Email } = req.body;

        const newSeller = await models['Seller'].create({
            seller_Name,
            seller_Phone,
            seller_Email,
            balance: 0
        });

        res.status(201).json(newSeller);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteSeller(req, res) {
    try {
        const { id } = req.body;
        const deleted = await models['Seller'].destroy({ where: { id } });

        if (!deleted) return res.status(404).json({ message: "Seller not found" });

        res.status(200).json({ message: "Seller deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateSeller(req, res) {
    try {
        const { id, seller_Name, seller_Phone, seller_Email } = req.body;

        const seller = await models['Seller'].findByPk(id);
        if (!seller) return res.status(404).json({ message: "Seller not found" });

        seller.seller_Name = seller_Name ?? seller.seller_Name;
        seller.seller_Phone = seller_Phone ?? seller.seller_Phone;
        seller.seller_Email = seller_Email ?? seller.seller_Email;

        await seller.save();

        res.status(200).json({ message: "Seller updated successfully", seller });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function claimSeller(req, res) {
    try {
        const { id } = req.body;

        // Find seller
        const seller = await models['Seller'].findByPk(id);
        if (!seller) return res.status(404).json({ message: "Seller not found" });

        // Delete claimed packages for this seller
        const deletedPackages = await models['Package'].destroy({
            where: {
                seller_Id: id,
                package_Status: 'claimed'
            }
        });

        // RESET BALANCE
        seller.balance = 0;
        await seller.save();

        // Return updated sellers
        const sellers = await models['Seller'].findAll();

        res.status(200).json({
            message: "Claim processed successfully",
            deletedPackages: deletedPackages,
            sellers
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getSeller, addSeller, deleteSeller, updateSeller, claimSeller };