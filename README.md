# Trivia Game

A real-time multiplayer trivia game built with Angular, Node.js, Socket.IO, and Express. Two players compete head-to-head in a private room, answering trivia questions and tracking scores in real-time.

## Current Status

🚧 **Work in Progress** - Backend authentication is complete, frontend integration pending.

> ⚠️ **Note:** `scripts/start.sh` does not currently work because the frontend is not fully set up yet. For now, run only the backend server with `node server-with-auth.js`.

## Features

- Real-time multiplayer gameplay
- Private room system with unique room codes
- Live score tracking
- JWT-based user authentication
- User statistics tracking (games played, won, total score)
- Responsive design
- 10 trivia questions per game

## Tech Stack

### Frontend
- Angular 19
- Socket.IO Client
- RxJS
- TypeScript

### Backend
- Node.js
- Express.js
- Socket.IO
- Sequelize (ORM)
- SQLite (Database)
- bcrypt (Password hashing)
- JWT (JSON Web Tokens)

## Project Structure
```
├── client/                 # Angular frontend (in progress)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   └── services/
│   └── ...
├── server.js              # Main server (basic version, no auth)
├── server-with-auth.js    # Server with full authentication ✅
├── auth/
│   └── jwt.js             # JWT utilities ✅
├── database/              # Database models and config
│   ├── models/
│   │   └── user.js        # User model with stats ✅
│   └── config.js          # Sequelize configuration ✅
├── routes/
│   └── auth/
│       └── auth.js        # Authentication routes ✅
├── scripts/
│   ├── setup.sh           # Project setup script
│   └── start.sh           # Start script (frontend not ready)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd <project-directory>
```

2. Install server dependencies
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
JWT_SECRET=your-secret-key-here
PORT=3000
```

### Running the Application

**Backend Only (Current State):**
```bash
node server-with-auth.js
```
The server will run on `http://localhost:3000`

**Full Application (Once Frontend is Ready):**
```bash
# Using the start script
./scripts/start.sh

# Or manually:
# Terminal 1: node server-with-auth.js
# Terminal 2: cd client && ng serve
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT token |
| GET | `/me` | Get current user info (requires auth) |
| PUT | `/profile` | Update user profile (requires auth) |
| GET | `/leaderboard` | Get top players leaderboard |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## How to Play

1. **Register/Login**: Create an account or login to get your JWT token
2. **Create a Room**: Click "Create Room" to generate a unique room code
3. **Share Code**: Share the room code with another player
4. **Join Game**: The second player enters the room code and clicks "Join Room"
5. **Play**: Answer 10 trivia questions and compete for the highest score!
6. **See Results**: View final scores - your stats are automatically saved!

## Development Roadmap

See [TODO.md](./TODO.md) for current development tasks and future features.

### Completed ✅
- JWT authentication system
- User registration and login
- Socket.IO authentication middleware
- User statistics tracking
- Game results saved to database

### In Progress 🚧
- Angular frontend integration
- AuthService for Angular
- SocketService JWT integration

### Planned 📋
- Enhanced UI/themes
- External trivia API integration
- More game modes
- Chat functionality

## Database Schema

The application uses SQLite with Sequelize ORM. User model includes:
- Username, email, password (hashed with bcrypt)
- Display name and color customization
- Game statistics (games played, won, total score)

## Socket.IO Events

### Authentication
Socket connections require a JWT token:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Client → Server
- `create-room`: Create a new game room
- `join-room`: Join an existing room with room ID
- `submit-answer`: Submit an answer for the current question

### Server → Client
- `authenticated`: Confirmation with user data
- `room-created`: Room creation confirmation with player info
- `room-joined`: Room join confirmation
- `player-joined`: Notification when another player joins (includes player list)
- `question`: New question data
- `answer-result`: Feedback on submitted answer
- `game-over`: Final scores, winner, and game completion
- `player-left`: Notification when a player disconnects
- `error`: Error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Trivia questions are currently hardcoded (API integration planned)
- Built as a learning project for real-time web applications
