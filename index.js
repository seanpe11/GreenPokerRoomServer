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


  socket.on("test", test => {
    console.log(test);
  })

  socket.on('PLAYER_JOIN', player => {
    player = new yeehaw.Player(player.name);
    stack = new yeehaw.Player(player.stack);
    
    if (players.length == 4){
      io.emit('TABLE_FULL', game);
      console.log("TABLE FULL NO ADD: " + player);
    } else {
      players.push(player);
      io.emit('PLAYER_JOIN', player);
<<<<<<< HEAD
      console.log("PLAYER ADDED: " + player.name);
=======
      console.log("PLAYER ADDED: " + players);
>>>>>>> fdef64ccba6db1c63c909d807153749fe8ce0196
    }
    
  })

  socket.on('PLAYER_LEAVE', player => {
    
  })

  // get the game
  

  socket.on('START_GAME', data => {
    if (players.length>1){
      game = new yeehaw.Yeehaw(players, data.sb, data.bb);
      io.emit('UPDATE_GAME', game);
      console.log("GAME STARTED: " + game.info);
    } else {
      io.emit('ERROR', {error: "Error: Not enough players joined!"});
      console.log("NO PLAYERS");
    }
    
  })

  socket.on('RESET_GAME', data => {
    game = new yeehaw.Yeehaw(players, data.sb, data.bb);
    io.emit('UPDATE_GAME', game);
    console.log("GAME RESET: " + game.info);
  })

  socket.on('PLAYER_ACTION', action => {
    console.log("inside socket")
    let gamestate = game.playerAction(action);
    if (gamestate.isValid)
      io.emit("PLAYER_ACTION", { game: game, gamestate: gamestate });
    else
      io.emit('ERROR', "Error: Player can't make that move!");
    console.log("PLAYER_ACTION: " + game.info);
  }); 



});

http.listen(port, () => {
  
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
