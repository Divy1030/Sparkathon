import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, Package, Calendar } from 'lucide-react';

interface DefectAnalyticsProps {
  cardClass: string;
}

interface AnalyticsData {
  totalReports: number;
  openReports: number;
  resolvedReports: number;
  averageResolutionTime: number;
  defectsByType: Array<{ name: string; value: number; color: string }>;
  defectsBySeverity: Array<{ name: string; value: number; color: string }>;
  monthlyTrends: Array<{ month: string; reports: number; resolved: number }>;
  topAffectedSuppliers: Array<{ name: string; reports: number; defectRate: number }>;
}

const DefectAnalytics: React.FC<DefectAnalyticsProps> = ({ cardClass }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const response = await fetch(`/api/defect-reports/analytics?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        // Mock data for demonstration
        setAnalytics({
          totalReports: 45,
          openReports: 12,
          resolvedReports: 33,
          averageResolutionTime: 5.2,
          defectsByType: [
            { name: 'Quality Issue', value: 18, color: '#EF4444' },
            { name: 'Damaged Product', value: 12, color: '#F97316' },
            { name: 'Wrong Specification', value: 8, color: '#EAB308' },
            { name: 'Missing Parts', value: 4, color: '#84CC16' },
            { name: 'Other', value: 3, color: '#6B7280' }
          ],
          defectsBySeverity: [
            { name: 'Critical', value: 5, color: '#DC2626' },
            { name: 'High', value: 12, color: '#EA580C' },
            { name: 'Medium', value: 20, color: '#CA8A04' },
            { name: 'Low', value: 8, color: '#65A30D' }
          ],
          monthlyTrends: [
            { month: 'Jan', reports: 35, resolved: 32 },
            { month: 'Feb', reports: 28, resolved: 26 },
            { month: 'Mar', reports: 42, resolved: 38 },
            { month: 'Apr', reports: 38, resolved: 35 },
            { month: 'May', reports: 31, resolved: 29 },
            { month: 'Jun', reports: 45, resolved: 33 }
          ],
          topAffectedSuppliers: [
            { name: 'TechFlow Logistics', reports: 8, defectRate: 2.1 },
            { name: 'GlobalSupply Corp', reports: 6, defectRate: 1.8 },
            { name: 'ReliableCargo', reports: 12, defectRate: 3.2 },
            { name: 'FastTrack Solutions', reports: 4, defectRate: 1.2 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data on error
      setAnalytics({
        totalReports: 45,
        openReports: 12,
        resolvedReports: 33,
        averageResolutionTime: 5.2,
        defectsByType: [
          { name: 'Quality Issue', value: 18, color: '#EF4444' },
          { name: 'Damaged Product', value: 12, color: '#F97316' },
          { name: 'Wrong Specification', value: 8, color: '#EAB308' },
          { name: 'Missing Parts', value: 4, color: '#84CC16' },
          { name: 'Other', value: 3, color: '#6B7280' }
        ],
        defectsBySeverity: [
          { name: 'Critical', value: 5, color: '#DC2626' },
          { name: 'High', value: 12, color: '#EA580C' },
          { name: 'Medium', value: 20, color: '#CA8A04' },
          { name: 'Low', value: 8, color: '#65A30D' }
        ],
        monthlyTrends: [
          { month: 'Jan', reports: 35, resolved: 32 },
          { month: 'Feb', reports: 28, resolved: 26 },
          { month: 'Mar', reports: 42, resolved: 38 },
          { month: 'Apr', reports: 38, resolved: 35 },
          { month: 'May', reports: 31, resolved: 29 },
          { month: 'Jun', reports: 45, resolved: 33 }
        ],
        topAffectedSuppliers: [
          { name: 'TechFlow Logistics', reports: 8, defectRate: 2.1 },
          { name: 'GlobalSupply Corp', reports: 6, defectRate: 1.8 },
          { name: 'ReliableCargo', reports: 12, defectRate: 3.2 },
          { name: 'FastTrack Solutions', reports: 4, defectRate: 1.2 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">Defect Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{analytics.totalReports}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <Package className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-600">{analytics.openReports}</div>
          <div className="text-sm text-gray-600">Open Reports</div>
        </div>
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <div className="text-2xl font-bold text-green-600">{analytics.resolvedReports}</div>
          <div className="text-sm text-gray-600">Resolved Reports</div>
        </div>
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <div className="text-2xl font-bold text-blue-600">{analytics.averageResolutionTime}</div>
          <div className="text-sm text-gray-600">Avg Resolution (days)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Defects by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.defectsByType}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.defectsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Defects by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.defectsBySeverity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {analytics.defectsBySeverity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reports" stroke="#EF4444" strokeWidth={2} name="Reports" />
              <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Top Affected Suppliers</h3>
          <div className="space-y-3">
            {analytics.topAffectedSuppliers.map((supplier, index) => (
              <div key={supplier.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-sm text-gray-600">{supplier.reports} reports</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    supplier.defectRate > 2.5 ? 'text-red-600' :
                    supplier.defectRate > 1.5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {supplier.defectRate}% defect rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectAnalytics;
