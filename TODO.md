# Development TODO

## High Priority
- [x] Implement JWT authentication utilities ✓ (Nov 27)
- [x] Create authentication routes (login, register, logout)
  - [x] Register endpoint ✓
  - [x] Login endpoint ✓  
  - [x] /me, /profile, /leaderboard - TODO
- [x] Complete server-with-auth.js implementation
- [ ] Create AuthService for Angular
- [ ] Update SocketService to include JWT authentication
- [ ] Integrate user authentication with game rooms

## Medium Priority
- [ ] Improve UI/UX design
  - [ ] Update color scheme
  - [ ] Add custom themes
  - [ ] Improve typography
  - [ ] Add animations
- [ ] Integrate external trivia API
- [ ] Add question difficulty levels
- [ ] Implement game history tracking

## Low Priority
- [ ] Add sound effects
- [ ] Create mobile-responsive design improvements
- [ ] Add chat functionality between players
- [ ] Implement spectator mode
- [ ] Add more question categories

## Bug Fixes
- [ ] Fix socket disconnection edge cases
- [ ] Improve error handling in room creation/joining
- [ ] Add timeout handling for inactive games

## Testing
- [ ] Write unit tests for services
- [ ] Write integration tests for Socket.IO events
- [ ] Add E2E tests for game flow

## Documentation
- [ ] Add API documentation
- [ ] Document database schema
- [ ] Create architecture diagrams
- [ ] Add code comments