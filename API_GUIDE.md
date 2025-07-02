# Frontend API Integration Guide

This guide explains how to use the API integration for the Supply Chain Dashboard frontend with Next.js API routes.

## Architecture Overview

The frontend uses Next.js API routes as a proxy layer to communicate with the backend. This provides:
- **Better security** (backend URL hidden from client)
- **Centralized error handling**
- **Request/response transformation**
- **Token management**
- **CORS handling**

## Environment Setup

1. Create a `.env.local` file in the frontend root directory:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

## API Structure

### 📁 File Structure
```
frontend/src/
├── lib/
│   └── api.ts                 # Endpoints configuration
├── api/                       # Frontend API functions
│   ├── warehouse.ts           # Warehouse management
│   ├── purchase.ts            # Purchase orders
│   └── ...
└── app/api/                   # Next.js API routes (proxy)
    ├── warehouse/
    │   ├── route.ts           # GET, POST /api/warehouse
    │   ├── create/route.ts    # POST /api/warehouse/create
    │   └── [id]/
    │       ├── route.ts       # GET, PUT, DELETE /api/warehouse/[id]
    │       └── utilization/route.ts
    └── purchase/
        ├── route.ts           # GET, POST /api/purchase
        ├── analytics/route.ts # GET /api/purchase/analytics
        └── [id]/
            ├── route.ts       # GET, DELETE /api/purchase/[id]
            └── status/route.ts # PUT /api/purchase/[id]/status
```

## Quick Start

### 1. Using the API Routes

All API calls go through Next.js proxy routes at `/api/*` which forward to the backend.

### 2. Using the APIs

```typescript
// Get all warehouses
const response = await fetch('/api/warehouse?status=active');
const warehouses = await response.json();

// Create a purchase order
const response = await fetch('/api/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    warehouse: { id: 'warehouse-id' },
    product: { id: 'product-id' },
    quantity: 100,
    supplier: { id: 'supplier-id' },
    orderDate: new Date().toISOString(),
    expectedDeliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    createdBy: 'user-id'
  }),
});
const purchase = await response.json();

// Update purchase status (auto-updates inventory when completed)
const updateResponse = await fetch(`/api/purchase/purchase-id/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'completed',
    actualDeliveryDate: new Date().toISOString()
  }),
});
```

## Key Features Implementation

### 🏭 Warehouse Management

**Create Warehouse:**
```typescript
const response = await fetch('/api/warehouse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Main Warehouse',
    location: {
      address: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    capacity: 10000,
    manager: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91-9876543210'
    }
  }),
});
const newWarehouse = await response.json();
```

**API Routes Created:**
- `POST /api/warehouse/create` - Create warehouse
- `GET /api/warehouse` - Get all warehouses (with filters)
- `GET /api/warehouse/[id]` - Get specific warehouse
- `PUT /api/warehouse/[id]` - Update warehouse
- `DELETE /api/warehouse/[id]` - Delete warehouse
- `GET /api/warehouse/[id]/utilization` - Get utilization

### 🛒 Purchase Management (Key Feature)

**Create Purchase Order:**
```typescript
const purchase = await purchaseAPI.create({
  warehouse: { id: 'warehouse-id' },
  product: { id: 'product-id' },
  quantity: 100,
  supplier: { id: 'supplier-id' },
  orderDate: new Date().toISOString(),
  expectedDeliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  createdBy: 'user-id'
});
```

**Update Status (Auto-Inventory Update):**
```typescript
// When status changes to 'completed', backend automatically:
// 1. Updates warehouse inventory
// 2. Adjusts stock levels
// 3. Updates inventory in all related systems
await purchaseAPI.updateStatus('purchase-id', {
  status: 'completed',
  actualDeliveryDate: new Date().toISOString(),
  notes: 'Delivered successfully'
});
```

**API Routes Created:**
- `POST /api/purchase` - Create purchase order
- `GET /api/purchase` - Get all purchases (with filters)
- `GET /api/purchase/[id]` - Get specific purchase
- `PUT /api/purchase/[id]/status` - Update status (triggers inventory update)
- `DELETE /api/purchase/[id]` - Delete purchase
- `GET /api/purchase/analytics` - Get purchase analytics

## API Response Format

All APIs return a standardized response:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
  };
}
```

## Error Handling

### Frontend API Level
```typescript
try {
  const response = await fetch('/api/warehouse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(warehouseData),
  });
  const result = await response.json();
  
  if (result.success) {
    console.log('Success:', result.data);
  } else {
    console.error('API Error:', result.message);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

### Next.js API Route Level
- Validates request data
- Handles authentication tokens
- Provides detailed error responses
- Logs errors for debugging

## Testing the Integration

### 1. Use the API Tester Component
```typescript
import APITester from '@/components/APITester';

// In your component
<APITester />
```

The tester includes:
- Test warehouse API connection
- Test purchase API connection
- Test create warehouse functionality

### 2. Check Backend Connection
Make sure your backend is running on `http://localhost:8080`

### 3. Monitor Network Tab
- Check browser developer tools
- Verify API calls are being made to `/api/*` endpoints
- Check for proper error responses

## Authentication

The API routes automatically handle authentication by:
1. Checking for tokens in cookies (`accessToken`)
2. Checking `Authorization` header
3. Checking `x-access-token` header
4. Forwarding tokens to backend

## Deployment Considerations

### Environment Variables
```bash
# Production
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1

# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### CORS
The Next.js API routes handle CORS automatically as they act as a proxy.

## Real-time Features

### Purchase → Inventory Integration
1. **Create Purchase Order** → Status: 'pending'
2. **Update Status to 'completed'** → Backend automatically:
   - Updates warehouse inventory
   - Adjusts stock levels
   - Updates inventory status (in_stock, low_stock, etc.)
   - Reflects changes across all inventory queries

### Example Flow:
```typescript
// 1. Create purchase
const purchase = await purchaseAPI.create({
  warehouse: { id: 'wh-1' },
  product: { id: 'prod-1' },
  quantity: 100,
  // ... other fields
});

// 2. Update to completed (triggers inventory update)
await purchaseAPI.updateStatus(purchase.data._id, {
  status: 'completed'
});

// 3. Inventory is automatically updated
// Backend handles:
// - Adding 100 units to warehouse inventory
// - Updating stock status
// - Updating last restocked date
```

## Available Endpoints Summary

### Warehouses
- `POST /api/warehouse/create` - Create warehouse
- `GET /api/warehouse` - Get all (filters: status, page, limit)
- `GET /api/warehouse/[id]` - Get by ID
- `PUT /api/warehouse/[id]` - Update
- `DELETE /api/warehouse/[id]` - Delete
- `GET /api/warehouse/[id]/utilization` - Get utilization stats

### Purchases (Core Feature)
- `POST /api/purchase` - Create purchase order
- `GET /api/purchase` - Get all (filters: warehouse, status, category, page, limit)
- `GET /api/purchase/[id]` - Get by ID
- `PUT /api/purchase/[id]/status` - Update status (auto-updates inventory)
- `DELETE /api/purchase/[id]` - Delete (only pending/cancelled)
- `GET /api/purchase/analytics` - Get analytics (filters: warehouse, dateRange)

## Next Steps

1. **Start Backend Server** on `http://localhost:8080`
2. **Test APIs** using the APITester component
3. **Replace Mock Data** in your existing components with real API calls
4. **Implement Error Handling** in your UI components
5. **Add Loading States** for better UX

The system is now ready for full integration with your existing frontend components!
