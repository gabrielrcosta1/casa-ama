# E-commerce Application

## Overview

This is a modern full-stack e-commerce application built with React, Express, and PostgreSQL. The application features a product catalog, shopping cart functionality, and order management system. It uses a memory-based storage system for development that can be easily replaced with a PostgreSQL database implementation.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, React Context for cart state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Session-based cart storage using localStorage session IDs
- **API Design**: RESTful API with JSON responses

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend application
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Data Models
The application uses the following core entities:
- **Categories**: Product categorization
- **Products**: Main product catalog with pricing, ratings, and metadata
- **Cart Items**: Session-based shopping cart entries
- **Orders**: Order records with status tracking
- **Order Items**: Individual products within orders

### Storage Layer
- **Interface**: `IStorage` defines the contract for data operations
- **Implementation**: `DatabaseStorage` provides PostgreSQL database storage for production
- **Database**: Drizzle ORM configured for PostgreSQL with schema migrations and relations

### Authentication & Sessions
- Session management using client-side generated session IDs
- No user authentication system currently implemented
- Cart persistence tied to browser session storage

## Data Flow

1. **Product Browsing**: Client fetches products with filtering, sorting, and search capabilities
2. **Cart Management**: Items added to cart are stored by session ID, persisted in localStorage
3. **Order Processing**: Cart items converted to order records with atomic transactions
4. **State Synchronization**: React Query manages server state caching and invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across the stack
- **Drizzle Kit**: Database migration tool

## Deployment Strategy

### Development
- Frontend served via Vite dev server with HMR
- Backend runs with `tsx` for TypeScript execution
- Database migrations applied with `drizzle-kit push`

### Production
- Frontend built to static assets in `dist/public`
- Backend bundled with `esbuild` to `dist/index.js`
- Database connection via `DATABASE_URL` environment variable
- Static file serving handled by Express in production

### Environment Configuration
- **Development**: `NODE_ENV=development`
- **Production**: `NODE_ENV=production`
- **Database**: `DATABASE_URL` required for PostgreSQL connection

Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Added PostgreSQL database with Drizzle ORM, replaced MemStorage with DatabaseStorage, seeded with Portuguese product data
- July 02, 2025. Added complete customer authentication system with registration and login
- July 02, 2025. Implemented Stripe payment integration with checkout workflow, order management, and payment processing
- July 22, 2025. Implemented supplier product integration allowing suppliers to sell products through the marketplace with automatic approval
- July 22, 2025. Added comprehensive password reset system with SendGrid email integration for all user types (admin, customers, suppliers)
- July 25, 2025. Created professional "Sobre Nós" (About Us) page with company information, mission, values, team, and certifications
- July 25, 2025. Created comprehensive "Contato" (Contact) page with contact form, company details, FAQ section, and multiple contact methods
- July 25, 2025. Created comprehensive "Carreiras" (Careers) page with job listings, application forms, company values, and benefits
- July 25, 2025. Created professional "Imprensa" (Press) page with press releases, media kit, awards, and journalist resources
- July 25, 2025. Created comprehensive "Blog" page with articles, categories, search functionality, and content management features
- July 25, 2025. Created comprehensive "Central de Ajuda" (Help Center) page with FAQ system, categories, search, and customer support features
- July 25, 2025. Created detailed "Devoluções" (Returns) page with step-by-step process, policies, forms, and support integration
- July 25, 2025. Created comprehensive "Informações de Envio" (Shipping) page with delivery options, zones, calculator, and tracking features
- July 25, 2025. Created interactive "Rastrear Pedido" (Track Order) page with real-time tracking, timeline, and customer support integration
- August 17, 2025. Implemented comprehensive "Termos de Uso" (Terms of Use) page with Amazon rainforest design theme, covering user accounts, purchase terms, supplier obligations, prohibited activities, liability limitations, and contact information with links in admin and supplier dashboards
- August 17, 2025. Created comprehensive "Política de Cookies" (Cookie Policy) page with amber/orange Amazon theme, detailing cookie types, third-party services, management options, browser instructions, and retention periods with links in admin and supplier dashboards
- August 17, 2025. Added 16 authentic Amazon rainforest products to the database including açaí, Brazil nuts, cupuaçu, guaraná, copaiba oil, indigenous crafts, medicinal teas, and forest honey with 4 new categories (Natural Foods, Natural Cosmetics, Handicrafts, Teas & Herbs)
- August 17, 2025. Updated all Amazon rainforest product images with high-quality, authentic photos from Unsplash, including primary and additional product gallery images for better visual representation
- August 17, 2025. Added 20 specialized Amazon rainforest product categories including Frutas Amazônicas, Castanhas e Sementes, Óleos Essenciais, Manteigas Naturais, Instrumentos Musicais, Cerâmica Amazônica, and others
- August 17, 2025. Reclassified existing products into specialized categories and added 10 new authentic Amazon products including murici, manteiga de murumuru, sabonetes artesanais, instrumentos musicais indígenas, and cerâmica marajoara

## Payment System

The application now includes a complete payment workflow using Stripe:

### Features
- Secure payment processing with Stripe Elements
- Order creation and tracking
- Payment confirmation and status updates
- Cart-to-order conversion
- Customer information collection
- Shipping address management
- Payment success page with order details

### Components
- `/checkout` - Main checkout page with customer info and payment form
- `/checkout/success` - Payment confirmation page
- Stripe integration with payment intents
- Order status tracking (pending, paid, processing, shipped, delivered, cancelled)
- Payment status tracking (unpaid, paid, failed, refunded)

### Security
- Server-side payment verification
- Secure Stripe secret key handling
- Payment intent confirmation before order completion

## Password Reset System

The application now includes a complete password recovery workflow for all user types:

### Features
- Secure token-based password reset system
- Email notifications via SendGrid integration
- Support for admin, customer, and supplier accounts
- Token expiration after 1 hour for security
- Single-use tokens to prevent replay attacks
- Comprehensive error handling and user feedback

### Workflow
1. User requests password reset via `/esqueci-senha` page
2. System generates secure token and sends email with reset link
3. User clicks link to access `/redefinir-senha` page with token
4. User enters new password and system validates token
5. Password updated and token marked as used
6. User redirected to appropriate login page

### Security Features
- Cryptographically secure token generation using crypto.randomBytes
- Token expiration and single-use validation
- Password hashing with bcryptjs
- Email verification before password reset
- User type validation to prevent unauthorized access

### API Endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/cleanup-tokens` - Remove expired tokens

## User Preferences

Preferred communication style: Simple, everyday language.