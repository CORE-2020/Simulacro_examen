'use strict';

module.exports = {
    up(queryInterface, Sequelize) {

        return queryInterface.bulkInsert('Quizzes', [
            {
                question: 'Capital of Italy',
                answer: 'Rome',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital of Portugal',
                answer: 'Lisbon',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital of Spain',
                answer: 'Madrid',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital of France',
                answer: 'Paris',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down(queryInterface, Sequelize) {

        return queryInterface.bulkDelete('Quizzes', null, {});
    }
};
