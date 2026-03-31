import { app } from 'electron';
import path from 'node:path';
import { createRequire } from 'module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { Sequelize, DataTypes } = require('sequelize');
const sqlite3 = require('sqlite3');

const dbPath = process.env.NODE_ENV === 'development'
	? path.resolve(process.cwd(), 'data', 'database.sqlite')
	: path.join(app.getPath('userData'), 'database.sqlite');

console.log('Database path:', dbPath);

export const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: dbPath,
	dialectModule: sqlite3,
	logging: false,
	define: {
		freezeTableName: false,
	}
});

class DataBase {
	static define(modelName, attributes, options) {
		try {
			return sequelize.define(modelName, attributes, options);
		}
		catch (err) {
			console.error(`Error while defining model ${modelName}:`, err);
			return null;
		}
	}

	static async sync(args) {
		return sequelize.sync(args);
	}
}

DataBase.Types = DataTypes;
export default DataBase;