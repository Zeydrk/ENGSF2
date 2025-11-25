const models = require("../../models");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'qrcodes');

async function getPackage(req, res) {
    try {
        const packages = await models.Package.findAll({
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        const formatted = packages.map(pkg => ({
            ...pkg.toJSON(),
            seller_Name: pkg.Seller?.seller_Name || ""
        }));

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addPackage(req, res) {
    try {
        const {
            seller_Name,
            package_Name,
            buyer_Name,
            dropOff_Date,
            package_Size,
            price,
            handling_Fee,
            payment_Status,
            payment_Method,
            package_Status
        } = req.body;

        const seller = await models.Seller.findOne({ where: { seller_Name } });
        if (!seller) return res.status(404).json({ error: "Seller not found" });

        // Create Package
        const newPackage = await models.Package.create({
            seller_Id: seller.id,
            package_Name,
            buyer_Name,
            dropOff_Date,
            package_Size,
            price,
            handling_Fee,
            payment_Status,
            payment_Method,
            package_Status
        });

        // UPDATE SELLER BALANCE
        seller.balance = parseFloat(seller.balance) + parseFloat(price);
        await seller.save();

        // Generate QR
        const baseUrl = process.env.APP_URL || 'http://localhost:5173';
        const qrValue = `${baseUrl}/packages/${newPackage.id}`;
        const svgString = await QRCode.toString(qrValue, { type: 'svg', margin: 1 });

        fs.mkdirSync(UPLOAD_DIR, { recursive: true });

        const fileName = `qr_package_${newPackage.id}_${Date.now()}.svg`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, svgString, 'utf8');

        await newPackage.update({
            package_QrCodeValue: qrValue,
            package_QrCodePath: `/uploads/qrcodes/${fileName}`
        });

        // Return full package data
        const fullPackage = await models.Package.findByPk(newPackage.id, {
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        res.status(201).json(fullPackage);

    } catch (err) {
        console.error("ADD PACKAGE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}

async function deletePackage(req, res) {
    try {
        const { id } = req.body;
        const deleted = await models.Package.destroy({ where: { id } });

        if (!deleted) return res.status(404).json({ message: "Package not found" });

        res.status(200).json({ message: "Package deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updatePackage(req, res) {
    try {
        const {
            id,
            seller_Name,
            package_Name,
            buyer_Name,
            dropOff_Date,
            package_Size,
            price,
            handling_Fee,
            payment_Status,
            payment_Method,
            package_Status
        } = req.body;

        const pkg = await models.Package.findByPk(id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });

        if (seller_Name) {
            const seller = await models.Seller.findOne({ where: { seller_Name } });
            if (!seller) return res.status(404).json({ message: "Seller not found" });

            pkg.seller_Id = seller.id;
        }

        pkg.package_Name = package_Name ?? pkg.package_Name;
        pkg.buyer_Name = buyer_Name ?? pkg.buyer_Name;
        pkg.dropOff_Date = dropOff_Date ?? pkg.dropOff_Date;
        pkg.package_Size = package_Size ?? pkg.package_Size;
        pkg.price = price ?? pkg.price;
        pkg.handling_Fee = handling_Fee ?? pkg.handling_Fee;
        pkg.payment_Status = payment_Status ?? pkg.payment_Status;
        pkg.payment_Method = payment_Method ?? pkg.payment_Method;
        pkg.package_Status = package_Status ?? pkg.package_Status;

        await pkg.save();

        const updated = await models.Package.findByPk(id, {
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        res.status(200).json({ message: "Package updated successfully", package: updated });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getPackageById(req, res) {
    try {
        const { id } = req.params;

        const packageData = await models.Package.findByPk(id, {
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        if (!packageData) return res.status(404).json({ error: "Not found" });

        res.status(200).json(packageData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getSellers(req, res) {
    try {
        const sellers = await models.Seller.findAll({
            attributes: ['id', 'seller_Name']
        });

        res.status(200).json(sellers);
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
};
