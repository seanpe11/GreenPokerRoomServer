const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const { Socket } = require('dgram');
const yeehaw = require('./yeehawholdem.js')


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/playerTest', (req, res) => {
  let wow = new yeehaw.Player("seasn", 100);
  res.send(wow);
})

let game = { notstarted: true };
let status = { active: false }
let players = [];
let ready = false;
io.on('connection', (socket) => {
  console.log("a user has connected")
  // socket.emit("UPDATE_GAME", game);


  socket.on("test", () => {
    players = [new yeehaw.Player("Sean"), new yeehaw.Player("Rasheed"), new yeehaw.Player("Jolo"), new yeehaw.Player("Bags")]
    game = new yeehaw.Yeehaw(players, 1, 2)
    socket.emit("UPDATE_GAME", game)
    console.log("TEST")
    console.log(JSON.stringify(game.players))
  })

  socket.on('PLAYER_JOIN', player => {
    
    let alreadyplaying = players.map((val) => {return val.name}).indexOf(player.name)

    if ( alreadyplaying != -1 ){

      player = players[alreadyplaying];
      player.playerPos = alreadyplaying;
      io.emit('JOIN_CONFIRM', player)
      console.log("PLAYER REJOIN");
      io.emit('TOAST', "You've rejoined the table.");

    }
    else if (players.length == 4){

      io.emit('TOAST', "TOAST: Table is full!");
      console.log("TABLE FULL NO ADD: " + player);

    } else {
      player = new yeehaw.Player(player.name);
      players.push(player);
      player.playerPos = players.map((val) => {return val.name}).indexOf(player.name)
      io.emit('PLAYER_JOIN', player);
      io.emit('JOIN_CONFIRM', player);
      console.log("PLAYER ADDED: " + player);

    }
    
  })

  socket.on('FIND_PLAYER', player => {

  })

  socket.on('PLAYER_LEAVE', player => {
    
  })

  // get the game
  

  socket.on('START_GAME', data => {
    if (players.length>1){
      game = new yeehaw.Yeehaw(players, 10, 20);
      io.emit('UPDATE_GAME', game);
      console.log("GAME STARTED: " + game.info);
    } else {
      io.emit('TOAST', {TOAST: "TOAST: Not enough players joined!"});
      console.log("NO PLAYERS");
    }
    
  })

  socket.on('RESET_GAME', data => {
    game = new yeehaw.Yeehaw(players, 10, 20);
    io.emit('UPDATE_GAME', game);
    console.log("GAME RESET: " + game.info);
  })

  socket.on('PLAYER_ACTION', action => {
    let gamestate = game.playerAction(action);
    if (gamestate.isValid)
      io.emit("PLAYER_ACTION", { game: game, gamestate: gamestate });
    else
      io.emit('TOAST', "TOAST: Player can't make that move!");
    console.log("PLAYER_ACTION: " + gamestate.result);
  }); 

  socket.on('UPDATE_CLIENT', (playername) => {
    io.emit('UPDATE_GAME', game);
  })



});

http.listen(port, () => {
  
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});