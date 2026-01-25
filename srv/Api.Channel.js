import { ipcMain } from 'electron';
import Person from './models/Person.js';

// https://www.youtube.com/watch?v=GQvDNRBe4IU

export const Channels = {
	init: function() {
		ipcMain.handle('persons:get', async (_, filter) => {
			try {
				console.log('channels:persons:get');
				const result = await Person.findAll();
				console.log(JSON.stringify(result));
				return result;
			}
			catch( err ) {
				return [{first_name: 'error', last_name: err.toString()}];
			}
		});
	}
}
