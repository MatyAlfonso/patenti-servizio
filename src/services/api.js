const Api = {
    // --- PERSONE ---

    // GET
    async getPersone(filter) {
        return window.ipcRenderer.invoke('persone:get', filter);
    },

    // CREATE
    async createPersona(data) {
        return window.ipcRenderer.invoke('persone:create', data);
    },

    // UPDATE
    async updatePersona(id, data) {
        return window.ipcRenderer.invoke('persone:update', { id, data });
    },

    // DELETE
    async deletePersona(id) {
        return window.ipcRenderer.invoke('persone:delete', id);
    },

    // --- ENTI ---

    // GET
    async getEnti() {
        return window.ipcRenderer.invoke('enti:get');
    },

    // CREATE
    async createEnte(data) {
        return window.ipcRenderer.invoke('enti:create', data);
    },

    // UPDATE
    async updateEnte(id, data) {
        return window.ipcRenderer.invoke('enti:update', { id, data });
    },

    // DELETE
    async deleteEnte(id) {
        return window.ipcRenderer.invoke('enti:delete', id);
    },

    // --- CATEGORIA PATENTE ---

    // GET 
    async getCategorie() {
        return window.ipcRenderer.invoke('categorie:get');
    },

    // --- PATENTE CIVILE ---

    // GET
    async getPatentiCivili() {
        return window.ipcRenderer.invoke('patenteCivile:get');
    },

    // CREATE
    async createPatenteCivile(data) {
        return window.ipcRenderer.invoke('patenteCivile:create', data);
    },

    // UPDATE
    async updatePatenteCivile(id, id_stato) {
        return window.ipcRenderer.invoke('patenteCivile:update', { id, id_stato });
    },

    // --- PATENTE SERVIZIO ---

    // GET
    async getPatentiServizio() {
        return window.ipcRenderer.invoke('patenteServizio:get');
    },

    // ISSUE / CREATE FROM REQUEST
    async issuePatenteServizio(idRichiesta) {
        return window.ipcRenderer.invoke('patenteServizio:issue', idRichiesta);
    },

    // UPDATE
    async updatePatenteServizio(id, data) {
        return window.ipcRenderer.invoke('patenteServizio:update', { id, data });
    },

    // --- RICHIESTE ---

    // GET
    async getRichieste() {
        return window.ipcRenderer.invoke('richieste:get');
    },

    // CREATE
    async createRichiesta(data, files) {
        return window.ipcRenderer.invoke('richieste:create', { data, files });
    },

    // UPDATE
    async updateRichiesta(id, data, files) {
        return window.ipcRenderer.invoke('richieste:update', { id, data, files });
    },

    // DELETE
    async deleteRichiesta(id) {
        return window.ipcRenderer.invoke('richieste:delete', id);
    },

    // GENERATE PDF
    async generatePDF(id) {
        const buffer = await window.ipcRenderer.invoke('richieste:generatePDF', id);
        return new Blob([buffer], { type: 'application/pdf' });
    },

    // --- TIPO RICHIESTA ---

    // GET
    async getTipiRichiesta() {
        return window.ipcRenderer.invoke('tipiRichiesta:get');
    },
};

export const apiClient = Api;

export default Api;