import { ipcMain } from 'electron';
import * as Ente from './controllers/EnteController.js';

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

		// ENTI
		// GET
		ipcMain.handle('enti:get', async () => {
			try {
				const result = await Ente.getAll();
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				return { error: err.message };
			}
		});

		// CREATE
		ipcMain.handle('enti:create', async (_, data) => {
			try {
				const result = await Ente.create(data);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error("Il codice ente esiste già.");
			}
		});

		// UPDATE
		ipcMain.handle('enti:update', async (_, { id, data }) => {
			try {
				const result = await Ente.update(id, data);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw err;
			}
		});

		// DELETE
		ipcMain.handle('enti:delete', async (_, id) => {
			try {
				return await Ente.remove(id);
			} catch (err) {
				throw new Error("Impossibile eliminare l'ente: vincoli di integrità.");
			}
		});
	}
}