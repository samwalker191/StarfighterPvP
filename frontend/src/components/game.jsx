import React from "react";
import MovingObject from "../classes/movingObject";
import io from "socket.io-client";
import Player from "../classes/player";

let socketURL = "http://localhost:5000";

if (process.env.NODE_ENV === "production") {
	socketURL = "https://starfight-staging.herokuapp.com/";
}
class Canvas extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.input = {
			w: false,
			s: false,
			a: false,
			d: false
		};

		this.hazards = this.props.hazards;
		this.socket = null;
		this.openSocket = this.openSocket.bind(this);
		this._handleKey = this._handleKey.bind(this);
		this.canvasRef = React.createRef();
	}

	openSocket = () => {
		this.socket = io(socketURL);
		let socket = this.socket;
		// !Socket Tests
		socket.on("connect", () => {
			console.log("Ayyy! Websockets!");
		});

		socket.emit("c2s", {
			event: "Client Talks to Server"
		});
		socket.on("s2c", data => console.log(data.event));

		socket.on("newPosition", data => {
			let players = data.players;
			// console.log(players);
			const canvas = this.canvasRef.current;
			const ctx = canvas.getContext("2d");
			// ctx.rect(0, 0, canvas.width, canvas.height);
			// ctx.fillStyle = "black";
			// ctx.fill();
			players.forEach(player => {
				new Player(player.pos, player.id, player.dir).draw(ctx, canvas);
			});
		});
	};

	_handleKey(event, down) {
		let input = this.input;
		let socket = this.socket;
		console.log(event.keyCode);
		switch (event.keyCode) {
			case 87:
				if (input.w !== down) {
					input.w = down;
					socket.emit("playerInput", input);
					console.log(input);
				}

				break;
			case 83:
				if (input.s !== down) {
					input.s = down;
					socket.emit("playerInput", input);
					console.log(input);
				}

				break;
			case 65:
				if (input.a !== down) {
					input.a = down;
					socket.emit("playerInput", input);
					console.log(input);
				}
				break;
			case 68:
				if (input.d !== down) {
					input.d = down;
					socket.emit("playerInput", input);
					console.log(input);
				}

				break;
			case 32:
				if (input.space !== down) {
					input.space = down;
					// console.log('fire!')
					socket.emit("playerInput", input);
					// socket.emit("playerInput", input);
				}

				break;
			case 16:
				if (input.shift !== down) {
					input.shift = down;
					socket.emit("playerInput", input);
					console.log(input);
				}

				break;
			default:
				break;
		}
		this.input = input;
		// debugger;
	}

	// updatePos = () => {
	// 	socket = io(socketURL);
	// };

	componentWillMount() {
		this.openSocket();
	}

	componentDidMount() {
		const canvas = this.canvasRef.current;
		const ctx = canvas.getContext("2d");
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#00FF00";
		ctx.stroke();
		// ctx.fillStyle = "#00FF00";
		// ctx.beginPath();
		// ctx.arc(300, 300, 11, 0, 2 * Math.PI, true);
		// ctx.fill();
		// ctx.closePath();
		// if (this.props !== {}) {
		// 	this.props.hazards.forEach(hazard => hazard.draw(ctx));
		// 	this.props.players.forEach(player => player.draw(ctx, canvas));
		// 	this.props.bullets.forEach(bullet => bullet.draw(ctx));
		// }
		document.addEventListener("keydown", event => {
			this._handleKey(event, true);
		});
		document.addEventListener("keyup", event => {
			this._handleKey(event, false);
		});
	}

	render() {
		if (!this.props) {
			return null;
		}
		return (
			<div>
				<h3>Timer: {this.props.timeLeft}</h3>
				<h3>Rounds Left: {this.props.roundsLeft}</h3>
				<canvas ref={this.canvasRef} width={1600} height={900} />
			</div>
		);
	}
}

export default Canvas;
