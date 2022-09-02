let users = [];
let selectedNumbers = [];

const addUser = ({ id, name, room, color, userNumber }) => {
	name = name.trim().toLowerCase();
	room = room.trim().toLowerCase();

	const existingUser = users.find(
		(user) => user.room === room && user.name === name
	);

	if (existingUser) {
		return { error: 'Username is taken' };
	}
	const user = {
		id,
		name,
		room,
		color,
		userNumber,
		eliminated: false,
		active: false,
	};

	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => {
		user.id === id;
	});

	if (index !== -1) {
		let returnVal = users[index];
		users.splice(index, 1)[0];
		return returnVal;
	}
};

const getUser = (id) => users.find((user) => user.id === id);
const getUsersInGame = (room) =>
	users.filter((user) => user.room === room && user.eliminated === false);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const eliminateUserInRoom = (number, room) => {
	let filteredData = users.filter((user) => user.room === room);

	for (const data of filteredData) {
		if (data.userNumber === number) {
			data.eliminated = true;
		}
	}
	return filteredData;
};
const activeUserInRoom = (chance, room) => {
	if (chance <= getUsersInGame(room).length - 1) {
		return { status: 'SUCCESS', payload: chance };
	} else {
		return 'FAIL';
	}
};
const deactiveUserInRoom = (id, room) => {
	let index = users.findIndex(
		(user) => user.id === id && user.room === room && user.active === true
	);
	if (index !== -1) {
		users[index]['active'] = false;
		return users;
	}
};

const selectNumber = (id, room, number, color) => {
	let userIndex = users.filter((user) => user.userNumber === number);

	if (userIndex.length > 0) {
		console.log(userIndex);

		return { payload: 'USER_ELIMINATION', userIndex };
	}

	let selectedNumIndex = selectedNumbers.findIndex(
		(user) => user.id === id && user.room === room
	);

	if (selectedNumIndex !== -1) {
		selectedNumbers[selectedNumIndex]['nums'] = new Set([
			...selectedNumbers[selectedNumIndex]['nums'],
			number,
		]);
		return { payload: 'SUCCESS', color, number };
	}
	selectedNumbers.push({
		id,
		room,
		nums: [number],
		color,
	});
	return { payload: 'SUCCESS', color, number };
};

const selectNumberOfUser = (id, room) => {
	let selectedNumUser = selectedNumbers.find(
		(user) => user.id === id && user.room === room
	);
	return selectedNumUser;
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	selectNumber,
	selectNumberOfUser,
	getUsersInGame,
	eliminateUserInRoom,
	activeUserInRoom,
	deactiveUserInRoom,
};
