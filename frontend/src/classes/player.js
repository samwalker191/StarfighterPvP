class Player extends MovingObject {
    constructor(pos, vel, size) {
        super(pos, vel, size);
        this.health = 100;
        this.totalScore = 0;
        this.score = 0;
    }

    addScore(points) {

    }

    takeDamage(damage) {

    }

    shoot() {

    }
}

module.exports = Player;