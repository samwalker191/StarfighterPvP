const io = require("../../app").io;
const Game = require("./classes/game");

let SOCKET_LIST = {};

module.exports = function(socket) {
	socket.id = Math.random();
	socket.x = 0;
	socket.y = 0;
	SOCKET_LIST[socket.id] = socket;

	// emitPayload = (payload) => {
	// 	const { socket } = this.state;
	// 	socket.emit("msg", { msg: "hello" });
	// };

	setInterval(function() {
		for (let i in SOCKET_LIST) {
			let socket = SOCKET_LIST[i];
			socket.x++;
			socket.y++;
			socket.emit("newPosition", {
				x: socket.x,
				y: socket.y
			});
		}
	});
	//!Socket Tests
	socket.on("c2s", data => {
		console.log(data.event);
	});

	socket.emit("s2c", {
		event: "Server talks to client"
	});

	console.log("HiHo! You are connected to this websocket:" + socket.id);
};
