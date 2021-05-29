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

let game;
let status = { active:false }
let players = [];
io.on('connection', (socket) => {
  console.log("a user has connected")

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
    if (players.length>0){
      game = new yeehaw.Yeehaw(players, data.sb, data.bb);
      io.emit('NEW_GAME', game);
      console.log("GAME STARTED: " + game);
    } else {
      io.emit('NO_PLAYERS', game);
      console.log("NO PLAYERS");
    }
    
  })

  socket.on('RESET_GAME', data => {
    game = new yeehaw.Yeehaw(players, data.sb, data.bb);
    io.emit('NEW_GAME', game);
    console.log("GAME RESET: " + game);
  })

  socket.on('PLAYER_ACTION', action => {
    let gamestate = game.playerAction(action);
    if (gamestate.isValid)
      io.emit(gamestate.result, game);
    else
      io.emit('ACTION_ERROR', gamestate);
    console.log("PLAYER_ACTION" + game);
  }); 


});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
