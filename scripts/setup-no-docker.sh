#!/bin/bash

echo "🚀 Setting up Meri Dukaan Backend (Without Docker)..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created."
        echo "⚠️  Please edit .env file and update DATABASE_URL with your PostgreSQL connection string"
        echo "   Format: postgresql://USERNAME@localhost:5432/meri_dukaan?schema=public"
        echo "   Or: postgresql://postgres:postgres@localhost:5432/meri_dukaan?schema=public"
        read -p "Press Enter after you've updated .env file..."
    else
        echo "❌ .env.example not found. Creating basic .env..."
        cat > .env << EOF
DATABASE_URL="postgresql://$(whoami)@localhost:5432/meri_dukaan?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
STORAGE_PATH="./storage"
NODE_ENV=development
EOF
        echo "✅ Basic .env created. Please update DATABASE_URL if needed."
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found in PATH."
    echo "   Please install PostgreSQL:"
    echo "   - Homebrew: brew install postgresql@15"
    echo "   - Or download from: https://postgresapp.com/"
    echo ""
    read -p "Press Enter to continue anyway (you'll need to set up PostgreSQL manually)..."
else
    echo "✅ PostgreSQL version: $(psql --version)"
fi

# Check if database exists
echo "🔍 Checking database connection..."
if psql -lqt | cut -d \| -f 1 | grep -qw meri_dukaan 2>/dev/null; then
    echo "✅ Database 'meri_dukaan' exists"
else
    echo "⚠️  Database 'meri_dukaan' not found."
    echo "   Creating database..."
    
    # Try to create database
    if createdb meri_dukaan 2>/dev/null; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database automatically."
        echo "   Please create it manually:"
        echo "   createdb meri_dukaan"
        echo "   Or: psql postgres -c 'CREATE DATABASE meri_dukaan;'"
        read -p "Press Enter after creating the database..."
    fi
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client. Check your DATABASE_URL in .env"
    exit 1
fi

# Run migrations
echo "📦 Running database migrations..."
npm run prisma:migrate

if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Check your database connection."
    exit 1
fi

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

if [ $? -ne 0 ]; then
    echo "⚠️  Seed failed, but continuing..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running:"
echo "   - If using Homebrew: brew services start postgresql@15"
echo "   - If using Postgres.app: Open the app"
echo ""
echo "2. Start the development server:"
echo "   npm run start:dev"
echo ""
echo "3. Default password for all users: password123"
echo ""
echo "4. Test the API:"
echo "   curl -X POST http://localhost:3000/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@meridukaan.com\",\"password\":\"password123\"}'"

