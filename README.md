# SmartCan Dashboard

A modern, interactive dashboard for monitoring SmartCan status and metrics. Built with React and Node.js.

## Features

- Real-time monitoring of SmartCan status
- Interactive fill level visualization
- Temperature and humidity tracking
- Pickup schedule management
- Responsive design with modern UI
- Real-time updates every 30 seconds

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Styling: CSS Modules
- API: RESTful endpoints

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jothelearningguy/smartscan.git
cd smartscan
```

2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 5000) servers concurrently.

## API Endpoints

- `GET /api/smartcan/status` - Get current SmartCan status
- `POST /api/smartcan/update` - Update SmartCan status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 