const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const News = sequelize.define('news', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    news: {
        type: DataTypes.TEXT,
        unique: {
            msg: "Email already exists!"
        },
        validate: {
            len: {
                args: [10, 1000],
                msg: "News must be between 10 and 1000 characters."
            }
        }
    },
    prediction: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Prediction can not be null",
            },
        }
    },
}, {
    sequelize,
    timestamps: true,
    updatedAt: false,
});

module.exports = News;