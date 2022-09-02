const { Server } = require('socket.io');
const {
	addUser,
	getUsersInRoom,
	selectNumber,
	getUsersInGame,
	eliminateUserInRoom,
	activeUserInRoom,
	deactiveUserInRoom,
	removeUser,
} = require('./User');
const io = new Server(process.env.PORT || 8000, {
	cors: {
		origin: [
			'http://localhost:3000',
			'https://number-game-react.herokuapp.com/',
		],
	},
});
let chance = 0;

io.on('connection', (socket) => {
	socket.on('disconnect', (reason) => {
		console.log(socket.id + ' disconnected');
		removeUser(socket.id);
		let userRoomData = getUsersInGame(data.room);

		io.to(data.room).emit('updateUserData', JSON.stringify(userRoomData));
	});
	socket.on('room-add', (data1) => {
		let data = JSON.parse(data1);
		socket.join(data.room);

		let resp = addUser({
			id: socket.id,
			name: data.username,
			room: data.room,
			color: data.color,
			userNumber: data.userNumber,
		});
		if (resp.error) {
			return socket.emit('error', 'Invalid Username, try something else');
		}
		let userRoomData = getUsersInGame(data.room);

		io.to(data.room).emit('updateUserData', JSON.stringify(userRoomData));
		let activeUserData = activeUserInRoom(chance, data.room);
		io.to(data.room).emit(
			'updateActivePlayer',
			JSON.stringify(activeUserData.payload)
		);

		io.to(userRoomData[chance].id).emit('enableMouse', true);
	});
	socket.on('selectNumber', (selectedNumData) => {
		let data = JSON.parse(selectedNumData);

		let resp = selectNumber(data.id, data.room, data.number, data.color);

		if (resp.payload === 'USER_ELIMINATION') {
			/**
			 * Code for striking the user name
			 * Should Mark the block Black
			 */
			resp.userIndex.forEach((user) => {
				io.to(user.id).emit('disableMouse', true);
			});
			io.to(data.room).emit('mark-black', data.number);

			/** Remove the User chance
			 *
			 */
			let chanceResp = activeUserInRoom(chance + 2, data.room);
			if (chanceResp.status === 'SUCCESS') {
				io.to(data.room).emit(
					'updateActivePlayer',
					JSON.stringify(chanceResp.payload)
				);
			} else if (chanceResp === 'FAIL') {
				chance = 0;
			}
			let userRoomData = eliminateUserInRoom(data.number, data.room);

			io.to(data.room).emit('updateUserData', JSON.stringify(userRoomData));
		} else if (resp.payload === 'SUCCESS') {
			socket.emit('disableMouse', true);
			chance += 1;
			io.to(data.room).emit(
				'oppoColor',
				JSON.stringify({ color: resp.color, number: resp.number })
			);
			let chanceResp = activeUserInRoom(chance, data.room);
			if (chanceResp.status === 'SUCCESS') {
				io.to(data.room).emit(
					'updateActivePlayer',
					JSON.stringify(chanceResp.payload)
				);
				let userData = getUsersInGame(data.room);

				io.to(userData[chance]['id']).emit('enableMouse', true);
				//	let deactiveData = deactiveUserInRoom(data.id, data.room);

				//	io.to(data.room).emit('updateUserData', JSON.stringify(deactiveData));
				//console.log(chanceResp.payload);
			} else if (chanceResp === 'FAIL') {
				chance = 0;
				let chanceResp = activeUserInRoom(chance, data.room);
				let userData = getUsersInGame(data.room);
				io.to(data.room).emit(
					'updateActivePlayer',
					JSON.stringify(chanceResp.payload)
				);
				io.to(userData[chance]['id']).emit('enableMouse', true);
			}
		}
		//console.log(selectNumberOfUser(data.id, data.room));
	});
});
