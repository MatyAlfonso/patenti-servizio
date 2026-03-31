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
};

export const apiClient = Api;

export default Api;