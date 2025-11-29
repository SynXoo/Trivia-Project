/**
 * Authentication routes
 * 
 * This file will define all the API endpoints for authentication
 * - POST /api/auth/register - Create a new account
 * - POST /api/auth/login - Login to an existing account
 * - GET /api/auth/me - Get the current user's information
 * - PUT /api/auth/profile - Update the current user's profile
 * - GET api/auth/leaderboard - Get the leaderboard
 */

const express = require('express');
const router = express.Router();
const User = require('../../database/models/user');
const {generateToken, authenticateToken, optionalAuth} = require('../../auth/jwt');

/**
 * POST /api/auth/register - Create a new account
 * 
 * Request Body:
 * {
 *  "username": "string",
 *  "email": "string",
 *  "password": "string"
 *  "displayName": "string" - Optional
 *  "color": "string" - Optional
 * }
 * 
 * Response:
 * {
 *  "user": {user data},
 *  "token": "JWT token"
 * }
 */
router.post('/register', async (req, res) => {
    try {
        const {username, email, password, displayName, color} = req.body;

        // Validate required fields
        // 400 Bad Request
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email, and password are required"
            });
        }

        // Check if username exists, using the class method from the User model
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(409).json({ // 409 Conflict Error
                error: "Username already exists"
            });
        }

        // Check if email exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ // 409 Conflict Error
                error: "Email already exists"
            });
        }

        // Create the user
        // Password will be automatically hashed by the beforeCreate hook in the User model
        const user = await User.create({
            username,
            email,
            password,
            displayName: displayName || username,
            color: color || '#4CAF50' // Default green color
        });

        // Generate JWT token
        const token = generateToken(user);

        // Send the response
        res.status(201).json({ // 201 Created
            message: "Account created successfully",
            user: user.toSafeObject(), // This was done to exclude the password because toJSON wont
            token: token
        });

        console.log(`New user created: ${user.username}`); // Log the new user creation for debugging

    } catch (error) {
        console.error("Error creating user:", error);

        // We will handle the validation errors in the model
        // Perhaps the username is too short or the email is not valid
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                // error: "Validation error: " + error.message This is actually redundant, changing
                error: 'Validation error: ',
                details: error.errors.map(e => ({ // Adding a more detailed error message
                    field: e.path,
                    message: e.message,
                    type: e.type,
                }))
            });
        }
        // For other errors, send a generic error message, this will be a server error
        res.status(500).json({ 
            error: 'Error creating account, Please try again later.'
        });
    }
});

/**
 * POST /api/auth/login - Login to an existing account
 * 
 * Request Body:
 * {
 *  "username": "string", - Can also be email
 *  "password": "string"
 * }
 * 
 * Response:
 * {
 *  "user": {user data},
 *  "token": "JWT token"
 * }
 */
router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required"
            });
        }

        // Find the user by username or email
        let user = await User.findByUsername(username); // Good for using LET keyword!
        if (!user) {
            user = await User.findByEmail(username);
        }
        
        // User not found case or invalid email
        if (!user) {
            return res.status(401).json({ // 401 Unauthorized Error
                error: "Invalid username or password"
            });
        }

        // Password validation
        const isValidPassword = await user.validPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ // 401 Unauthorized Error
                error: "Invalid username or password"
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Send the response
        res.json({
            message: "Login successful",
            user: user.toSafeObject(),
            token: token
        });

        // Log the login for debugging
        // If the user logged in with email, it still gets the user's username not the email
        // console.log(`User ${username} logged in`);
        // This should work better amd less confusing for debugging
        console.log(`User ${user.username} logged in`); 

    } catch (error) {
        console.error("Error logging in:", error);

        res.status(500).json({
            error: 'Error logging in, Please try again later.'
        });
    }
});

/**
 * GET /api/auth/me - Get the current user's information
 * 
 * Requires authorization: "Bearer JWT token"
 * 
 * Response:
 * {
 *  "user": {user data},
 * }
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // req.user is the user object from the JWT token (id, username)
        // We need to fetch all the user data from the database
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json({
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error("Error getting user information:", error);
        res.status(500).json({
            error: 'Error getting user information, Please try again later.'
        });
    }
});

/**
 * PUT /api/auth/profile - Update the current user's profile
 * 
 * Will require authorization: "Bearer JWT token"
 * 
 * Request Body: - Might change anything
 * {
 *  "displayName": "string",
 *  "color": "string"
 *  "email": "string
 *  "password": "string"
 * }
 * 
 * Response:
 * {
 *  "user": {updated user data},
 * }
 */

router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const {displayName, color, email, password} = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ // 404 Not Found Error
                error: "User not found"
            });
        }

        // Will update fields if they are provided
        if (displayName !== undefined) {
            user.displayName = displayName;
        }
        if (color !== undefined) {
            user.color = color;
        }
        if (email !== undefined) { // Will check if the email is already taken
            const existingEmail = await User.findByEmail(email);
            if (existingEmail && existingEmail.id !== user.id) {
                return res.status(409).json({ // 409 Conflict Error
                    error: "Email already exists"
                });
            }
            // Email is valid and not taken, update the user's email
            user.email = email;
        }

        if (password !== undefined) {
            user.password = password; // Will be hashed by the beforeCreate hook in the User model
        }

        await user.save(); // Saving the user to the database

        res.json({
            message: "Profile updated successfully",
            user: user.toSafeObject()
        });

        console.log(`User ${user.username} updated their profile`);
    } catch (error) {
        console.error("Error updating profile:", error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ // 400 Bad Request Error
                error: 'Validation error: ',
                details: error.errors.map(e => ({ // Adding a more detailed error message
                    field: e.path,
                    message: e.message,
                    type: e.type,
                }))
            });
        }

        // For other errors, send a generic error message, this will be a server error
        res.status(500).json({
            error: 'Error updating profile, Please try again later.'
        });
    }
});

/**
 * GET /api/auth/leaderboard - Get the leaderboard
 * 
 * Query Parameters:
 *  - "limit" (number) - The number of users to return (default: 10)
 * 
 * Response:
 * {
 *  "Leaderboard": [
 *      {
 *          "username": "string",
 *          "displayName": "string",
 *          "gamesWon": "number",
 *          "totalGames": "number",
 *          "totalScore": "number",
 *      } ...
 * }
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const leaderboard = await User.getLeaderboard(limit);

        // Format the leaderboard data
        const formattedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            displayName: user.displayName,
            color: user.color,
            gamesPlayed: user.gamesPlayed,
            gamesWon: user.gamesWon,
            totalScore: user.totalScore,
            winRate: user.winRate,
        }));

        res.json({
            leaderboard: formattedLeaderboard
        });
        
        console.log("Leaderboard fetched successfully");
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        
        res.status(500).json({ // 500 Internal Server Error
            error: 'Error fetching leaderboard, Please try again later.'
        });
    }
});



module.exports = router;