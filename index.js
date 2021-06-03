const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const yeehaw = require('./yeehawholdem.js')


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/playerTest', (req, res) => {
  let wow = new yeehaw.Player("seasn", 100);
  res.send(wow);
})

let game = { notstarted: true };
let gaming = false;
let players = [];

// game = new yeehaw.Yeehaw(players, 10, 20)
// console.log("GAME INITIALIZED")

io.on('connection', (socket) => {
  console.log("a user has connected")
  // socket.emit("UPDATE_GAME", game);


  // socket.on("test", () => {
  //   players = [new yeehaw.Player("Sean"), new yeehaw.Player("Rasheed"), new yeehaw.Player("Jolo"), new yeehaw.Player("Bags")]
  //   game = new yeehaw.Yeehaw(players, 10, 20)
  //   socket.emit("UPDATE_GAME", game)
  //   console.log("TEST")
  //   console.log(JSON.stringify(game.players))
  // })


  socket.on('PLAYER_JOIN', requester => {
    
    let alreadyplaying = players.map((val) => {return val.name}).indexOf(requester.name)

    if ( alreadyplaying != -1 ){

      player = players[alreadyplaying];
      player.playerPos = alreadyplaying;
      io.to(socket.id).emit('JOIN_CONFIRM', player)
      io.emit('PLAYER_JOIN', player)
      console.log("PLAYER REJOIN");
      io.emit('TOAST', "Player " + player.name + " rejoined the table.");

    }
    else if (players.length == 4){
      io.to(socket.id).emit('TOAST', "Table is full!");
      console.log("TABLE FULL NO ADD: " + player);
    } else {
      player = new yeehaw.Player(requester.name);
      players.push(player);
      player.playerPos = players.map((val) => {return val.name}).indexOf(player.name)
      io.emit('PLAYER_JOIN', player);
      io.to(socket.id).emit('JOIN_CONFIRM', player);
      console.log("PLAYER ADDED: " + player);
    }
  })
  socket.on('PLAYER_LEAVE', player => {
    
  })

  // starters and stoppers
  socket.on('START_GAME', data => {
    if (players.length==4){
      game = new yeehaw.Yeehaw(players, 10, 20);
      gaming = true
      io.emit('UPDATE_GAME', game);
      console.log("GAME STARTED: " + game.info);
    } else {
      io.emit('TOAST', "Need more players!");
      console.log("NOT 4 PLAYERS");
      io.emit('WAITING', players);
    }
  })

  socket.on("NEW_ROUND", () => {
    game.newRound();
    socket.emit('UPDATE_GAME', game);
  })

  socket.on('RESET_GAME', data => {
    players = []
    game = {}
    io.emit("GAME_RESET");
    gaming = false
    console.log("GAME RESET: " + game.info);
  })

  // game events
  socket.on('PLAYER_ACTION', action => {
    if (gaming) {
      let gamestate = game.playerAction(action);
      if (gamestate.isValid)
        io.emit("PLAYER_ACTION", { game: game, gamestate: gamestate });
      else
        io.to(socket.id).emit('TOAST', "It's " + game.players[game.toact].name +" turn to act!");
      console.log("PLAYER_ACTION: " + gamestate.result);
    }
  }); 

  socket.on('UPDATE_CLIENT', (playername) => {
    if (gaming)
      io.to(socket.id).emit('UPDATE_GAME', game);
    else
      io.to(socket.id).emit('WAITING', players);
    console.log("UPDATE requested by player " + playername);
  })



});

http.listen(port, () => {
  
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});