import { Channels } from './Api.Channel.js';
import DB from './DataBase.js';

const Server =  {
	start:	 async () => {
		Channels.init(); // defines model
		await DB.sync();
	}
};

export default Server;

