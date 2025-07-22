# Répartiteur - Hospital Caregiver Planning System

A comprehensive Next.js application designed to help hospital administrators efficiently manage caregiver schedules and assignments. This system streamlines the complex task of organizing hospital staff across different branches, sectors, and missions while respecting various constraints and preferences.

## 🏥 Overview

Répartiteur is a specialized planning tool for healthcare institutions that enables:

- **Caregiver Management**: Register and manage all hospital caregivers with their specific schedules and preferences
- **Organizational Structure**: Organize hospital operations through a hierarchical system of branches, sectors, and missions
- **Intelligent Assignment**: Attribute branches and sectors to caregivers based on their skills and availability
- **Weekly Planning**: Generate optimized weekly schedules with built-in constraint management
- **Role-Based Access**: Multi-level user management with different permission levels

## ✨ Key Features

### 🧑‍⚕️ Caregiver Management

- Complete caregiver profiles with personal information
- Day/Night shift preferences
- Big week type scheduling (Even/Odd weeks)
- Color-coded identification
- Skills and sector assignments

### 🏢 Organizational Structure

- **Branches**: Top-level organizational units
- **Sectors**: Sub-divisions within branches  
- **Missions**: Specific tasks and assignments within sectors
- Hierarchical relationship management

### 📅 Planning & Scheduling

- Weekly planning generation
- Constraint-based assignment
- Mission requirements (min/max staff per mission)
- Schedule optimization algorithms
- Visual calendar interface

### 👥 User Management

- Multi-role system (User, Admin, SuperAdmin)
- Secure authentication with NextAuth.js
- Activity tracking and audit logs
- User creation and management workflows

### 📊 Administrative Tools

- Comprehensive dashboard
- Real-time planning adjustments
- Historical data management
- Export and reporting capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with React 19
- **UI Components**: Mantine UI library
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Forms**: Mantine Forms with Zod validation
- **Date Management**: Day.js
- **Icons**: React Icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd repartiteur
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   - `DATABASE_URL`: SQLite database path
   - `NEXTAUTH_SECRET`: Authentication secret
   - `NEXTAUTH_URL`: Application URL

4. **Initialize the database**

   ```bash
   npm run prisma:reset
   ```

   This command will:
   - Reset the database
   - Apply all migrations
   - Seed initial data

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema

The application uses a relational database with the following main entities:

- **Users**: Authentication and role management
- **Caregivers**: Hospital staff with scheduling preferences
- **Branches**: Top-level organizational units
- **Sectors**: Subdivisions within branches
- **Missions**: Specific tasks and roles
- **Assignments**: Schedule entries linking caregivers to missions
- **CaregiverSector**: Many-to-many relationship for sector assignments

## 🎯 Usage

### For Administrators

1. **Initial Setup**
   - Create organizational structure (branches, sectors, missions)
   - Register caregivers and assign them to branches
   - Configure sector assignments for each caregiver

2. **Weekly Planning**
   - Access the planning module
   - Set week parameters and constraints
   - Generate optimized schedules
   - Review and adjust assignments manually if needed

3. **Management**
   - Monitor caregiver availability
   - Adjust mission requirements
   - Handle schedule conflicts
   - Export planning data

### For Planners

- View assigned caregivers and their availability
- Create and modify assignments
- Handle last-minute changes
- Generate reports for specific periods

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:reset` - Reset database and reseed
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:db:push` - Push schema changes to database
- `npm run prisma:db:seed` - Seed database with initial data

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL="file:./src/generated/data/database.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Database

The application uses SQLite for development and can be configured for other databases in production. The Prisma schema supports:

- User roles and permissions
- Audit trails for all entities
- Soft deletion with archiving
- Optimistic concurrency control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software designed for hospital management systems.

## 🏥 About

Répartiteur was designed to address the complex scheduling challenges faced by healthcare institutions. The system takes into account the unique requirements of hospital operations, including:

- 24/7 coverage requirements
- Specialized skill matching
- Regulatory compliance
- Staff preferences and constraints
- Emergency coverage protocols

The application aims to reduce administrative overhead while ensuring optimal patient care through efficient staff allocation.
