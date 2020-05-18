'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return Sequelize.Promise.all([
            queryInterface.addColumn(
                'Users',
                'githubId',
                {
                    type: Sequelize.INTEGER,
                }
            ),
            queryInterface.addColumn(
                'Users',
                'githubUsername',
                {
                    type: Sequelize.STRING,
                }
            )
        ]);
    },

    down: function (queryInterface, Sequelize) {
        return Sequelize.Promise.all([
            queryInterface.removeColumn('Users', 'githubId'),
            queryInterface.removeColumn('Users', 'githubUsername')
        ]);

    }
};
