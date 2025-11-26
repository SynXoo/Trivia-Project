/**
 * Old implmentation replaced with server-with-auth.js which has authentication and authorization
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Creating the express app and using cors to allow requests from the frontend
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // Planning on using Angular, could do React instead
    methods: ["GET", "POST"] // Security reasons, we don't want to allow any other methods
  }
});

// Temporary hardcoded questions, will pull from an api later
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

// Store active rooms in an object
const rooms = {};

// Will need to become more secure later
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create room event
  socket.on('create-room', () => {
    const roomId = generateRoomId();
    
    /**
     * Initialize room and add to object: name[key] = value
     * The room has these behaviors:
     * Game is not started yet
     * Only one player has joined, the creator
     * The current question index is 0
     */
    rooms[roomId] = {
      id: roomId,
      players: [{
        id: socket.id,
        score: 0,
        answered: false
      }],
      currentQuestionIndex: 0,
      gameStarted: false
    };

    // Join the socket to this room
    socket.join(roomId);

    // Send room info back to creator
    socket.emit('room-created', {
      roomId: roomId,
      playerNumber: 1
    });

    console.log(`Room ${roomId} created by ${socket.id}`);
  });

  // Join room event
  socket.on('join-room', (roomId) => {
    const room = rooms[roomId];
    /**
     * If the room is not found, send an error to the player
     * If the room is found, check if it is full
     * If the room is full, send an error to the player
     * If the room is not full, add the player to the room
     * Join the socket to this room
     * Notify both players
     * Start game when 2 players are in
     */
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Add player to room
    room.players.push({
      id: socket.id,
      score: 0,
      answered: false
    });

    socket.join(roomId);

    // Notify both players
    socket.emit('room-joined', {
      roomId: roomId,
      playerNumber: 2
    });

    io.to(roomId).emit('player-joined', {
      playerCount: room.players.length
    });

    // Start game when 2 players are in
    if (room.players.length === 2) {
      room.gameStarted = true;
      
      // Send first question to both players
      io.to(roomId).emit('question', {
        question: QUESTIONS[0],
        questionNumber: 1,
        totalQuestions: QUESTIONS.length
      });
    }

    console.log(`Player ${socket.id} joined room ${roomId}`);
  });

  // Submit answer event
  socket.on('submit-answer', ({ roomId, answerIndex }) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    
    if (!player || player.answered) {
      return; // Player already answered or doesn't exist
    }

    // The player has answered the question
    player.answered = true;

    // Simple check, will need to become more secure later
    const currentQuestion = QUESTIONS[room.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      player.score += 1;
    }

    // Send feedback to this player
    socket.emit('answer-result', {
      correct: isCorrect,
      correctAnswer: currentQuestion.correctAnswer
    });

    // Check if both players have answered
    const allAnswered = room.players.every(p => p.answered);

    if (allAnswered) {
      // Flags need to be reset for the next question
      room.players.forEach(p => p.answered = false);

      // Move to next question or end game
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
        const scores = room.players.map(p => ({
          playerId: p.id,
          score: p.score
        }));

        io.to(roomId).emit('game-over', { scores });
        
        console.log(`Game in room ${roomId} ended`);
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Loops through all rooms and finds the player that disconnected
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        // Notify other players
        io.to(roomId).emit('player-left');

        // Delete room if empty
        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
        }
        break;
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});