import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from './services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // Game states, these are the only states the game can be in
  gameState: 'home' | 'waiting' | 'playing' | 'finished' = 'home';
  
  // Store the game data, these are the only data that needs to be stored for the game
  roomId: string = '';
  roomIdInput: string = '';
  playerNumber: number = 0;
  playerCount: number = 0;

  // Question info
  currentQuestion: any = null;
  questionNumber: number = 0;
  totalQuestions: number = 0;
  selectedAnswer: number | null = null;
  answered: boolean = false;
  answerResult: { correct: boolean; correctAnswer: number } | null = null;

  // Game over
  finalScores: any[] = [];

  // Error handling
  errorMessage: string = '';

  private subscriptions: Subscription[] = [];

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setupSocketListeners(): void {
    // Room created
    this.subscriptions.push(
      this.socketService.onRoomCreated().subscribe((data) => {
        this.roomId = data.roomId;
        this.playerNumber = data.playerNumber;
        this.gameState = 'waiting';
        console.log('Room created:', data);
      })
    );

    // Room joined
    this.subscriptions.push(
      this.socketService.onRoomJoined().subscribe((data) => {
        this.roomId = data.roomId;
        this.playerNumber = data.playerNumber;
        this.gameState = 'waiting';
        console.log('Room joined:', data);
      })
    );

    // Player joined
    this.subscriptions.push(
      this.socketService.onPlayerJoined().subscribe((data) => {
        this.playerCount = data.playerCount;
        console.log('Player joined. Total players:', data.playerCount);
      })
    );

    // Question received
    this.subscriptions.push(
      this.socketService.onQuestion().subscribe((data) => {
        this.currentQuestion = data.question;
        this.questionNumber = data.questionNumber;
        this.totalQuestions = data.totalQuestions;
        this.gameState = 'playing';
        this.selectedAnswer = null;
        this.answered = false;
        this.answerResult = null;
        console.log('Question received:', data);
      })
    );

    // Answer result
    this.subscriptions.push(
      this.socketService.onAnswerResult().subscribe((data) => {
        this.answerResult = data;
        console.log('Answer result:', data);
      })
    );

    // Game over
    this.subscriptions.push(
      this.socketService.onGameOver().subscribe((data) => {
        this.finalScores = data.scores;
        this.gameState = 'finished';
        console.log('Game over:', data);
      })
    );

    // Error
    this.subscriptions.push(
      this.socketService.onError().subscribe((data) => {
        this.errorMessage = data.message;
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Error:', data);
      })
    );

    // Player left
    this.subscriptions.push(
      this.socketService.onPlayerLeft().subscribe(() => {
        alert('Other player left the game!');
        this.resetGame();
      })
    );
  }

  createRoom(): void {
    this.socketService.createRoom();
  }

  joinRoom(): void {
    if (this.roomIdInput.trim()) {
      this.socketService.joinRoom(this.roomIdInput.toUpperCase());
    }
  }

  selectAnswer(index: number): void {
    if (!this.answered) {
      this.selectedAnswer = index;
    }
  }

  submitAnswer(): void {
    if (this.selectedAnswer !== null && !this.answered) {
      this.answered = true;
      this.socketService.submitAnswer(this.roomId, this.selectedAnswer);
    }
  }

  resetGame(): void {
    this.gameState = 'home';
    this.roomId = '';
    this.roomIdInput = '';
    this.playerNumber = 0;
    this.playerCount = 0;
    this.currentQuestion = null;
    this.selectedAnswer = null;
    this.answered = false;
    this.answerResult = null;
    this.finalScores = [];
  }

  getMyScore(): number {
    if (this.finalScores.length === 0) return 0;
    const myScore = this.finalScores.find(s => s.playerId === this.getMySocketId());
    return myScore ? myScore.score : 0;
  }

  getOpponentScore(): number {
    if (this.finalScores.length === 0) return 0;
    const opponentScore = this.finalScores.find(s => s.playerId !== this.getMySocketId());
    return opponentScore ? opponentScore.score : 0;
  }

  private getMySocketId(): string {
    // We'd need to expose socket.id from the service for this
    // For now, we'll use player number
    return this.finalScores[this.playerNumber - 1]?.playerId || '';
  }
}
