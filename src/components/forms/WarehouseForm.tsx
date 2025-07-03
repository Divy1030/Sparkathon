import React, { useState } from 'react';
import { MapPin, Package, Settings, Save, X, AlertCircle } from 'lucide-react';

interface WarehouseFormProps {
  cardClass: string;
  onSubmit: (warehouseData: any) => void;
  onCancel?: () => void;
  editingWarehouse?: any;
}

interface WarehouseFormData {
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  currentUtilization: number;
  status: 'active' | 'inactive' | 'maintenance';
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  operationalHours: {
    open: string;
    close: string;
    timezone: string;
  };
  facilities: string[];
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({ 
  cardClass, 
  onSubmit, 
  onCancel,
  editingWarehouse 
}) => {
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: editingWarehouse?.name || '',
    location: {
      address: editingWarehouse?.location?.address || '',
      city: editingWarehouse?.location?.city || '',
      state: editingWarehouse?.location?.state || '',
      country: editingWarehouse?.location?.country || 'India',
      coordinates: {
        lat: editingWarehouse?.location?.coordinates?.lat || 0,
        lng: editingWarehouse?.location?.coordinates?.lng || 0,
      }
    },
    capacity: editingWarehouse?.capacity || 1000,
    currentUtilization: editingWarehouse?.currentUtilization || 0,
    status: editingWarehouse?.status || 'active',
    manager: {
      name: editingWarehouse?.manager?.name || '',
      email: editingWarehouse?.manager?.email || '',
      phone: editingWarehouse?.manager?.phone || '',
    },
    operationalHours: {
      open: editingWarehouse?.operationalHours?.open || '09:00',
      close: editingWarehouse?.operationalHours?.close || '18:00',
      timezone: editingWarehouse?.operationalHours?.timezone || 'Asia/Kolkata',
    },
    facilities: editingWarehouse?.facilities || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Indian cities with coordinates for quick selection
  const cityCoordinates = {
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Surat': { lat: 21.1702, lng: 72.8311 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
    'Kanpur': { lat: 26.4499, lng: 80.3319 },
    'Nagpur': { lat: 21.1458, lng: 79.0882 },
    'Indore': { lat: 22.7196, lng: 75.8577 },
    'Thane': { lat: 19.2183, lng: 72.9781 },
    'Bhopal': { lat: 23.2599, lng: 77.4126 },
    'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'Pimpri': { lat: 18.6298, lng: 73.8010 },
    'Patna': { lat: 25.5941, lng: 85.1376 },
    'Vadodara': { lat: 22.3072, lng: 73.1812 }
  };

  const facilityOptions = [
    'loading_dock',
    'cold_storage', 
    'security_system',
    'fire_safety',
    'parking',
    'office_space'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Warehouse name is required';
    }

    if (!formData.location.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.location.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (formData.currentUtilization < 0 || formData.currentUtilization > 100) {
      newErrors.currentUtilization = 'Utilization must be between 0 and 100';
    }

    if (!formData.manager.name.trim()) {
      newErrors.managerName = 'Manager name is required';
    }

    if (!formData.manager.email.trim()) {
      newErrors.managerEmail = 'Manager email is required';
    }

    if (!formData.manager.phone.trim()) {
      newErrors.managerPhone = 'Manager phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCitySelect = (cityName: string) => {
    const coords = cityCoordinates[cityName as keyof typeof cityCoordinates];
    if (coords) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          city: cityName,
          coordinates: {
            lat: coords.lat,
            lng: coords.lng
          },
          address: prev.location.address || `${cityName}, India`
        }
      }));
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting warehouse form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Warehouse Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Delhi Distribution Center"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Manager Name *
            </label>
            <input
              type="text"
              value={formData.manager.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                manager: { ...prev.manager, name: e.target.value }
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.managerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Rajesh Kumar"
            />
            {errors.managerName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.managerName}
              </p>
            )}
          </div>
        </div>

        {/* Manager Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Manager Email *
            </label>
            <input
              type="email"
              value={formData.manager.email}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                manager: { ...prev.manager, email: e.target.value }
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.managerEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="manager@company.com"
            />
            {errors.managerEmail && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.managerEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Manager Phone *
            </label>
            <input
              type="tel"
              value={formData.manager.phone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                manager: { ...prev.manager, phone: e.target.value }
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+91 98765 43210"
            />
            {errors.managerPhone && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.managerPhone}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <MapPin className="w-4 h-4" />
            Location *
          </label>
          <input
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, address: e.target.value }
            }))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter full address"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.address}
            </p>
          )}
          
          {/* Quick city selection */}
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Quick select city:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(cityCoordinates).slice(0, 8).map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={formData.location.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, city: e.target.value }
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Delhi"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <input
              type="text"
              value={formData.location.state}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, state: e.target.value }
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Delhi"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.state}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              value={formData.location.country}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, country: e.target.value }
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="India"
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.location.coordinates.lat}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { 
                  ...prev.location, 
                  coordinates: { 
                    ...prev.location.coordinates,
                    lat: parseFloat(e.target.value) || 0 
                  }
                }
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="28.6139"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.location.coordinates.lng}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { 
                  ...prev.location, 
                  coordinates: { 
                    ...prev.location.coordinates,
                    lng: parseFloat(e.target.value) || 0 
                  }
                }
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="77.2090"
            />
          </div>
        </div>

        {/* Capacity and Utilization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Capacity (units) *
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                capacity: parseInt(e.target.value) || 0 
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1000"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.capacity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Utilization (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.currentUtilization}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                currentUtilization: parseInt(e.target.value) || 0 
              }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.currentUtilization ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="75"
            />
            {errors.currentUtilization && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.currentUtilization}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.value as 'active' | 'inactive' | 'maintenance'
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Operational Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opening Time</label>
            <input
              type="time"
              value={formData.operationalHours.open}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                operationalHours: { ...prev.operationalHours, open: e.target.value }
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Closing Time</label>
            <input
              type="time"
              value={formData.operationalHours.close}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                operationalHours: { ...prev.operationalHours, close: e.target.value }
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={formData.operationalHours.timezone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                operationalHours: { ...prev.operationalHours, timezone: e.target.value }
              }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Mumbai">Asia/Mumbai (IST)</option>
              <option value="Asia/Delhi">Asia/Delhi (IST)</option>
            </select>
          </div>
        </div>

        {/* Facilities */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Settings className="w-4 h-4" />
            Facilities & Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {facilityOptions.map(facility => (
              <label
                key={facility}
                className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(facility)}
                  onChange={() => handleFacilityToggle(facility)}
                  className="rounded"
                />
                <span className="text-sm">{facility.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {editingWarehouse ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WarehouseForm;
