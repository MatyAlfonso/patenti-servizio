import { ipcMain } from 'electron';
import { DataBase } from './DataBase.js';

// https://www.youtube.com/watch?v=GQvDNRBe4IU

const db = new DataBase();


export const Channels = {
	init: function() {
		ipcMain.handle('persons:get', (_, filter) => {
			try {
				console.log('channels:persons:get',2, db);
				return db.getPersons(filter);
			}
			catch( err ) {
				return [{first_name: 'error', last_name: err.toString()}];
			}
		});
	}
}
