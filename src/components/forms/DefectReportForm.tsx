import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, User, Calendar, FileText, Send } from 'lucide-react';

interface DefectReportFormProps {
  cardClass: string;
  onSubmit?: (data: DefectReportData) => void;
  onClose?: () => void;
  supplierId?: string;
  productId?: string;
}

interface DefectReportData {
  supplierId: string;
  productId: string;
  defectType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  quantityAffected: number;
  detectedDate: string;
  reportedBy: string;
  batchNumber?: string;
  expectedResolutionDate?: string;
  attachments?: string[];
}

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

const DefectReportForm: React.FC<DefectReportFormProps> = ({ 
  cardClass, 
  onSubmit, 
  onClose, 
  supplierId, 
  productId 
}) => {
  const [formData, setFormData] = useState<DefectReportData>({
    supplierId: supplierId || '',
    productId: productId || '',
    defectType: '',
    severity: 'medium',
    description: '',
    quantityAffected: 1,
    detectedDate: new Date().toISOString().split('T')[0],
    reportedBy: '',
    batchNumber: '',
    expectedResolutionDate: '',
    attachments: []
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const defectTypes = [
    'Quality Issue',
    'Damaged Product',
    'Wrong Specification',
    'Missing Parts',
    'Contamination',
    'Packaging Defect',
    'Performance Issue',
    'Safety Concern',
    'Other'
  ];

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/supplier');
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/product');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.defectType) newErrors.defectType = 'Defect type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.quantityAffected < 1) newErrors.quantityAffected = 'Quantity must be at least 1';
    if (!formData.reportedBy.trim()) newErrors.reportedBy = 'Reporter name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/defect-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        if (onSubmit) {
          onSubmit(formData);
        }
        // Reset form
        setFormData({
          supplierId: supplierId || '',
          productId: productId || '',
          defectType: '',
          severity: 'medium',
          description: '',
          quantityAffected: 1,
          detectedDate: new Date().toISOString().split('T')[0],
          reportedBy: '',
          batchNumber: '',
          expectedResolutionDate: '',
          attachments: []
        });
        setErrors({});
        alert('Defect report submitted successfully!');
      } else {
        alert('Error submitting defect report: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting defect report:', error);
      alert('Error submitting defect report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DefectReportData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Report Product Defect</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <User className="w-4 h-4" />
              Supplier *
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => handleInputChange('supplierId', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.supplierId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!!supplierId}
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplierId && <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>}
          </div>

          {/* Product Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Package className="w-4 h-4" />
              Product *
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.productId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!!productId}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
          </div>

          {/* Defect Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Defect Type *</label>
            <select
              value={formData.defectType}
              onChange={(e) => handleInputChange('defectType', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.defectType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select defect type</option>
              {defectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.defectType && <p className="text-red-500 text-sm mt-1">{errors.defectType}</p>}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium mb-2">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value as DefectReportData['severity'])}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getSeverityColor(formData.severity)}`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Quantity Affected */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantity Affected *</label>
            <input
              type="number"
              min="1"
              value={formData.quantityAffected}
              onChange={(e) => handleInputChange('quantityAffected', parseInt(e.target.value))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.quantityAffected ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantityAffected && <p className="text-red-500 text-sm mt-1">{errors.quantityAffected}</p>}
          </div>

          {/* Detection Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              Detection Date
            </label>
            <input
              type="date"
              value={formData.detectedDate}
              onChange={(e) => handleInputChange('detectedDate', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reported By */}
          <div>
            <label className="block text-sm font-medium mb-2">Reported By *</label>
            <input
              type="text"
              value={formData.reportedBy}
              onChange={(e) => handleInputChange('reportedBy', e.target.value)}
              placeholder="Enter reporter name"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.reportedBy ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reportedBy && <p className="text-red-500 text-sm mt-1">{errors.reportedBy}</p>}
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Batch Number</label>
            <input
              type="text"
              value={formData.batchNumber}
              onChange={(e) => handleInputChange('batchNumber', e.target.value)}
              placeholder="Enter batch number (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <FileText className="w-4 h-4" />
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide detailed description of the defect..."
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Expected Resolution Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Expected Resolution Date</label>
          <input
            type="date"
            value={formData.expectedResolutionDate}
            onChange={(e) => handleInputChange('expectedResolutionDate', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DefectReportForm;
