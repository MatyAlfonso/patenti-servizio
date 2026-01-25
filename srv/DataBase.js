
import { app } from 'electron';
import path from 'node:path';


// Import the 'createRequire' function from the 'module' package
import { createRequire } from 'module';
import Database from 'better-sqlite3';
const require = createRequire(import.meta.url);

// Import better-sqlite3
// const Sqlite3 = require('better-sqlite3');
// const Sqlite3 = require('sqlite3').Database;

const { Sequelize, Model, DataTypes } = require('sequelize');

const dbPath = path.join(app.getAppPath() , 'data', 'test.db' );

const sqlize = new Sequelize({
	dialect: 'sqlite',
	storage: dbPath
})

class DataBase {

	static define(modelName, attributes, options) {
		try {
			return sqlize.define(modelName, attributes, options);
		}
		catch( err ) {
			console.error( err );
			return null;
		}
	}

	static async sync(args) {
		return sqlize.sync(args);
	}
}

DataBase.Types = DataTypes;

export default DataBase;