
// Import the 'createRequire' function from the 'module' package
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import better-sqlite3
// const Sqlite3 = require('better-sqlite3');
const Sqlite3 = require('sqlite3').Database;

// import { Sequelize } from '@sequelize/core';
// import { SqliteDialect } from '@sequelize/sqlite3';

// const sqlize = new Sequelize({
//   dialect: SqliteDialect,
//   storage: 'sequelize.sqlite',
// });

import { app } from 'electron';
import path from 'node:path';

let db = null;

export class DataBase {

	constructor() {
	}

	_init() {
		if( db == null ) {
			try {
				// const folder= app.getPath('exe');
				const folder= app.getAppPath();
				const dbName = path.join(folder , 'data', 'test.db' );
				console.log(dbName);
				db = new Sqlite3(dbName);
			}
			catch( err ) {
				console.error('*******************************');
				console.error(err.toString());
				console.error('*******************************');
			}
		}
	}

	getPersons(filter) {
		this._init();
		console.log(filter);
		return [{first_name: 'pinco', last_name: 'pallino'},{last_name: 'test'}];
	}
}