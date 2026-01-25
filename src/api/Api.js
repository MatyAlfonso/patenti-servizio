const Api = {
	async getPersons(filter) {
		return ipcRenderer.invoke('persons:get', filter);
	}
}

export default Api;