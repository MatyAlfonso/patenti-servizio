import { ipcMain } from 'electron';
import { Persona } from './models/index.js';

export const Channels = {
	init: function () {
		ipcMain.handle('persons:get', async (_, filter) => {
			try {
				console.log('Executing: channels:persons:get');
				const result = await Persona.findAll();
				return JSON.parse(JSON.stringify(result));
			}
			catch (err) {
				console.error("Error executing IPC persons:get:", err);
				return [{ nombre: 'error', detalle: err.toString() }];
			}
		});
	}
}