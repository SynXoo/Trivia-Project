/**
 * User model
 * 
 * The file defines the user table structure and includes methods for:
 *  - Password hashing and validation
 *  - Safe user data serialization
 * 
 * Sequelize will automatically add id, createdAt, and updatedAt columns
 */

const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('./config');

 const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 20],
            isalphanumeric: true,
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 100],
            notEmpty: true
        }
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '', // Setting this to the username by default
        validate: {
            len: [0, 50]
        }
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#4CAF50',
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/, // Validates the color is a hex code
        }
    },
    /**
     * Fields for game statistics, keeping it simple for now
     * Will be expanded later
     */
    gamesPlayed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    gamesWon: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    totalScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true, // Will add createdAt and updatedAt columns
    /**
     * Hooks for password hashing and validation
     * 
     * Will run code before or after certain events
     * This is good for password hashing and validation
     */
    hooks: {
        /**
         * Before creating a user
         * Hashes the password before saving it to the database
         */
        beforeCreate: async (user) => {
            if (user.password) {
                // We will be using bcrypt to hash the password
                // Salt rounds is number of times to hash the password, more is more secure but slower
                const saltRounds = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, saltRounds);
            }

            if (!user.displayName) {
                user.displayName = user.username;
            }
        },
        /**
         * Before updating a user, hash the password if it is being changed
         */
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const saltRounds = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, saltRounds);
            }
        },
    }
});
/**
 * Instance methods for user operations
 */

/**
 * Validates the password against the hashed password in the database
 * @param {string} candidatePassword - The password to validate, given by the user
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise
 */
User.prototype.validPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get user data without sensitive information
 * This gets sent to the frontend
 * @returns {Object} - The safe user data
 */
User.prototype.toSafeObject = function() {
    return {
        id: this.id,
        username: this.username,
        email: this.email,
        displayName: this.displayName,
        color: this.color,
        gamesPlayed: this.gamesPlayed,
        gamesWon: this.gamesWon,
        totalScore: this.totalScore,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
    // No password is included here.
}

/**
 * Calulate win rate as a percentage
 * @returns {number} - The win rate as a percentage
 */
User.prototype.getWinRate = function() {
    if (this.gamesPlayed === 0) return 0; // Avoid division by zero!

    return ((this.gamesWon / this.gamesPlayed) * 100).toFixed(2);
}

/**
 * Class methods
 * 
 * These are methods that are called on the model itself, not on an instance of the model
 */

/**
 * Find a user by username
 * @param {string} username - The username to find
 * @returns {Promise<User|null>} - The user if found, null otherwise
 */
User.findByUsername = async function(username) {
    return await this.findOne({
        where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('username')),
            sequelize.fn('LOWER', username)
        )
    })
}

/**
 * Find a user by email 
 * @param {string} email - The email to find
 * @returns {Promise<User|null>} - The user if found, null otherwise
 */
User.findByEmail = async function(email) {
    return await this.findOne({
        where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('email')),
            sequelize.fn('LOWER', email)
        )
    });
};

/**
 * Get leaderboard, top players by win rate and over 100 games played
 * @param {number} limit - The number of players to return
 * @returns {Promise<Array<User>>} - The leaderboard
 */
User.getLeaderboard = async function(limit = 10) {
    return await this.findAll({
        where: {
            gamesPlayed: {
                [Op.gt]: 100
            }
        },
        order: [
            ['gamesWon', 'DESC'],
            ['gamesPlayed', 'DESC']
        ],
        limit: limit,
        attributes: ['id', 'username', 'gamesWon', 'gamesPlayed', 'totalScore']
    });
};

module.exports = User;