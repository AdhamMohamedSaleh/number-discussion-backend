# Number Discussion Backend

A RESTful API backend for a collaborative number calculation platform where users can create calculation trees and respond to each other's calculations.

## Features

- User authentication (JWT-based)
- Calculation tree structure (parent-child relationships)
- CRUD operations for calculations
- PostgreSQL database
- Full test coverage with Jest
- Dockerized for easy deployment
- TypeScript for type safety
- **Security Features**:
  - Rate limiting (API, auth, and creation endpoints)
  - CORS protection with environment-based origins
  - Security headers (Helmet)
  - Request logging (Morgan)
  - Password hashing (bcrypt)
  - Input validation and sanitization

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + Supertest
- **Containerization**: Docker & Docker Compose

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info (protected)

### Calculations
- `GET /api/calculations` - Get all calculations (public)
- `GET /api/calculations/:id` - Get calculation tree by ID (public)
- `POST /api/calculations` - Create new calculation (protected)
- `POST /api/calculations/:id/respond` - Respond to a calculation (protected)

### Health Check
- `GET /health` - Service health status

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `created_at` - Timestamp

### Calculations Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `parent_id` - Foreign key to calculations (nullable, for tree structure)
- `value` - Decimal value of the calculation
- `operation` - Math operation (+, -, *, /)
- `operand` - The operand used in the calculation
- `created_at` - Timestamp

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- npm or yarn

### Setup with Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/AdhamMohamedSaleh/numer-discussion-backend.git
cd numer-discussion-backend
```

2. Start the services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3000

3. The database will be automatically initialized with the schema from `backend/src/config/init.sql`

### Setup without Docker

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/number_discussion
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

3. Set up PostgreSQL database:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE number_discussion;"

# Run initialization script
psql -U postgres -d number_discussion -f backend/src/config/init.sql
```

4. Start the development server:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
cd backend
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Production Build

1. Build the TypeScript code:
```bash
cd backend
npm run build
```

2. Start the production server:
```bash
npm start
```

## Deployment

### Railway Deployment

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Create a new project and provision PostgreSQL:
```bash
railway init
railway add --database postgres
```

4. Set environment variables in Railway dashboard:
```
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

5. Deploy:
```bash
railway up
```

The `DATABASE_URL` will be automatically set by Railway.

### Environment Variables

Required environment variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs for CORS (e.g., `https://app.vercel.app,https://www.app.com`)

## Project Structure

```
number-discussion-backend/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts      # Database connection
│   │   │   └── init.sql         # Database schema
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── calculations.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   └── calculation.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── calculations.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── calculations.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts             # Entry point
│   ├── tests/
│   │   ├── auth.test.ts
│   │   └── calculations.test.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## Security Considerations

- **Rate Limiting**: Prevents brute force attacks and API abuse
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 5 attempts per 15 minutes
  - Creation endpoints: 10 requests per minute
- **CORS Protection**: Environment-based origin restrictions
- **Security Headers**: Helmet middleware for XSS, clickjacking protection
- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request body size limits and sanitization
- **SQL Injection Prevention**: Parameterized queries
- **Request Logging**: Morgan middleware for monitoring and debugging

For detailed security information, see [SECURITY.md](backend/SECURITY.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything passes
5. Submit a pull request

## License

ISC

## Author

Adham Mohamed Saleh
