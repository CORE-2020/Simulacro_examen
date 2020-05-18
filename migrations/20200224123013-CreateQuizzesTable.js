'use strict';

module.exports = {
    up(queryInterface, Sequelize) {
        return queryInterface.createTable(
            'Quizzes',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                question: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Question must not be empty."}}
                },
                answer: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Answer must not be empty."}}
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },
    down(queryInterface, Sequelize) {
        return queryInterface.dropTable('Quizzes');
    }
};
