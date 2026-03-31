import { DataTypes } from 'sequelize';
import { sequelize } from '../DataBase.js';

export const TipoRichiesta = sequelize.define('TipoRichiesta', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    descrizione: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'TipoRichieste'
});