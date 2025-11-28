// components/AdminLogReport.js
import React, { useState, useEffect } from 'react';

export default function AdminLogReport() {
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    adminEmail: '',
    startDate: '',
    endDate: '',
    action: ''
  });
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 30 // Set to 30 as requested
  });
  const [showExportSuggestion, setShowExportSuggestion] = useState(false);

  // Fetch admins for filter dropdown
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('http://localhost:3000/logs/admins');
        if (response.ok) {
          const adminsData = await response.json();
          setAdmins(adminsData);
        }
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      }
    };

    fetchAdmins();
  }, []);

  // Fetch logs with filters
  const fetchLogs = async (filterParams = {}, page = 1, forExport = false) => {
    try {
      if (!forExport) setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      if (!forExport) {
        queryParams.append('page', page);
        queryParams.append('limit', pagination.limit);
      } else {
        // Remove pagination for CSV export to get all records
        queryParams.delete('page');
        queryParams.delete('limit');
      }

      const response = await fetch(`http://localhost:3000/logs?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        if (forExport) {
          return data.logs || [];
        } else {
          setLogs(data.logs || []);
          setPagination({
            currentPage: data.currentPage || page,
            totalPages: data.totalPages || 1,
            totalItems: data.totalItems || 0,
            limit: pagination.limit
          });
          
          // Show export suggestion if there are more than 30 total items
          if (data.totalItems > 30) {
            setShowExportSuggestion(true);
          } else {
            setShowExportSuggestion(false);
          }
        }
      } else {
        setError(data.error || 'Failed to fetch logs');
        return [];
      }
    } catch (err) {
      setError('Failed to connect to server');
      return [];
    } finally {
      if (!forExport) setLoading(false);
    }
  };

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchLogs(filters, 1);
  }, [filters]);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchLogs(filters, newPage);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      adminEmail: '',
      startDate: '',
      endDate: '',
      action: ''
    });
  };

  // Export to CSV function
  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      // Fetch ALL logs without pagination for CSV export
      const allLogs = await fetchLogs(filters, 1, true);
      
      if (allLogs.length === 0) {
        setError('No data to export');
        return;
      }
      
      // Define CSV headers
      const headers = ['Date', 'Time', 'Admin Email', 'Action', 'Product Name', 'Details'];
      
      // Convert logs to CSV format
      const csvData = allLogs.map(log => [
        formatDate(log.timestamp),
        formatTime(log.timestamp),
        log.admin?.email || 'Unknown Admin',
        log.action,
        log.product?.product_Name || 'N/A',
        `"${(log.actionDetails || 'No additional details').replace(/"/g, '""')}"`
      ]);
      
      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `admin-logs-${currentDate}`;
      
      if (filters.adminEmail || filters.action || filters.startDate || filters.endDate) {
        filename += '-filtered';
      }
      filename += '.csv';
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV');
    } finally {
      setExportLoading(false);
    }
  };

  // Get action badge color
  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      ARCHIVE: 'bg-yellow-100 text-yellow-800',
      UNARCHIVE: 'bg-purple-100 text-purple-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  // Format timestamp to time only
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format timestamp to date only
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2 text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading logs: {error}</span>
      </div>
    );
  }

  return (
    <div className="admin-log-report">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Admin Activity Log</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {logs.length} of {pagination.totalItems} activities
          </div>
          <button
            onClick={exportToCSV}
            disabled={exportLoading || pagination.totalItems === 0}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Export Suggestion Banner */}
      {showExportSuggestion && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-800 font-medium">Large dataset detected</p>
                <p className="text-blue-600 text-sm">
                  You have {pagination.totalItems} activities. Export to CSV to view all data at once.
                </p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              disabled={exportLoading}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export All'}
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Admin Email Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Admin
            </label>
            <select 
              value={filters.adminEmail}
              onChange={(e) => handleFilterChange('adminEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Admins</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.email}>
                  {admin.email}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Action
            </label>
            <select 
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="ARCHIVE">ARCHIVE</option>
              <option value="UNARCHIVE">UNARCHIVE</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex-1 min-w-[100px]">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(log.timestamp)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.admin?.email || 'Unknown Admin'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.product?.product_Name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {log.actionDetails || 'No additional details'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">No activity logs found</p>
            <p className="text-gray-400 text-sm">
              {Object.values(filters).some(filter => filter !== '') 
                ? 'Try adjusting your filters' 
                : 'Admin activities will appear here once they start making changes'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}