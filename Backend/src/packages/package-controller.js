const models = require("../../models");
const { sequelize } = require("../../models"); 
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'qrcodes')


function getSellerFullName(seller) {
  if (!seller) return '';
  
  // Trim each name individually and filter out empty strings
  const fName = (seller.seller_FName || '').trim();
  const mName = (seller.seller_MName || '').trim();
  const lName = (seller.seller_LName || '').trim();
  
  // Join with spaces and trim the final result
  const fullName = [fName, mName, lName].filter(name => name.length > 0).join(' ');
  
  return fullName.trim();
}

async function getPackage(req, res) {
  try {
    const packages = await models["Package"].findAll({
      include: [{
        model: models.Seller,
        attributes: ['seller_FName', 'seller_MName', 'seller_LName']
      }]
    });

   
    const packagesWithSellerName = packages.map(pkg => ({
      ...pkg.toJSON(),
      seller_Name: getSellerFullName(pkg.Seller)
    }));

    res.status(200).json(packagesWithSellerName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addPackage(req, res) {
  try {
    const { seller_Name, package_Name, recipient_Name, descrtion } = req.body;

   
    const seller = await models["Seller"].findOne({
      where: {
        [Op.or]: [
          { seller_FName: { [Op.like]: `%${seller_Name}%` } },
          { seller_LName: { [Op.like]: `%${seller_Name}%` } },
          { seller_MName: { [Op.like]: `%${seller_Name}%` } }
        ]
      }
    });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const newPackage = await models["Package"].create({
      seller_Id: seller.id, 
      package_Name,
      recipient_Name,
      descrtion
    });

    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
    const qrValue = `${baseUrl}/packages/${newPackage.id}`;

    const svgString = await QRCode.toString(qrValue, { type: 'svg', margin: 1 });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const fileName = `qr_package_${newPackage.id}_${Date.now()}.svg`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, svgString, 'utf8');

    const publicPath = `/uploads/qrcodes/${fileName}`;
    await newPackage.update({
      package_QrCodeValue: qrValue,
      package_QrCodePath: publicPath
    });

    const createdPackage = await models["Package"].findByPk(newPackage.id, {
      include: [{
        model: models.Seller,
        attributes: ['seller_FName', 'seller_MName', 'seller_LName']
      }]
    });

    res.status(201).json({
      ...createdPackage.toJSON(),
      seller_Name: getSellerFullName(createdPackage.Seller)
    });

  } catch (err) {
    console.error("Error creating package:", err);
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
    const { id, seller_Name, package_Name, recipient_Name, descrtion } = req.body;
    const package = await models["Package"].findByPk(id);
    if (!package) return res.status(404).json({ message: "Package not found" });


    if (seller_Name) {
      const seller = await models["Seller"].findOne({
        where: {
          [Op.or]: [
            { seller_FName: { [Op.like]: `%${seller_Name}%` } },
            { seller_LName: { [Op.like]: `%${seller_Name}%` } },
            { seller_MName: { [Op.like]: `%${seller_Name}%` } }
          ]
        }
      });

      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }
      package.seller_Id = seller.id;
    }

    package.package_Name = package_Name;
    package.recipient_Name = recipient_Name;
    package.descrtion = descrtion;
    await package.save();

 
    const updatedPackage = await models["Package"].findByPk(id, {
      include: [{
        model: models.Seller,
        attributes: ['seller_FName', 'seller_MName', 'seller_LName']
      }]
    });

    res.status(200).json({ 
      message: "Package updated successfully", 
      package: {
        ...updatedPackage.toJSON(),
        seller_Name: getSellerFullName(updatedPackage.Seller)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPackageById(req, res) {
  try {
    const { id } = req.params;
    const package = await models["Package"].findByPk(id, {
      include: [{
        model: models.Seller,
        attributes: ['seller_FName', 'seller_MName', 'seller_LName']
      }]
    });

    if (!package) {
      return res.status(404).json({ error: "Package not found" });
    }

    const packageWithSellerName = {
      ...package.toJSON(),
      seller_Name: getSellerFullName(package.Seller)
    };

    res.status(200).json(packageWithSellerName);
  } catch (err) {
    console.error("Error fetching package:", err);
    res.status(500).json({ error: err.message });
  }
}


async function getSellers(req, res) {
  try {
    const sellers = await models["Seller"].findAll({
      attributes: ['id', 'seller_FName', 'seller_MName', 'seller_LName']
    });
    
    const sellersWithFullName = sellers.map(seller => ({
      ...seller.toJSON(),
      seller_Name: getSellerFullName(seller)
    }));
    
    res.status(200).json(sellersWithFullName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
    getPackage,
    addPackage,
    deletePackage,
    updatePackage,
    getPackageById,
    getSellers 
}