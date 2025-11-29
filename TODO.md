# Development TODO

> ⚠️ **Note:** `scripts/start.sh` does not work currently because the frontend is not fully set up. Run backend only with `node server-with-auth.js`.

## Completed ✅

### Backend Authentication (Nov 27-29)
- [x] Implement JWT authentication utilities (`auth/jwt.js`)
- [x] Create User model with Sequelize (`database/models/user.js`)
  - [x] Password hashing with bcrypt
  - [x] Game statistics tracking (gamesPlayed, gamesWon, totalScore)
  - [x] Display name and color customization
- [x] Create authentication routes (`routes/auth/auth.js`)
  - [x] POST `/register` - User registration
  - [x] POST `/login` - User login with JWT response
  - [x] GET `/me` - Get current user info
  - [x] PUT `/profile` - Update user profile
  - [x] GET `/leaderboard` - Get top players
- [x] Complete `server-with-auth.js` implementation
  - [x] Socket.IO authentication middleware
  - [x] JWT token verification for socket connections
  - [x] Player info attached to socket connections
  - [x] Game statistics updated after each game

## High Priority - Frontend Integration 🚧

- [ ] Create AuthService for Angular
  - [ ] Login/register methods
  - [ ] JWT token storage
  - [ ] Auth state management
- [ ] Update SocketService to include JWT authentication
  - [ ] Pass token in socket handshake
  - [ ] Handle authentication errors
- [ ] Create login/register components
- [ ] Add auth guards for protected routes
- [ ] Display user info and stats in UI

## Medium Priority

- [ ] Improve UI/UX design
  - [ ] Update color scheme
  - [ ] Add custom themes
  - [ ] Improve typography
  - [ ] Add animations
- [ ] Integrate external trivia API (Open Trivia DB)
- [ ] Add question difficulty levels
- [ ] Implement game history tracking
- [ ] Add user profile page with stats

## Low Priority

- [ ] Add sound effects
- [ ] Create mobile-responsive design improvements
- [ ] Add chat functionality between players
- [ ] Implement spectator mode
- [ ] Add more question categories
- [ ] Add avatar/profile picture support

## Bug Fixes

- [ ] Fix `endGame` logic bug (line 359: condition should be `if (user)` not `if (!user)`)
- [ ] Fix socket disconnection edge cases
- [ ] Improve error handling in room creation/joining
- [ ] Add timeout handling for inactive games

## Testing

- [ ] Write unit tests for services
- [ ] Write integration tests for Socket.IO events
- [ ] Add E2E tests for game flow
- [ ] Test authentication flow

## Documentation

- [x] Update README with current progress
- [x] Document API endpoints
- [x] Document Socket.IO events
- [ ] Create architecture diagrams
- [ ] Add code comments
