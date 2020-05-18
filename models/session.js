
const {Model} = require('sequelize');

// Definition of the Session model:

module.exports = (sequelize, DataTypes) => {

    class Session extends Model {}

    Session.init({
            sid: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            expires: {
                type: DataTypes.DATE
            },
            data: {
                type: DataTypes.STRING(50000)
            }
        }, {
            sequelize
        }
    );

    return Session;
};
