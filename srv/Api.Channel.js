import { ipcMain } from 'electron';
import * as Persona from './controllers/PersonaController.js';
import * as Ente from './controllers/EnteController.js';
import * as PatenteCivile from './controllers/PatenteCivileController.js';
import * as PatenteServizio from './controllers/PatenteServizioController.js';
import * as Categoria from './controllers/CategoriaPatenteController.js';

export const Channels = {
	init: function () {
		// --- PERSONE ---

		// GET
		ipcMain.handle('persone:get', async () => {
			try {
				const result = await Persona.getAll();
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				return { error: err.message };
			}
		});

		// CREATE
		ipcMain.handle('persone:create', async (_, data) => {
			try {
				const result = await Persona.create(data);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error("Errore durante la creazione: " + err.message);
			}
		});

		// UPDATE
		ipcMain.handle('persone:update', async (_, { id, data }) => {
			try {
				const result = await Persona.update(id, data);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error("Errore durante l'aggiornamento.");
			}
		});

		// DELETE
		ipcMain.handle('persone:delete', async (_, id) => {
			try {
				return await Persona.remove(id);
			} catch (err) {
				throw new Error("Impossibile eliminare la persona.");
			}
		});


		// --- ENTI ---

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

		// --- CATEGORIE ---

		// GET
		ipcMain.handle('categorie:get', async () => {
			try {
				const result = await Categoria.getAll();
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				return { error: err.message };
			}
		});

		// --- PATENTE CIVILE ---

		// GET
		ipcMain.handle('patenteCivile:get', async () => {
			try {
				const result = await PatenteCivile.getAll();
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				return { error: err.message };
			}
		});

		// CREATE
		ipcMain.handle('patenteCivile:create', async (_, data) => {
			try {
				const result = await PatenteCivile.create(data);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error(err.message);
			}
		});

		// UPDATE
		ipcMain.handle('patenteCivile:update', async (_, { id, id_stato }) => {
			try {
				const result = await PatenteCivile.update(id, id_stato);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error("Errore nell'aggiornamento: " + err.message);
			}
		});

		// --- PATENTE SERVIZIO ---

		// GET
		ipcMain.handle('patenteServizio:get', async () => {
			try {
				const result = await PatenteServizio.getAll();
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				return { error: err.message };
			}
		});

		// ISSUE / CREATE FROM REQUEST
		ipcMain.handle('patenteServizio:issue', async (_, idRichiesta) => {
			try {
				const result = await PatenteServizio.issue(idRichiesta);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error(err.message);
			}
		});

		// UPDATE
		ipcMain.handle('patenteServizio:update', async (_, { id, data }) => {
			try {
				const result = await PatenteServizio.update(id, data);
				return JSON.parse(JSON.stringify(result));
			} catch (err) {
				throw new Error(err.message);
			}
		});
	}
}