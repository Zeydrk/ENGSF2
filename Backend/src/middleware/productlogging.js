// src/middleware/productLogging.js - COMPLETE DEBUG VERSION
const models = require("../../models");

console.log('🟢 [PRODUCT LOGGING] Middleware file loaded successfully');

const productLoggingMiddleware = (req, res, next) => {
  console.log('🚨 [MIDDLEWARE] EXECUTING - URL:', req.originalUrl, 'METHOD:', req.method);
  console.log('🚨 [MIDDLEWARE] Headers - x-admin-id:', req.headers['x-admin-id'] || 'Not provided');
  console.log('🚨 [MIDDLEWARE] Body:', JSON.stringify(req.body, null, 2));
  
  const originalSend = res.send;
  
  res.send = function(data) {
    console.log('🚨 [RESPONSE] SENDING - Status:', res.statusCode);
    console.log('🚨 [RESPONSE] Data type:', typeof data);
    
    // Call the original send function
    const result = originalSend.call(this, data);
    
    // Async logging after response is sent
    setTimeout(async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('🚨 [LOGGING] Attempting to log action...');
          await logProductAction(req, data);
        }
      } catch (error) {
        console.error('❌ [LOGGING] Error:', error.message);
      }
    }, 0);
    
    return result;
  };
  
  next();
};

async function logProductAction(req, responseData) {
  console.log('🔍 [ACTION DETECTION] Starting detection for:', req.method, req.originalUrl);
  
  let action = '';
  let productId = req.body?.id;
  let actionDetails = '';
  
  const adminId = req.headers['x-admin-id'] || req.headers['X-Admin-ID'] || '1';
  const url = req.originalUrl.toLowerCase();

  console.log('🔍 [ACTION DETECTION] Product ID:', productId);
  console.log('🔍 [ACTION DETECTION] Full URL:', url);

  // CREATE ACTION
  if (req.method === 'POST' && url.includes('create')) {
    action = 'CREATE';
    console.log('✅ [ACTION] CREATE detected');
    
    let parsedResponse = responseData;
    if (typeof responseData === 'string') {
      try {
        parsedResponse = JSON.parse(responseData);
        console.log('🔍 [CREATE] Parsed response:', parsedResponse);
      } catch (e) {
        console.log('❌ [CREATE] Failed to parse response');
      }
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
  // UPDATE ACTION
  else if (req.method === 'POST' && url.includes('update')) {
    action = 'UPDATE';
    console.log('✅ [ACTION] UPDATE detected');
    
    if (productId) {
      try {
        const product = await models.Products.findByPk(productId);
        actionDetails = `Updated: ${product?.product_Name || productId}`;
        console.log('🔍 [UPDATE] Found product:', product?.product_Name);
      } catch (error) {
        console.error('❌ [UPDATE] Error finding product:', error.message);
        actionDetails = `Updated product ${productId}`;
      }
    } else {
      actionDetails = 'Updated product';
    }
  }
  // ARCHIVE ACTION
  else if (req.method === 'POST' && url.includes('archive') && !url.includes('addback')) {
    action = 'ARCHIVE';
    console.log('✅ [ACTION] ARCHIVE detected');
    
    if (productId) {
      try {
        const product = await models.Products.findByPk(productId);
        actionDetails = `Archived: ${product?.product_Name || productId}`;
        console.log('🔍 [ARCHIVE] Found product:', product?.product_Name);
      } catch (error) {
        console.error('❌ [ARCHIVE] Error finding product:', error.message);
        actionDetails = `Archived product ${productId}`;
      }
    } else {
      actionDetails = 'Archived product';
    }
  }
  // UNARCHIVE ACTION
  else if (req.method === 'POST' && url.includes('addback')) {
    action = 'UNARCHIVE';
    console.log('✅ [ACTION] UNARCHIVE detected');
    
    if (productId) {
      try {
        const product = await models.Products.findByPk(productId);
        actionDetails = `Unarchived: ${product?.product_Name || productId}`;
        console.log('🔍 [UNARCHIVE] Found product:', product?.product_Name);
      } catch (error) {
        console.error('❌ [UNARCHIVE] Error finding product:', error.message);
        actionDetails = `Unarchived product ${productId}`;
      }
    } else {
      actionDetails = 'Unarchived product';
    }
  }
  // DELETE ACTION
  else if (req.method === 'POST' && url.includes('delete')) {
    action = 'DELETE';
    console.log('✅ [ACTION] DELETE detected');
    
    if (productId) {
      try {
        const product = await models.Products.findByPk(productId);
        actionDetails = `Deleted: ${product?.product_Name || productId}`;
        console.log('🔍 [DELETE] Found product:', product?.product_Name);
      } catch (error) {
        console.error('❌ [DELETE] Error finding product:', error.message);
        actionDetails = `Deleted product ${productId}`;
      }
    } else {
      actionDetails = 'Deleted product';
    }
  } else {
    console.log('❌ [ACTION] No action detected for this route');
  }

  console.log('🔍 [ACTION DETECTION] Final action:', action);
  console.log('🔍 [ACTION DETECTION] Action details:', actionDetails);

  if (action) {
    console.log('📝 [LOGGING] Attempting to save log:', { action, productId, actionDetails });
    await logAdminActivity(adminId, action, productId, actionDetails);
  }
}

async function logAdminActivity(adminId, action, productId, actionDetails) {
  try {
    console.log('💾 [DATABASE] Creating log entry...');
    
    const logEntry = await models.AdminLogActivity.create({
      adminId: adminId,
      action: action,
      productId: productId,
      actionDetails: actionDetails,
      timestamp: new Date()
    });

    console.log('✅ [SUCCESS] Log saved to database with ID:', logEntry.id);
    console.log('✅ [SUCCESS] Details:', { action, productId, actionDetails });
    
  } catch (error) {
    console.error('❌ [DATABASE] Error saving log:', error.message);
    console.error('❌ [DATABASE] Full error:', error);
  }
}

module.exports = productLoggingMiddleware;