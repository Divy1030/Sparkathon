import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, Edit, CheckCircle, Clock, Filter, Search, Download } from 'lucide-react';

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
  }, [supplierId, currentPage, filters]);

  const fetchDefectReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '10');
      
      if (supplierId) queryParams.append('supplierId', supplierId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.severity) queryParams.append('severity', filters.severity);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/defect-reports?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data || []);
        if (data.pagination) {
          setTotalPages(Math.ceil(data.pagination.totalRecords / 10));
        }
      }
    } catch (error) {
      console.error('Error fetching defect reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch(`/api/defect-reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        fetchDefectReports(); // Refresh the list
        alert('Report status updated successfully!');
      } else {
        alert('Error updating report status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Error updating report status. Please try again.');
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/defect-reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resolutionDate: new Date().toISOString(),
          resolvedBy: 'Current User' // In real app, get from auth context
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchDefectReports(); // Refresh the list
        alert('Report resolved successfully!');
      } else {
        alert('Error resolving report: ' + data.message);
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Error resolving report. Please try again.');
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
          <h2 className="text-xl font-semibold">
            {supplierId ? 'Supplier Defect Reports' : 'All Defect Reports'}
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
        </div>
      </div>

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
                      onClick={() => onViewReport && onViewReport(report)}
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
