'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Quizzes',
            'authorId',
            {
                type: Sequelize.INTEGER,
                references: {
                    model: "Users",
                    key: "id"
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('Quizzes', 'authorId');
    }
};
