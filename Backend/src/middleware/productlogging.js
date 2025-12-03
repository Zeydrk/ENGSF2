// src/middleware/productLogging.js - FINAL VERSION WITH ORIGINAL DATA SUPPORT
const models = require("../../models");

const productLoggingMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = async function(data) {
    try {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await logProductAction(req, data);
      }
    } catch (error) {
      console.error('Logging middleware error:', error);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

async function logProductAction(req, responseData) {
  let action = '';
  let productId = null;
  let actionDetails = '';
  
  if (req.body && req.body.id) {
    productId = req.body.id;
  }

  const adminId = req.headers['x-admin-id'] || req.headers['X-Admin-ID'] || '1';
  const route = req.route?.path || req.originalUrl;
  const method = req.method;
  
  // CREATE ACTION
  if (method === 'POST' && (route.includes('/create') || req.originalUrl.includes('/products/create'))) {
    action = 'CREATE';
    
    let parsedResponse = responseData;
    if (typeof responseData === 'string') {
      try {
        parsedResponse = JSON.parse(responseData);
      } catch (e) {}
    }
    
    if (parsedResponse && parsedResponse.id) {
      productId = parsedResponse.id;
      actionDetails = `Created: ${parsedResponse.product_Name || 'New Product'}`;
    } else if (req.body && req.body.product_Name) {
      actionDetails = `Created: ${req.body.product_Name}`;
    } else {
      actionDetails = 'Created new product';
    }
    
  } 
  // ARCHIVE ACTION
  else if (method === 'POST' && (route.includes('/archive') || req.originalUrl.includes('/archive'))) {
    action = 'ARCHIVE';
    const product = await models.Products.findByPk(productId);
    actionDetails = `Archived: ${product?.product_Name || productId}`;
  } 
  // UNARCHIVE ACTION  
  else if (method === 'POST' && (route.includes('/addBack') || req.originalUrl.includes('/addBack'))) {
    action = 'UNARCHIVE';
    const product = await models.Products.findByPk(productId);
    actionDetails = `Unarchived: ${product?.product_Name || productId}`;
  } 
  // UPDATE ACTION - USING ORIGINAL DATA FROM CONTROLLER
  else if (method === 'POST' && (route.includes('/update') || req.originalUrl.includes('/update'))) {
    action = 'UPDATE';
    
    const originalProduct = await models.Products.findByPk(productId);
    if (originalProduct) {
      const changes = [];
      
      // USE THE ORIGINAL DATA FROM THE CONTROLLER IF AVAILABLE
      const originalData = req.originalProductData || originalProduct;
      
      console.log('UPDATE DEBUG - Original Data:', {
        retail: originalData.product_RetailPrice,
        buying: originalData.product_BuyingPrice,
        stock: originalData.product_Stock
      });
      console.log('UPDATE DEBUG - Request Data:', {
        retail: req.body.product_RetailPrice,
        buying: req.body.product_BuyingPrice,
        stock: req.body.product_Stock
      });
      
      // Check each field for changes
      if (req.body.product_Name && req.body.product_Name !== originalData.product_Name) {
        changes.push(`name: ${originalData.product_Name} → ${req.body.product_Name}`);
      }
      
      if (req.body.product_Description && req.body.product_Description !== originalData.product_Description) {
        changes.push(`description: ${originalData.product_Description} → ${req.body.product_Description}`);
      }
      
      if (req.body.product_RetailPrice !== undefined) {
        const originalRetail = parseFloat(originalData.product_RetailPrice);
        const newRetail = parseFloat(req.body.product_RetailPrice);
        if (originalRetail !== newRetail) {
          changes.push(`retail price: ₱${originalRetail} → ₱${newRetail}`);
        }
      }
      
      if (req.body.product_BuyingPrice !== undefined) {
        const originalBuying = parseFloat(originalData.product_BuyingPrice);
        const newBuying = parseFloat(req.body.product_BuyingPrice);
        if (originalBuying !== newBuying) {
          changes.push(`buying price: ₱${originalBuying} → ₱${newBuying}`);
        }
      }
      
      if (req.body.product_Stock !== undefined) {
        const originalStock = parseInt(originalData.product_Stock);
        const newStock = parseInt(req.body.product_Stock);
        if (originalStock !== newStock) {
          changes.push(`stock: ${originalStock} → ${newStock}`);
        }
      }
      
      if (req.body.product_Category && req.body.product_Category !== originalData.product_Category) {
        changes.push(`category: ${originalData.product_Category} → ${req.body.product_Category}`);
      }
      
      if (req.body.product_Expiry) {
        const originalExpiry = new Date(originalData.product_Expiry).toISOString().split('T')[0];
        const newExpiry = new Date(req.body.product_Expiry).toISOString().split('T')[0];
        if (originalExpiry !== newExpiry) {
          changes.push(`expiry: ${originalExpiry} → ${newExpiry}`);
        }
      }
      
      console.log('UPDATE DEBUG - Detected Changes:', changes);
      
      if (changes.length > 0) {
        actionDetails = `Updated ${originalProduct.product_Name}: ${changes.join(', ')}`;
      } else {
        actionDetails = `Updated ${originalProduct.product_Name} (no changes)`;
      }
    } else {
      actionDetails = `Updated product ${productId}`;
    }
  } 
  // DELETE ACTION
  else if (method === 'POST' && (route.includes('/delete') || req.originalUrl.includes('/delete'))) {
    action = 'DELETE';
    const product = await models.Products.findByPk(productId);
    actionDetails = `Deleted: ${product?.product_Name || productId}`;
  }

  // Log the action
  if (action) {
    await logAdminActivity(adminId, action, productId, actionDetails);
  }
}

async function logAdminActivity(adminId, action, productId, actionDetails = null) {
  try {
    let adminEmail = 'unknown@rms.com';
    const admin = await models.Admin.findByPk(adminId, {
      attributes: ['id', 'email']
    });
    
    if (admin) {
      adminEmail = admin.email;
    }

    const enhancedDetails = actionDetails || `${action} action performed`;

    await models.AdminLogActivity.create({
      adminId,
      action,
      productId,
      actionDetails: enhancedDetails,
      timestamp: new Date()
    });

    console.log('Product action logged:', { action, product: actionDetails, by: adminEmail });
    
  } catch (error) {
    console.error('Product logging failed:', error.message);
  }
}

module.exports = productLoggingMiddleware;