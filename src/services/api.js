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
        return window.ipcRenderer.invoke('patenteCivile:updateStatus', { id, id_stato });
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

};

export const apiClient = Api;

export default Api;