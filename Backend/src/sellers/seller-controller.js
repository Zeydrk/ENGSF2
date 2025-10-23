const models = require('../../models');

async function getSeller(req, res) {
  try {
    const sellers = await models.Seller.findAll();
    res.status(200).json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function addSeller(req, res) {
  try {
    const { seller_FName, seller_MName, seller_LName, seller_Phone, seller_Email } = req.body;
    const newSeller = await models.Seller.create({
      seller_FName,
      seller_MName,
      seller_LName,
      seller_Phone,
      seller_Email,
    });
    res.status(201).json(newSeller);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteSeller(req, res) {
  try {
    const { id } = req.body;
    const deleted = await models.Seller.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: "Seller not found" });
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function updateSeller(req, res) {
  try {
    const { id, seller_FName, seller_MName, seller_LName, seller_Phone, seller_Email } = req.body;
    if (!id) return res.status(400).json({ message: "Missing seller id" });

    const seller = await models.Seller.findByPk(id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.seller_FName = seller_FName ?? seller.seller_FName;
    seller.seller_MName = seller_MName ?? seller.seller_MName;
    seller.seller_LName = seller_LName ?? seller.seller_LName;
    seller.seller_Phone = seller_Phone ?? seller.seller_Phone;
    seller.seller_Email = seller_Email ?? seller.seller_Email;

    await seller.save();
    res.status(200).json({ message: "Seller updated successfully", seller });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getSeller,
  addSeller,
  deleteSeller,
  updateSeller,
};
