import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private serverUrl = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.serverUrl);
  }

  // Sends data to server, these were defined in the server.js file, some pass in args
  createRoom(): void {
    this.socket.emit('create-room');
  }

  joinRoom(roomId: string): void {
    this.socket.emit('join-room', roomId);
  }

  submitAnswer(roomId: string, answerIndex: number): void {
    this.socket.emit('submit-answer', { roomId, answerIndex });
  }

  /**
   * Listens to server updates, each method returns an RxJS Observable
   * @returns An Observable that emits the data from the server
   */
  onRoomCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('room-created', (data) => {
        observer.next(data);
      });
    });
  }

  onRoomJoined(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('room-joined', (data) => {
        observer.next(data);
      });
    });
  }

  onPlayerJoined(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('player-joined', (data) => {
        observer.next(data);
      });
    });
  }

  onQuestion(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('question', (data) => {
        observer.next(data);
      });
    });
  }

  onAnswerResult(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('answer-result', (data) => {
        observer.next(data);
      });
    });
  }

  onGameOver(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('game-over', (data) => {
        observer.next(data);
      });
    });
  }

  onError(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('error', (data) => {
        observer.next(data);
      });
    });
  }

  onPlayerLeft(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('player-left', () => {
        observer.next(null);
      });
    });
  }
}