const Player = require("./player");
const Hazard = require("./hazard");
const Constants = require("./constants");
const Bullet = require("./bullet");
const Vector2 = require("../utils/vector2");
const Chat = require("./chatroom");
const PowerUps = require('./powerups');

const FPS = 60;
const HAZARD_COUNT = 12;
const NUM_ROUNDS = 5;
const ROUND_LENGTH = 60;
const START_LOCS = [
	{ pos: new Vector2(200, 150), dir: new Vector2(1, 0) },
	{ pos: new Vector2(1150, 600), dir: new Vector2(-1, 0) },
	{ pos: new Vector2(200, 600), dir: new Vector2(1, 0) },
	{ pos: new Vector2(1150, 150), dir: new Vector2(-1, 0) }
];
const COLORS = ["RED", "BLUE", "YELLOW", "GREEN"];

class Game {
	constructor(
		gameId,
		hostId,
		numRounds = NUM_ROUNDS,
		roundLength = ROUND_LENGTH
	) {
		this.started = false;
		// set game parameters
		this.rounds = numRounds;
		this.roundLength = roundLength;

		// set game host
		this.hostId = hostId;

		// create players array with host POJO
		// this.players = [new Player(START_LOCS[0].pos, hostId, START_LOCS[0].dir)];
		this.players = {};
		this.colors = COLORS.slice(0);

		// create hazards array
		this.hazards = [];

		// create empty bullets array
		this.bullets = [];

		this.playerSockets = {};

		this.timer = 0;
        this.chat = new Chat();
	}

	async startGame() {
		if (this.started) {
			return;
		}

		Object.values(this.playerSockets).forEach(socket => {
			console.log(`Emitting to ${socket.id}`);
			socket.emit("gameStart");
		});

		this.started = true;
		while (this.rounds > 0) {
			await this.playRound();
			this.rounds--;
		}
		this.gameOver();
	}

	async playRound() {
		const sleep = ms => new Promise(res => setTimeout(res, ms));

		this.initRound();

		this.lastUpdate = Date.now();
		while (this.timer > 0) {
			this.update();
			this.lastUpdate = Date.now();
			await sleep(1000 / FPS);
		}
		Object.values(this.players).forEach(player => {
			player.clearEffects();
		});
	}

	appyPowerups() {}

	update() {
		// calculate time since last update
		const deltaTime = (Date.now() - this.lastUpdate) / 1000;
		// decrease time remaining in round
		this.timer -= deltaTime;

		let allObjects = this.allObjects();
		// this.lastUpdate = Date.now();

		Object.values(this.players).forEach(player => {
			let bullets = player.shoot(deltaTime);
			if (bullets) {
				this.bullets = this.bullets.concat(bullets);
			}
		});
		// move all objects
		allObjects.forEach(obj => obj.move(deltaTime));

		// check collisions
		allObjects.forEach(obj1 => {
			allObjects.forEach(obj2 => {
				if (!obj1.respawning && !obj2.respawning) {
					obj1.collideWith(obj2);
				}
			});
		});

		this.bullets.forEach(bullet => {
			if (bullet.collided) {
				this.removeObject(bullet);
			}
			if (bullet.pos.x < 0 - bullet.radius) {
				this.removeObject(bullet);
			} else if (bullet.pos.x > Constants.WIDTH + bullet.radius) {
				this.removeObject(bullet);
			}

			if (bullet.pos.y < 0 - bullet.radius) {
				this.removeObject(bullet);
			} else if (bullet.pos.y > Constants.HEIGHT + bullet.radius) {
				this.removeObject(bullet);
			}
		});

		// update clients with new positions
		Object.values(this.playerSockets).forEach(socket => {
			// emit game state to client
			socket.emit("newPosition", {
				players: Object.values(this.players).map(player => ({
					id: player.id,
					playerTag: player.playerTag,
					health: player.health,
					totalScore: player.totalScore,
					pos: player.pos,
					dir: player.dir,
					invuln: player.invuln,
					color: player.color
				})),
				hazards: this.hazards,
				bullets: this.bullets.map(bullet => ({
					pos: bullet.pos,
					vel: bullet.vel,
					radius: bullet.radius,
					color: bullet.color
				})),
				timer: this.timer,
				rounds: this.rounds
			});
		});
	}

	removeObject(obj) {
		if (obj instanceof Bullet) {
			this.bullets.splice(this.bullets.indexOf(obj), 1);
		} else if (obj instanceof Hazard) {
			this.hazards.splice(this.hazards.indexOf(obj), 1);
		}
	}

	selectPowerups() {}

	gameOver() {}

	addPlayer(playerId, socket, playerTag, gameId) {
		if (this.players.length === 4 || this.started) {
            this.playerSockets[playerId] = socket;
            return {gameId, spectator: true}
		}

		let playerParams = START_LOCS[Object.keys(this.players).length];
		let player = new Player(playerParams.pos, playerId, playerParams.dir);
		player.color = this.colors.shift();
		player.playerTag = playerTag;
		player.gameId = gameId;
		this.players[playerId] = player;
		this.playerSockets[playerId] = socket;
		this.chat.joinChat(playerId, playerTag, socket);

		Object.values(this.playerSockets).forEach(socket => {
			socket.emit("playerJoin", { players: Object.values(this.players).map(player => ({
				id: player.id,
				playerTag: player.playerTag,
				ready: player.ready,
				pos: player.pos,
				dir: player.dir,
				color: player.color
			}))});
		});

		return player;
	}

	updateReady() {
		Object.values(this.playerSockets).forEach(socket => {
			socket.emit("readyUpdate", { players: Object.values(this.players).map(player => ({
				id: player.id,
				playerTag: player.playerTag,
				ready: player.ready,
				pos: player.pos,
				dir: player.dir,
				color: player.color
			}))});
		});
	}

	removePlayer(playerId) {
		this.colors.push(this.players[playerId].color);
		delete this.players[playerId];
		delete this.playerSockets[playerId];
	}

	populateHazards() {
		this.hazards = [];
		for (let i = 0; i < HAZARD_COUNT; i++) {
			const hazard = new Hazard();
			this.hazards.push(hazard);
		}
	}

	initRound() {
		this.populateHazards();
		this.bullets = [];
		Object.values(this.players).forEach(player => {
			player.applyPowerUp(PowerUps.shotgun);
		});

		this.timer = this.roundLength;
	}

	allObjects() {
		return [].concat(this.bullets, Object.values(this.players), this.hazards);
	}
}

module.exports = Game;
