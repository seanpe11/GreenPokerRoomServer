const yeehaw = require('./yeehawholdem.js')

players = [new yeehaw.Player("Sean"), new yeehaw.Player("Rasheed"), new yeehaw.Player("Jolo"), new yeehaw.Player("Bags")]
game = new yeehaw.Yeehaw(players, 1, 2);

console.log(players.map((val) => {return val.name }).indexOf("Rasheed"))