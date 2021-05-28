const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const yeehaw = require('./yeehawholdem.js')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let game;
let players = [];
io.on('connection', (socket) => {
  console.log("a user has connected")

  socket.on("hello", () => {
    console.log("someone says hello")
  })

  socket.on('PLAYER_JOIN', player => {
    player = new yeehaw.Player(player.name, player.start);
    
    if (players.length == 4){
      io.emit('TABLE_FULL', game);
    } else {
      io.emit('PLAYER_JOIN', player);
    }
  })

  socket.on('START_GAME', data => {
    game = new yeehaw.Yeehaw(players, data.sb, data.bb);
    io.emit('NEW_GAME', game);
  })

  socket.on('RESET_GAME', data => {
    game = new yeehaw.Yeehaw(players, data.sb, data.bb);
    io.emit('NEW_GAME', game);
  })

  socket.on('PLAYER_ACTION', action => {
    let gamestate = game.playerAction(action);
    if (gamestate.isValid)
      io.emit(gamestate.result, game);
    else
      io.emit('ACTION_ERROR', gamestate.result);
  }); 


});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
