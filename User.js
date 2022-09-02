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
		return user.id === id;
	});

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
	return 'USER_NOT_FOUND';
};

const getUser = (id) => users.find((user) => user.id === id);
const getUsersInGame = (room) =>
	users.filter((user) => user.room === room && user.eliminated === false);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const eliminateUserInRoom = (number, room) => {
	let index = users.findIndex(
		(user) => user.userNumber === number && user.room === room
	);
	if (index !== -1) {
		users[index]['eliminated'] = true;
	}
	let filteredData = users.filter((user) => user.room === room);

	return filteredData;
};
const activeUserInRoom = (chance, room) => {
	if (chance <= getUsersInRoom(room).length - 1) {
		let userData = getUsersInRoom(room);
		if (userData[chance].eliminated === true) {
			chance += 1;
			return activeUserInRoom(chance, room);
		} else {
			return { status: 'SUCCESS', payload: chance, users: userData };
		}
	} else {
		chance = 0;

		activeUserInRoom(chance, room);
		let userData = getUsersInRoom(room);
		return { status: 'SUCCESS', payload: chance, users: userData };
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
