import DB from "../DataBase.js"

const Person = DB.define('Person', {
    first_name: {
        type: DB.Types.TEXT,
        allowNull: true,
    },
    last_name: {
        type: DB.Types.STRING,
        allowNull: false,
    },
    // status: {
    //     type: DB.Types.STRING,
    //     defaultValue: 'active', // status can be 'active', 'archived', 'pinned', 'completed'
    // },
    // dt_create: {
    //     type: DB.Types.DATE,
    //     defaultValue: DB.Types.NOW,
    // },
    // dt_update: {
    //     type: DB.Types.DATE,
    //     defaultValue: DB.Types.NOW,
    // },
}, {
    // tableName: 'people',
    timestamps: false,
});

export default Person;