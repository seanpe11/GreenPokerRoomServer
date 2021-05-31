const yeehaw = require('./yeehawholdem.js')

players = [new yeehaw.Player("Sean"), new yeehaw.Player("Rasheed"), new yeehaw.Player("Jolo"), new yeehaw.Player("Bags")]
game = new yeehaw.Yeehaw(players, 1, 2);
console.log(game.info)

action = {playerIndex: 3, action:"CALL", value:2} 
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 0, action:"CALL", value:2}
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 1, action:"CALL", value:1} // smallblind
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 2, action:"CHECK", value:1}  // bigblind
console.log(game.playerAction(action))
console.log(game.info)

console.log("-----------------FLOP---------------")

//flop
action = {playerIndex: 1, action:"CHECK", value:1} // smallblind
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 2, action:"FOLD", value:1}  // bigblind
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 3, action:"CHECK", value:2} 
console.log(game.playerAction(action))
console.log(game.info)


action = {playerIndex: 0, action:"CHECK", value:2}
console.log(game.playerAction(action))
console.log(game.info)

console.log("-----------------TURN---------------")
//turn
action = {playerIndex: 1, action:"RAISE", value:5} // smallblind
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 3, action:"FOLD", value:2} 
console.log(game.playerAction(action))
console.log(game.info)


action = {playerIndex: 0, action:"CALL", value:5}
console.log(game.playerAction(action))
console.log(game.info)


console.log("-----------------RIVER---------------")
action = {playerIndex: 1, action:"CHECK", value:5} // smallblind
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 0, action:"RAISE", value:20}
console.log(game.playerAction(action))
console.log(game.info)

action = {playerIndex: 1, action:"CALL", value:20} // smallblind
console.log(game.playerAction(action))
console.log(game.info)


// const yeehaw = require('./yeehawholdem.js')

// players = [new yeehaw.Player("Sean"), new yeehaw.Player("Rasheed"), new yeehaw.Player("Jolo"), new yeehaw.Player("Bags")]
// game = new yeehaw.Yeehaw(players, 1, 2);
// console.log(game.info)

// action = {playerIndex: 3, action:"CALL", value:2} 
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 0, action:"CALL", value:2}
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 1, action:"CALL", value:1} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 2, action:"CHECK", value:1}  // bigblind
// console.log(game.playerAction(action))
// console.log(game.info)

// //flop
// console.log("-----------------FLOP---------------")
// action = {playerIndex: 1, action:"CHECK", value:1} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 2, action:"FOLD", value:1}  // bigblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 3, action:"CHECK", value:2} 
// console.log(game.playerAction(action))
// console.log(game.info)


// action = {playerIndex: 0, action:"CHECK", value:2}
// console.log(game.playerAction(action))
// console.log(game.info)

// // turn
// console.log("-----------------Turn---------------")
// action = {playerIndex: 1, action:"CHECK", value:1} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 3, action:"RAISE", value:5} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 0, action:"CALL", value:5} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 1, action:"CALL", value:5} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// //river
// console.log("-----------------river---------------")
// action = {playerIndex: 1, action:"RAISE", value:20} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 3, action:"CALL", value:20} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)

// action = {playerIndex: 0, action:"FOLD", value:5} // smallblind
// console.log(game.playerAction(action))
// console.log(game.info)


