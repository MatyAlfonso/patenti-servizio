const Api = {
    async getPersone(filter) {
        return window.ipcRenderer.invoke('persone:get', filter);
    },

    async getEnti() {
        return window.ipcRenderer.invoke('enti:get');
    },

    async createEnte(data) {
        return window.ipcRenderer.invoke('enti:create', data);
    },

    async updateEnte(id, data) {
        return window.ipcRenderer.invoke('enti:update', { id, data });
    },

    async deleteEnte(id) {
        return window.ipcRenderer.invoke('enti:delete', id);
    },

    async get(channel, data) {
        return window.ipcRenderer.invoke(channel, data);
    }
};

export const apiClient = Api;

export default Api;