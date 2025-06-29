# Supply Chain Dashboard with Route Optimization

A comprehensive supply chain management dashboard built with Next.js, featuring real-time route optimization using OpenRoute Service.

## Features

- **Interactive Dashboard**: Real-time analytics and KPIs
- **Route Optimization**: Calculate optimal delivery routes with time and distance estimates
- **Inventory Forecasting**: AI-powered demand prediction
- **Supplier Reliability**: Performance tracking and scoring
- **Warehouse Selector AI**: Intelligent warehouse recommendations
- **Alert System**: Real-time notifications and anomaly detection

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRoute Service API Key (free)

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Get your free OpenRoute Service API key:
   - Visit [OpenRoute Service](https://openrouteservice.org/dev/#/signup)
   - Sign up for a free account
   - Get your API key

5. Add your API key to `.env.local`:
```bash
ORS_API_KEY=your_openroute_service_api_key_here
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Route Optimization Usage

1. Navigate to the "Map Simulation" tab
2. Enter starting location (e.g., "Delhi, India")
3. Enter destination (e.g., "Mumbai, India")
4. Add additional waypoints if needed
5. Click "Optimize Route" to get:
   - Total distance
   - Estimated travel time
   - Fuel efficiency calculations
   - Cost estimates
   - CO₂ emissions

## Features Overview

### Dashboard Components

- **Dashboard Overview**: Key metrics and real-time alerts
- **Inventory Forecasting**: Demand prediction with ML insights
- **Supplier Reliability**: Performance scoring and recommendations
- **Last-Mile Delivery**: Route performance analytics
- **Warehouse Selector AI**: Intelligent warehouse recommendations
- **Map Simulation**: Route optimization and geographic analysis
- **Alerts & Anomalies**: Real-time monitoring and notifications
- **Reports & Insights**: Comprehensive analytics and exports

### API Endpoints

- `POST /api/route`: Calculate optimized routes between multiple locations

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **API Integration**: OpenRoute Service
- **HTTP Client**: Axios

## Environment Variables

```bash
ORS_API_KEY=your_openroute_service_api_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the GitHub repository.
