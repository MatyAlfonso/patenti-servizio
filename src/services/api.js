const handleResponse = (response) => {
    if (response && response.error) {
        throw new Error(response.error);
    }
    return response;
};

const Api = {
    // --- PERSONE ---

    // GET
    async getPersone(filter) {
        const res = await window.ipcRenderer.invoke('persone:get', filter);
        return handleResponse(res);
    },

    // CREATE
    async createPersona(data) {
        const res = await window.ipcRenderer.invoke('persone:create', data);
        return handleResponse(res);
    },

    // UPDATE
    async updatePersona(id, data) {
        const res = await window.ipcRenderer.invoke('persone:update', { id, data });
        return handleResponse(res);
    },

    // DELETE
    async deletePersona(id) {
        const res = await window.ipcRenderer.invoke('persone:delete', id);
        return handleResponse(res);
    },

    // --- ENTI ---

    // GET
    async getEnti() {
        const res = await window.ipcRenderer.invoke('enti:get');
        return handleResponse(res);
    },

    // CREATE
    async createEnte(data) {
        const res = await window.ipcRenderer.invoke('enti:create', data);
        return handleResponse(res);
    },

    // UPDATE
    async updateEnte(id, data) {
        const res = await window.ipcRenderer.invoke('enti:update', { id, data });
        return handleResponse(res);
    },

    // DELETE
    async deleteEnte(id) {
        const res = await window.ipcRenderer.invoke('enti:delete', id);
        return handleResponse(res);
    },

    // --- CATEGORIA PATENTE ---

    // GET 
    async getCategorie() {
        const res = window.ipcRenderer.invoke('categorie:get');
        return handleResponse(res);
    },

    // --- PATENTE CIVILE ---

    // GET
    async getPatentiCivili() {
        const res = await window.ipcRenderer.invoke('patenteCivile:get');
        return handleResponse(res);
    },

    // CREATE
    async createPatenteCivile(data) {
        const res = await window.ipcRenderer.invoke('patenteCivile:create', data);
        return handleResponse(res);
    },

    // UPDATE
    async updatePatenteCivile(id, id_stato) {
        const res = await window.ipcRenderer.invoke('patenteCivile:update', { id, id_stato });
        return handleResponse(res);
    },

    // --- PATENTE SERVIZIO ---

    // GET
    async getPatentiServizio() {
        const res = await window.ipcRenderer.invoke('patenteServizio:get');
        return handleResponse(res);
    },

    // ISSUE / CREATE FROM REQUEST
    async issuePatenteServizio(idRichiesta) {
        const res = window.ipcRenderer.invoke('patenteServizio:issue', idRichiesta);
        return handleResponse(res);
    },

    // UPDATE
    async updatePatenteServizio(id, data) {
        const res = await window.ipcRenderer.invoke('patenteServizio:update', { id, data });
        return handleResponse(res);
    },

    // --- RICHIESTE ---

    // GET
    async getRichieste() {
        const res = await window.ipcRenderer.invoke('richieste:get');
        return handleResponse(res);
    },

    // CREATE
    async createRichiesta(data, files) {
        const res = await window.ipcRenderer.invoke('richieste:create', { data, files });
        return handleResponse(res);
    },

    // UPDATE
    async updateRichiesta(id, data, files) {
        const res = await window.ipcRenderer.invoke('richieste:update', { id, data, files });
        return handleResponse(res);
    },

    // DELETE
    async deleteRichiesta(id) {
        const res = await window.ipcRenderer.invoke('richieste:delete', id);
        return handleResponse(res);
    },

    // GENERATE PDF
    async generatePDF(id) {
        const buffer = await window.ipcRenderer.invoke('richieste:generatePDF', id);
        if (buffer && buffer.error) throw new Error(buffer.error);
        return new Blob([buffer], { type: 'application/pdf' });
    },

    // --- TIPO RICHIESTA ---

    // GET
    async getTipiRichiesta() {
        const res = await window.ipcRenderer.invoke('tipiRichiesta:get');
        return handleResponse(res);
    },
};

export const apiClient = Api;

export default Api;