const models = require("../../models");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');


const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'qrcodes')

async function getPackage(req, res) {
  try {
    const products = await models["Package"].findAll();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addPackage(req, res) {
  try {
    const { seller_Id, package_Name, recipient_Name, descrtion } = req.body;

    const newPackage = await models["Package"].create({
      seller_Id,
      package_Name,
      recipient_Name,
      descrtion
    });

  const baseUrl = process.env.APP_URL || 'http://localhost:5173';
  const qrValue = `${baseUrl}/packages/${newPackage.id}`;


    const svgString = await QRCode.toString(qrValue, { type: 'svg', margin: 1 });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const fileName = `qr_product_${newPackage.id}_${Date.now()}.svg`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, svgString, 'utf8');

    const publicPath = `/uploads/qrcodes/${fileName}`;
    await newPackage.update({
      package_QrCodeValue: qrValue,
      package_QrCodePath: publicPath
    });

    res.status(201).json(newPackage);

  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
}


async function deletePackage(req, res) {
  try {
    const { id } = req.body;
    const deleted = await models["Package"].destroy({ where: { id } });
    if (deleted) res.status(200).json({ message: "Package deleted successfully" });
    else res.status(404).json({ message: "Package not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePackage(req, res) {
  try {
    const { id, seller_Id, package_Name, recipient_Name, descrtion } = req.body;
    const package = await models["Package"].findByPk(id);
    if (!package) return res.status(404).json({ message: "Package not found" });

    package.seller_Id = seller_Id;
    package.package_Name = package_Name;
    package.recipient_Name = recipient_Name;
    package.descrtion = descrtion;
    await package.save();

    res.status(200).json({ message: "Package updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function getPackageById(req, res) {
  try {
    const { id } = req.params;
    const package = await models["Package"].findByPk(id);

    if (!package) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.status(200).json(package);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
    getPackage,
    addPackage,
    deletePackage,
    updatePackage,
    getPackageById,
}