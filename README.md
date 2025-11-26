# Trivia Game

A real-time multiplayer trivia game built with Angular, Node.js, Socket.IO, and Express. Two players compete head-to-head in a private room, answering trivia questions and tracking scores in real-time.

## Features

- Real-time multiplayer gameplay
- Private room system with unique room codes
- Live score tracking
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
- JWT (Authentication - in progress)

## Project Structure
```
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   └── services/
│   └── ...
├── server.js              # Main server (basic version)
├── server-with-auth.js    # Server with authentication (WIP)
├── database/              # Database models and config
│   ├── models/
│   └── config.js
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

3. Install client dependencies
```bash
cd client
npm install
cd ..
```

### Running the Application

1. Start the backend server
```bash
node server.js
```
The server will run on `http://localhost:3000`

2. In a new terminal, start the Angular development server
```bash
cd client
npm start
```
The client will run on `http://localhost:4200`

3. Open your browser and navigate to `http://localhost:4200`

## How to Play

1. **Create a Room**: Click "Create Room" to generate a unique room code
2. **Share Code**: Share the room code with another player
3. **Join Game**: The second player enters the room code and clicks "Join Room"
4. **Play**: Answer 10 trivia questions and compete for the highest score!
5. **See Results**: View final scores and play again

## Development Roadmap

See [TODO.md](./TODO.md) for current development tasks and future features.

### Planned Features
- [ ] JWT authentication system
- [ ] User accounts and profiles
- [ ] Statistics tracking
- [ ] Leaderboard system
- [ ] Dynamic question API integration
- [ ] Enhanced UI/themes
- [ ] More game modes

## Database Schema

The application uses SQLite with Sequelize ORM. User model includes:
- Username, email, password (hashed)
- Display name and color customization
- Game statistics (games played, won, total score)

## API Documentation

### Socket.IO Events

**Client → Server**
- `create-room`: Create a new game room
- `join-room`: Join an existing room with room ID
- `submit-answer`: Submit an answer for the current question

**Server → Client**
- `room-created`: Room creation confirmation
- `room-joined`: Room join confirmation
- `player-joined`: Notification when another player joins
- `question`: New question data
- `answer-result`: Feedback on submitted answer
- `game-over`: Final scores and game completion
- `player-left`: Notification when a player disconnects
- `error`: Error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Trivia questions are currently hardcoded (API integration planned)
- Built as a learning project for real-time web applications