#!/bin/bash
# One-time setup script for Trivia Game project
# Run this once after cloning the repository: ./scripts/setup.sh

echo "🎮 Setting up Trivia Game..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v ng &> /dev/null; then
    echo "❌ Angular CLI is not installed."
    echo "   Install it with: npm install -g @angular/cli"
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Handle .env file
if [ ! -f .env ]; then
    echo "🔐 Creating .env file..."
    cat > .env << EOL
# Server Configuration
PORT=3000

# JWT Secret - IMPORTANT: Generate a new one for production!
JWT_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Database
NODE_ENV=development
EOL
    echo "✅ Created .env file with secure JWT secret"
else
    echo "✅ .env file already exists"
    
    # Check if JWT_SECRET_KEY exists in .env
    if ! grep -q "JWT_SECRET_KEY" .env; then
        echo "⚠️  Warning: JWT_SECRET_KEY not found in .env file"
        echo "   Please add it manually or delete .env to regenerate"
    fi
fi

# Initialize database
echo "🗄️  Initializing database..."
node -e "require('./database/config').initializeDatabase().then(() => console.log('Database ready!')).catch(console.error)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application, run:"
echo "  npm start"
echo ""
echo "Or use the start script:"
echo "  ./scripts/start.sh"
echo ""