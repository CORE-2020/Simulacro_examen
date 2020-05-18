
const {Model} = require('sequelize');

// Definition of the Quiz model:

module.exports = (sequelize, DataTypes) => {

    class Quiz extends Model {}

    Quiz.init({
            question: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Question must not be empty"}}
            },
            answer: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Answer must not be empty"}}
            }
        }, {
            sequelize
        }
    );

    return Quiz;
};
