const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');
const News = require('./news.model');

const Feedback = sequelize.define('feedback', {
    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    newsId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    label: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
            notNull: { msg: 'Label cannot be null.' },
        }
    }
}, {
    sequelize,
    timestamps: true,     // Tracks when feedback was given
    updatedAt: false,     // Feedback not typically updated
    indexes: [
        {
            unique: true,
            fields: ['userId', 'newsId']
        }
    ]
});

// Associations
User.belongsToMany(News, { through: Feedback, foreignKey: 'userId' });
News.belongsToMany(User, { through: Feedback, foreignKey: 'newsId' });

Feedback.belongsTo(User, { foreignKey: 'userId' });
Feedback.belongsTo(News, { foreignKey: 'newsId' });

User.hasMany(Feedback, { foreignKey: 'userId' });
News.hasMany(Feedback, { foreignKey: 'newsId' });

module.exports = Feedback;
