const Users = require("../models/user");

async function main() {
	await createAdmin();
	process.exit();
}

const createAdmin = async () => {
	try {
		const user = await Users.findOne({
			where: {email: "admin@gmail.com"}
		});
		if(!user){
			await Users.create({
				firstName: "Admin",
				lastName: "Admin",
				email: "admin@gmail.com",
				role: 1,
				verifyStatus: 'activated',
				password: '123456789Aa@#',
			}).then((users) => {
				if(users){
					console.log("USER")
				} else{
					console.log("USER")
				}
			});
		}
		return true;
	} catch(e) {
		return e;
	}
}

main().then(r => console.log(r-- > 'Done')).catch(e => console.log(e));

