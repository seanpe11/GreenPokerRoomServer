const yeehaw = require('./yeehawholdem.js')

players = [new yeehaw.Player("Sean"), new yeehaw.Player("Rasheed"), new yeehaw.Player("Jolo"), new yeehaw.Player("Bags")]
game = new yeehaw.Yeehaw(players, 1, 2);
console.log(game.info)

action = {playerIndex: 0, action:"CALL", value:2}
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 1, action:"CALL", value:2}
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 2, action:"CALL", value:1} // sb
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 3, action:"CHECK", value:1} // bb
console.log(game.playerAction(action))
console.log(game.info)


