const sequelize = require('../config/db')

class DbService {
    async connect() {
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }

    async disconnect() {
        try {
            await sequelize.disconnect();
            console.log('Connection has been disconnected successfully.');
        } catch (error) {
            console.error('Unable to disconnect from the database:', error);
        }
    }

    getSequelize(){
        return sequelize;
    }
}

module.exports = new DbService();