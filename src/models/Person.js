import Api from '../api/Api.js';

class Person {
	contructor(args) {
		this.id = 0;
		this.first_name = args?.first_name;
		this.last_name = args?.last_name;
		this.cf = args?.cf;
	}

	static async read(filter) {
		let res = await Api.getPersons(filter);
		return res.map( r => r.dataValues );
	}
}

export default Person;