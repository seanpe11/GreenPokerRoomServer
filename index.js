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

let game = {phase: -1};
let status = { active:false }
let players = [];
io.on('connection', (socket) => {
  console.log("a user has connected")
  socket.emit("UPDATE_GAME", game);

  socket.on("hello", () => {
    console.log("someone says hello")
  })

  socket.on("test", test => {
    console.log(test);
  })

  socket.on('PLAYER_JOIN', player => {
    player = new yeehaw.Player(player.name);
    
    if (players.length == 4){
      io.emit('TABLE_FULL', game);
      console.log("TABLE FULL NO ADD: " + player);
    } else {
      players.push(player);
      io.emit('PLAYER_JOIN', player);
      console.log("PLAYER ADDED: " + player);
    }
    
  })

  socket.on('PLAYER_LEAVE', player => {
    
  })

  // get the game
  

  socket.on('START_GAME', data => {
    if (players.length>1){
      game = new yeehaw.Yeehaw(players, data.sb, data.bb);
      io.emit('UPDATE_GAME', game);
      console.log("GAME STARTED: " + game.players);
    } else {
      io.emit('ERROR', {error: "Error: Not enough players joined!"});
      console.log("NO PLAYERS");
    }
    
  })

  socket.on('RESET_GAME', data => {
    game = new yeehaw.Yeehaw(players, data.sb, data.bb);
    io.emit('UPDATE_GAME', game);
    console.log("GAME RESET: " + game);
  })

  socket.on('PLAYER_ACTION', action => {
    let gamestate = game.playerAction(action);
    if (gamestate.isValid)
      io.emit("PLAYER_ACTION", { game: game, gamestate: gamestate });
    else
      io.emit('ERROR', "Error: Player can't make that move!");
    console.log("PLAYER_ACTION" + { game: game, gamestate: gamestate });
  }); 


});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
