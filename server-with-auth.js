/**
 * We are updating the server.js file to include authentication
 * 
 * This version will integrate:
 *  1. Database and user authentication
 *  2. JWT token verification for socket connections
 *  3. User statistics tracking
 *  4. All existing game functionality
 * 
 * New features:
 *  - Users must be authenticated to play
 *  - Game results will be tracked and stored in the database
 *  - Real time leaderboard updates
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeDatabase } = require('./database/config');
const authRoutes = require('./routes/auth/auth');
const User = require('./database/models/user');
const { verifyToken } = require('./auth/jwt');

const app = express();

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// Adding the authentication routes
app.use('/api/auth', authRoutes);

// Basic system health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200", // Angular default
        methods: ["GET", "POST"] 
    }
});

// Questions will remain the same as in the server.js file
// Questions remain the same
const QUESTIONS = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "Who painted the Mona Lisa?",
      options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correctAnswer: 3
    },
    {
      id: 5,
      question: "In what year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: 2
    },
    {
      id: 6,
      question: "What is the smallest prime number?",
      options: ["0", "1", "2", "3"],
      correctAnswer: 2
    },
    {
      id: 7,
      question: "Which element has the chemical symbol 'O'?",
      options: ["Gold", "Oxygen", "Osmium", "Silver"],
      correctAnswer: 1
    },
    {
      id: 8,
      question: "How many continents are there?",
      options: ["5", "6", "7", "8"],
      correctAnswer: 2
    },
    {
      id: 9,
      question: "What is the speed of light?",
      options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "200,000 km/s"],
      correctAnswer: 0
    },
    {
      id: 10,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Dickens", "Shakespeare", "Austen", "Hemingway"],
      correctAnswer: 1
    }
];

// Store the active rooms in an object
const rooms = {};

// Generate a random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Auth middleware for socket connections
 * 
 * This will be running before socket connection is established
 * It verifies the JWT token in the Authorization header
 */
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication token is required'));
        }

        const decoded = await verifyToken(token);

        if (!decoded) {
            return next(new Error('Invalid or Expired token'));
        }

        // Get the full user from the database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach the user to the socket object
        socket.userId = user.id;
        socket.username = user.username;
        socket.user = user.toSafeObject();

        next();
    } catch (error) {
        console.error("Error in socket authentication:", error);
        next(new Error('Authentication failed'));
    }
});

// Now the socket connection is authenticated, we can start handling events
io.on('connection', (socket) => {
    console.log(`User ${socket.username} connected (ID: ${socket.userId})`);

    // Send the user's data to the client
    socket.emit('authenticated', {
        user: socket.user,
    })

    // Create room event
    socket.on('create-room', () => {
        const roomId = generateRoomId();

        rooms[roomId] = {
            id: roomId,
            players: [{
                socketId: socket.id,
                userId: socket.userId,
                username: socket.username,
                displayName: socket.user.displayName,
                color: socket.user.color,
                score: 0,
                answered: false
            }],
            currentQuestionIndex: 0,
            gameStarted: false
        };

        socket.join(roomId);

        socket.emit('room-created', {
            roomId: roomId,
            playerNumber: 1,
            player: rooms[roomId].players[0]
        });

        console.log(`Room ${roomId} created by ${socket.username}`);
    });

    // Join room event
    socket.on('join-room', (roomId) => {
        const room = rooms[roomId];
        
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        const player = {
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username,
            displayName: socket.user.displayName,
            color: socket.user.color,
            score: 0,
            answered: false
        };

        room.players.push(player);

        socket.join(roomId);

        // Notify both players with player info
        socket.emit('room-joined', {
            roomId: roomId,
            playerNumber: room.players.length,
            player: player
        });

        io.to(roomId).emit('player-joined', {
            playerCount: room.players.length,
            players: room.players
        });
        
        // Start game when 2 players are in 
        // TODO: Change this to more players later
        if (room.players.length === 2) {
            room.gameStarted = true;

            io.to(roomId).emit('question', {
                question: QUESTIONS[0],
                questionNumber: 1,
                totalQuestions: QUESTIONS.length
            });

            console.log(`Game started in room ${roomId}`);
        }
        console.log(`Player ${socket.username} joined room ${roomId}`);
    });

    // Submit answer event
    socket.on('submit-answer', async ({ roomId, answerIndex }) => {
        const room = rooms[roomId];

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        const player = room.players.find(p => p.socketId === socket.id);

        if (!player || player.answered) {
            return; // Player already answered or doesn't exist
        }

        player.answered = true;

        const currentQuestion = QUESTIONS[room.currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.correctAnswer;

        if (isCorrect) {
            player.score += 1;
        }

        socket.emit('answer-result', {
            correct: isCorrect,
            correctAnswer: currentQuestion.correctAnswer
        });

        // Now we check if both players have answered
        const allAnswered = room.players.every(p => p.answered);
        if (allAnswered) {
            // Flags need to be reset for the next question
            room.players.forEach(p => p.answered = false);
            room.currentQuestionIndex += 1;

            if (room.currentQuestionIndex < QUESTIONS.length) {
                // Send next question after a delay
                setTimeout(() => {
                    io.to(roomId).emit('question', {
                        question: QUESTIONS[room.currentQuestionIndex],
                        questionNumber: room.currentQuestionIndex + 1,
                        totalQuestions: QUESTIONS.length
                    });
                }, 2000);
            } else {
                // We reached the end, so the game is now over, we emit game-over event to both players
                await endGame(roomId, room);
            }
        }
    });

    // Now we need to handle the disconnect event
    socket.on('disconnect', async () => {
        console.log(`User ${socket.username} disconnected (ID: ${socket.userId})`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.socketId === socket.id);

            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomId).emit('player-left');

                if (room.players.length === 0) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} deleted`);
                }
                console.log(`Player ${socket.username} left room ${roomId}`);
                break;
            }
        }
    });
});

/**
 * Helper function to end the game
 * 
 * Called when the game is over, updates user statisics in the database
 * 
 * @param {string} roomId - The ID of the room
 * @param {Object} room - The room object
 */
async function endGame(roomId, room) {
    try {
        const scores = room.players.map(p => ({
            socketId: p.socketId,
            userId: p.userId,
            username: p.username,
            displayName: p.displayName,
            color: p.color,
            score: p.score
        }));

        // Determine the winner of the game
        const sortedScores = scores.sort((a, b) => b.score - a.score);
        const winnerId = sortedScores[0].userId > sortedScores[1].score
            ? sortedScores[0].userId
            : null;
        
            // Update each player's statistics in the database
            for (const player of room.players) {
                const user = await User.findByPk(player.userId);

                if (!user) {
                    user.gamesPlayed += 1;
                    user.totalScore += player.score;

                    // Check if player won
                    if (winnerId && player.userId === winnerId) {
                        user.gamesWon += 1;
                    }

                    await user.save();

                    console.log(`Updated user ${user.username} statistics: Games Played: ${user.gamesPlayed}, Total Score: ${user.totalScore}, Games Won: ${user.gamesWon}`);
                }
            }

            io.to(roomId).emit('game-over', {
                scores,
                winnerId
            });

            console.log(`Game in room ${roomId} ended`);
    } catch (error) {
        console.error("Error ending game:", error);
    }
}

/**
 * Start the server
 */
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await initializeDatabase();

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}
                        Database connected successfully
                        Authentication middleware is active`);
                    });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();