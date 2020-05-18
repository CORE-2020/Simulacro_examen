
const {Model} = require('sequelize');
const crypt = require('../helpers/crypt');

// Definition of the User model:

module.exports = function (sequelize, DataTypes) {

    class User extends Model {
        verifyPassword(password) {
            return crypt.encryptPassword(password, this.salt) === this.password;
        }

        get displayName() {
            return this.username || this.githubUsername || "Unknown";
        }

        get displayNameAuth() {
            return this.username && this.username+"(local)" || this.githubUsername && this.githubUsername+"(github)" || "Unknown";
        }

        // true if it is a local authenticated user
        get isLocal() {
            return !this.githubId;
        }
    }

    User.init({
        username: {
            type: DataTypes.STRING,
            unique: true,
            validate: {notEmpty: {msg: "Username must not be empty."}}
        },
        password: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Password must not be empty."}},
            set(password) {
                // Random String used as salt.
                this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
                this.setDataValue('password', crypt.encryptPassword(password, this.salt));
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        githubId: {
            type: DataTypes.INTEGER,
            unique: true
        },
        githubUsername: {
            type: DataTypes.STRING,
            unique: true,
            validate: {notEmpty: {msg: "Username must not be empty."}}
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
        }, {
            sequelize
        }
    );

    return User;
};
