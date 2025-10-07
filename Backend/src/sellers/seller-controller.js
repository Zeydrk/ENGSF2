const models = require('../../models');

async function getSeller(req,res){
    try{
        const seller = await models['Seller'].findAll();
        res.status(200).json(seller);
    }
    catch{
        res.status(500).json({ error: err.message });
    }
}
async function addSeller(req,res){
    try{
        const {seller_FName , seller_MName, seller_LName} =req.body;
        const newSeller = await models['Seller'].create({
            seller_FName,
            seller_MName,
            seller_LName
        })
        res.status(201).json(newSeller);
    }
    catch{
        res.status(500).json({error: err.message});
    }
}
async function deleteSeller(req,res){
    try{
    const {id} = req.body
    const deleted = await models['Seller'].destroy({where: {id} });
    res.status(200).json({ message: "Seller deleted successfully"});        
    }
    catch{
res.status(404).json({ message: "Seller not found"});
    }
}
async function updateSeller(req,res){
    try{
        const {id , seller_FName, seller_MName, seller_LName} = req.body;
        const seller = await models['Seller'].findByPk(id);
         if (!product) return res.status(404).json({ message: "Product not found" });
            seller.seller_FName = seller_FName;
            seller.seller_MName = seller_MName;
            seller.seller_LName = seller_LName;
            await product.save();
        res.status(200).json({message: "Seller updated successfully"})
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
}
module.exports = {
    getSeller,
    addSeller,
    deleteSeller,
    updateSeller    
}