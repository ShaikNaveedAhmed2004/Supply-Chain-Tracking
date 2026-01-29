# Decentralized Supply Chain Tracking System

A comprehensive blockchain-based supply chain tracking application that provides transparent, tamper-proof tracking of goods from suppliers to consumers.

## 🌟 Features

- **Multi-Role Access Control**: Admin, Supplier, Manufacturer, Distributor, Retailer, and Consumer roles
- **Blockchain Verification**: All supply chain events are recorded and verified
- **Real-time Tracking**: Monitor product journey from origin to destination
- **Batch Management**: Create and track product batches throughout the supply chain
- **Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation & Running

```bash

git clone <YOUR_GIT_URL>


cd supply-chain-tracker


npm install


npm run dev
```

The application will be available at `http://localhost:8080`

## 📋 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn UI** for component library
- **React Router** for navigation
- **TanStack Query** for data management

### Backend Architecture
This application uses **Lovable Cloud** (built on Supabase) which provides:
- PostgreSQL database for relational data storage
- Row Level Security (RLS) for role-based access control
- Edge Functions (TypeScript/Deno) for serverless backend logic
- Built-in authentication with JWT tokens

### Blockchain Integration
The system simulates blockchain interactions with:
- Transaction hash generation for all supply chain events
- Block number tracking
- Verification status indicators
- Immutable event history

**Note**: For production deployment with real Ethereum blockchain:
1. Deploy Solidity smart contracts to Ethereum testnet/mainnet
2. Integrate Web3.js or Ethers.js for blockchain communication
3. Update Edge Functions to interact with deployed contracts
4. Replace simulated transaction hashes with real on-chain transactions

## 👥 User Roles & Capabilities

### Admin
- Manage all users and roles
- View system-wide statistics
- Approve/disable user accounts
- Monitor all batches and transactions

### Supplier
- Register new products
- Create product batches
- View batch history
- Track batches through supply chain

### Manufacturer
- Receive raw material batches
- Process and convert to finished products
- Link input batches to output batches
- Update manufacturing status

### Distributor
- Receive shipments from manufacturers
- Update shipment locations
- Track delivery status
- Manage logistics network

### Retailer
- Receive products from distributors
- Mark products as available for sale
- Track inventory
- Monitor sales

### Consumer
- Scan product QR codes or enter batch IDs
- View complete product journey
- Verify product authenticity
- See blockchain verification status

## 🔐 Authentication Flow

1. Users register with email and select their role
2. System generates JWT token upon login
3. Token stored in localStorage for session management
4. All API requests include JWT for authorization
5. Role-based access control enforces permissions

## 📊 Database Schema (Conceptual)

### Users
- id, email, password_hash, role, status, created_at

### Products
- id, name, description, category, sku, created_by, created_at

### Batches
- id, product_id, batch_number, quantity, current_owner, current_location, status, created_at

### SupplyChainEvents
- id, batch_id, from_party, to_party, location, status, timestamp, tx_hash, block_number, verified

### Payments
- id, batch_id, amount, status, tx_hash, released_at

## 🔗 Blockchain Smart Contract (Conceptual)

```solidity
// SupplyChain.sol
contract SupplyChain {
    struct Event {
        uint256 batchId;
        address fromParty;
        address toParty;
        string location;
        string status;
        uint256 timestamp;
    }
    
    mapping(uint256 => Event[]) public batchEvents;
    
    function recordEvent(
        uint256 batchId,
        address toParty,
        string memory location,
        string memory status
    ) public {
        // Record event on blockchain
    }
    
    function getEvents(uint256 batchId) public view returns (Event[] memory) {
        // Retrieve all events for a batch
    }
    
    function releasePayment(uint256 batchId) public {
        // Trigger payment release on delivery
    }
}
```

## 🛠️ API Endpoints (via Lovable Cloud Edge Functions)

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT

### Products
- `GET /products` - List all products
- `POST /products` - Create new product (Supplier only)
- `GET /products/:id` - Get product details

### Batches
- `GET /batches` - List batches (filtered by role)
- `POST /batches` - Create new batch (Supplier only)
- `GET /batches/:id` - Get batch details
- `PUT /batches/:id/status` - Update batch status

### Tracking
- `GET /batches/:id/history` - Get complete batch history with blockchain verification
- `GET /verify/:batchId` - Verify batch authenticity (Consumer)

### Admin
- `GET /admin/users` - List all users
- `PUT /admin/users/:id` - Update user status/role

## 🎨 Design System

The application uses a professional supply chain theme with:
- **Primary Blue**: Trust and technology (#0088CC)
- **Accent Teal**: Innovation and transparency (#14B8A6)
- **Success Green**: Verification and completion
- **Warning Amber**: Pending and in-transit states
- Custom blockchain verification badges
- Responsive card layouts
- Timeline components for tracking

## 🔄 Supply Chain Workflow

1. **Supplier** creates product and initial batch
   - Records on blockchain with TX hash
   - Batch status: CREATED

2. **Manufacturer** receives batch
   - Updates status to IN_TRANSIT
   - Processes into finished product
   - Links input → output batches
   - Records transformation on blockchain

3. **Distributor** receives finished product
   - Updates location and status
   - Manages logistics
   - Records each movement on blockchain

4. **Retailer** receives product
   - Marks as DELIVERED
   - Makes available for sale
   - Payment automatically released (smart contract)

5. **Consumer** scans product
   - Views complete journey
   - Verifies authenticity via blockchain
   - Sees all participants and timestamps

## 🚀 Deployment

### Deploy to Lovable Cloud

1. Open your project in Lovable
2. Click Share → Publish
3. Your app will be deployed with a public URL

### Custom Domain

1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) capable

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Row Level Security (RLS) in database
- HTTPS encryption
- Input validation and sanitization
- CORS protection
- Blockchain immutability

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
