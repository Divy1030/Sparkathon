import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, Edit, CheckCircle, Clock, Filter, Search, Download } from 'lucide-react';
import { apiClient } from '../../lib/apiUtils';

interface DefectReport {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  defectType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  quantityAffected: number;
  detectedDate: string;
  reportedBy: string;
  batchNumber?: string;
  resolutionDate?: string;
  createdAt: string;
}

interface DefectReportsListProps {
  cardClass: string;
  supplierId?: string;
  onViewReport?: (report: DefectReport) => void;
  onEditReport?: (report: DefectReport) => void;
}

const DefectReportsList: React.FC<DefectReportsListProps> = ({ 
  cardClass, 
  supplierId, 
  onViewReport, 
  onEditReport 
}) => {
  const [reports, setReports] = useState<DefectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    defectType: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDefectReports();
    fetchAnalytics();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [supplierId, currentPage, filters]);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.getDefectAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchDefectReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(supplierId && { supplierId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.search && { search: filters.search })
      };

      const response = await apiClient.getDefectReports(params);
      
      if (response.success && response.data) {
        setReports(response.data);
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.totalRecords / 10));
        }
      } else {
        // Fallback to mock data when API fails
        console.warn('API failed, using mock data:', response.message);
        setError('Unable to connect to server. Showing sample data.');
        setReports([
          {
            id: '1',
            supplierId: 'sup1',
            supplierName: 'Tech Solutions India',
            productId: 'prod1',
            productName: 'Laptop HP Pavilion',
            defectType: 'Hardware Failure',
            severity: 'high' as const,
            status: 'open' as const,
            description: 'Screen flickering issue reported',
            quantityAffected: 5,
            detectedDate: new Date().toISOString(),
            reportedBy: 'QA Team',
            batchNumber: 'B001',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            supplierId: 'sup2',
            supplierName: 'Fashion Hub Ltd',
            productId: 'prod2',
            productName: 'Cotton T-Shirt',
            defectType: 'Quality Issue',
            severity: 'medium' as const,
            status: 'investigating' as const,
            description: 'Color bleeding after first wash',
            quantityAffected: 12,
            detectedDate: new Date(Date.now() - 86400000).toISOString(),
            reportedBy: 'Customer Service',
            batchNumber: 'B002',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching defect reports:', error);
      setError('Failed to load defect reports. Showing sample data.');
      // Fallback to mock data on error
      setReports([
        {
          id: '1',
          supplierId: 'sup1',
          supplierName: 'Tech Solutions India',
          productId: 'prod1',
          productName: 'Laptop HP Pavilion',
          defectType: 'Hardware Failure',
          severity: 'high' as const,
          status: 'open' as const,
          description: 'Screen flickering issue reported',
          quantityAffected: 5,
          detectedDate: new Date().toISOString(),
          reportedBy: 'QA Team',
          batchNumber: 'B001',
          createdAt: new Date().toISOString()
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await apiClient.updateDefectReportStatus(reportId, status);
      
      if (response.success) {
        fetchDefectReports(); // Refresh the list
        fetchAnalytics(); // Refresh analytics
        alert('Report status updated successfully!');
      } else {
        alert('Error updating report status: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Error updating report status. Please try again.');
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const response = await apiClient.resolveDefectReport(reportId, {
        resolutionDate: new Date().toISOString(),
        resolvedBy: 'Current User', // In real app, get from auth context
        resolutionNotes: 'Report resolved via dashboard'
      });
      
      if (response.success) {
        fetchDefectReports(); // Refresh the list
        fetchAnalytics(); // Refresh analytics
        alert('Report resolved successfully!');
      } else {
        alert('Error resolving report: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Error resolving report. Please try again.');
    }
  };

  const viewReportDetails = async (reportId: string) => {
    try {
      const response = await apiClient.getDefectReportById(reportId);
      
      if (response.success && response.data) {
        // In a real app, this would open a modal or navigate to a detail page
        console.log('Report Details:', response.data);
        if (onViewReport && response.data) {
          onViewReport(response.data as DefectReport);
        }
      } else {
        alert('Error fetching report details: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      alert('Error fetching report details. Please try again.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
    
    // Debounce search requests
    if (field === 'search') {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        fetchDefectReports();
      }, 500);
      setSearchTimeout(timeout);
    }
  };

  const handleExport = async () => {
    try {
      // Get all reports for export (without pagination)
      const response = await apiClient.getDefectReports({
        ...(supplierId && { supplierId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.search && { search: filters.search }),
        limit: 1000 // Large limit to get all records
      });

      if (response.success && response.data) {
        // Convert to CSV
        const csvContent = convertToCSV(response.data);
        downloadCSV(csvContent, 'defect-reports.csv');
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const convertToCSV = (data: DefectReport[]) => {
    const headers = ['ID', 'Supplier', 'Product', 'Defect Type', 'Severity', 'Status', 'Quantity', 'Date', 'Reported By'];
    const csvRows = [
      headers.join(','),
      ...data.map(report => [
        report.id,
        `"${report.supplierName}"`,
        `"${report.productName}"`,
        `"${report.defectType}"`,
        report.severity,
        report.status,
        report.quantityAffected,
        new Date(report.detectedDate).toLocaleDateString(),
        `"${report.reportedBy}"`
      ].join(','))
    ];
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(report => report.id));
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    try {
      const promises = selectedReports.map(reportId => 
        apiClient.updateDefectReportStatus(reportId, status)
      );
      
      await Promise.all(promises);
      setSelectedReports([]);
      fetchDefectReports();
      fetchAnalytics();
      alert(`Successfully updated ${selectedReports.length} reports`);
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert('Error updating reports. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading defect reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-xl font-semibold">
              {supplierId ? 'Supplier Defect Reports' : 'All Defect Reports'}
            </h2>
            {analytics && (
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                <span>Total: {analytics.totalReports || 0}</span>
                <span>Open: {analytics.openReports || 0}</span>
                <span>Critical: {analytics.criticalReports || 0}</span>
                <span>Avg Resolution Time: {analytics.avgResolutionTime || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchDefectReports}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedReports.length} report(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkUpdateStatus('investigating')}
                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
              >
                Mark as Investigating
              </button>
              <button
                onClick={() => bulkUpdateStatus('resolved')}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => setSelectedReports([])}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search reports..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFilters({ status: '', severity: '', defectType: '', search: '' });
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium w-12">
                <input
                  type="checkbox"
                  checked={selectedReports.length === reports.length && reports.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left p-3 font-medium">ID</th>
              <th className="text-left p-3 font-medium">Supplier</th>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Defect Type</th>
              <th className="text-left p-3 font-medium">Severity</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Quantity</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-3 font-mono text-sm">#{report.id.slice(-6)}</td>
                <td className="p-3">{report.supplierName}</td>
                <td className="p-3">{report.productName}</td>
                <td className="p-3">{report.defectType}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                    {report.severity.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status.toUpperCase()}
                  </div>
                </td>
                <td className="p-3">{report.quantityAffected}</td>
                <td className="p-3">{new Date(report.detectedDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewReportDetails(report.id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditReport && onEditReport(report)}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      title="Edit Report"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <select
                      value={report.status}
                      onChange={(e) => updateReportStatus(report.id, e.target.value)}
                      className="text-xs p-1 border rounded"
                      title="Update Status"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    {report.status !== 'resolved' && report.status !== 'closed' && (
                      <button
                        onClick={() => resolveReport(report.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No defect reports found.</p>
        </div>
      )}
    </div>
  );
};

export default DefectReportsList;
