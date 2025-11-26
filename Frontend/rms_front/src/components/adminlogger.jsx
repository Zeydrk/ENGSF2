// components/AdminLogger.jsx
import React, { useState, useEffect } from 'react';

// Base logging functions
const AdminLogger = {
  // Base logging method
  logAction: async (adminId, action, productId = null, details = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admin_Id: adminId,
          action: action,
          product_Id: productId,
          details: details
        })
      });
      
      if (!response.ok) throw new Error('Failed to log action');
      
      console.log(`Logged: ${action}`);
      return await response.json();
    } catch (error) {
      console.error('Logging failed:', error);
      return { success: false, error: error.message };
    }
  },

  logProductAdd: async (adminId, productId, productName) => {
    return await AdminLogger.logAction(
      adminId, 'ADD', productId, `Added product: ${productName}`
    );
  },

  logProductEdit: async (adminId, productId, productName, changes = '') => {
    return await AdminLogger.logAction(
      adminId, 'EDIT', productId, `Edited product: ${productName}${changes ? ` - ${changes}` : ''}`
    );
  },

  logProductDelete: async (adminId, productId, productName) => {
    return await AdminLogger.logAction(
      adminId, 'DELETE', productId, `Deleted product: ${productName}`
    );
  },

  logProductArchive: async (adminId, productId, productName) => {
    return await AdminLogger.logAction(
      adminId, 'ARCHIVE', productId, `Archived product: ${productName}`
    );
  },

  logProductUnarchive: async (adminId, productId, productName) => {
    return await AdminLogger.logAction(
      adminId, 'UNARCHIVE', productId, `Unarchived product: ${productName}`
    );
  },

  getRecentLogs: async (limit = 10) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/logs/recent?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch logs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching logs:', error);
      return { success: false, data: [] };
    }
  }
};

// React Components
export const RecentActivities = ({ limit = 5, showHeader = true, className = "" }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [limit]);

  const loadActivities = async () => {
    setLoading(true);
    const result = await AdminLogger.getRecentLogs(limit);
    if (result.success) {
      setActivities(result.data);
    }
    setLoading(false);
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'ADD': return 'bg-green-100 text-green-800';
      case 'EDIT': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'ARCHIVE': return 'bg-yellow-100 text-yellow-800';
      case 'UNARCHIVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Activities</h2>
          <button 
            onClick={loadActivities}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Refresh
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border-l-4 border-orange-400 pl-3 py-2">
              <div className="flex justify-between items-start">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getActionColor(activity.action)}`}>
                  {activity.action}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(activity.date_created)}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{activity.details}</p>
              {activity.admin && (
                <p className="text-xs text-gray-500 mt-1">
                  by {activity.admin.username}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No recent activities</p>
          <p className="text-gray-400 text-xs mt-1">
            Admin actions will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export const ActivityFeed = ({ activities = [], className = "" }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-gray-500">No activities to display</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 text-sm">
          <span className={`w-2 h-2 rounded-full ${
            activity.action === 'ADD' ? 'bg-green-500' :
            activity.action === 'EDIT' ? 'bg-blue-500' :
            activity.action === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
          }`}></span>
          <span className="flex-1">{activity.details}</span>
          <span className="text-xs text-gray-500">
            {new Date(activity.date_created).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// Export both the functions and components
export default AdminLogger;