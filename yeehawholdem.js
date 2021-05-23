function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function cardToString(card){
    let cardString = "";
    let faces = ['J', 'Q', 'K'];
    let suits = ['c','d','h','s'];
    
    if (card.val == 1) {
        cardString = cardString.concat('A');
    } else if (card.val > 10) {
        cardString = cardString.concat(faces[card.val-11]);
    } else {
        cardString = cardString.concat(card.val);
    }

    cardString = cardString.concat(suits[0]);

    return cardString;
}

let Player = class {
    name = "";
    stack = 100;
    hand = [];
    best = []; // best 5 cards
    constructor(name, startingStack){
        this.name = name;
        this.stack = startingStack;
    }
}

let Yeehaw = class {
    deck = []; // deck of cards, drawing without replacement
    board = []; // board of cards, numbers only
    phase = 0; // betting phase
    handTypeNames = ['HIGH_CARD', 'PAIR', 'TWO_PAIR', 'THREE_OF_A_KIND', 'STRAIGHT', 'FLUSH', 'FULL_HOUSE', 'FOUR_OF_A_KIND', 'STRAIGHT_FLUSH'];
    betPhases = ['Pre-Flop', 'Flop', 'Turn', 'River'];
    

    // cards are represented as int 1-13 for the card value, 0-3 for suits

    constructor(arrPlayers, sb, bb){
        this.players = arrPlayers; //will be 2d array with card objects
        this.sb = sb; 
        this.bb = bb;
        // indexes of player with designation
        this.button = 0; 
        this.smallblind = (this.button + 1) % this.players.length; // make sure it loops around
        this.bigblind = (this.smallblind + 1) % this.players.length;
        this.underthegun = (this.bigblind + 1) % this.players.length;
        this.toact = this.underthegun;
        this.lastbet = this.bigblind; // when betting reaches this person, round of betting ends
        // values for each turn
        this.pot = this.sb + this.bb;
        this.currentBet = this.bb;
        this.notfolded = [...Array(this.players.length).keys()];// index of players not folded
    }

    get smallblind_json(){
        return this.players[smallblind];
    }
    get bigblind_json(){
        return this.players[bigblind];
    }
    get button_json(){
        return this.players[button];
    }
    get strPhase(){
        return this.betPhases[this.phase];
    }

    // player actions: returns string whether 
    // action is a json object with the following properties
    // ----- playerIndex: index of player who made action
    // ----- value: bet value of action
    // ----- action: str of what player did
    playerAction(action){
        if (action.playerIndex != this.toact) { return { result: "INVALID PLAYER", isValid: false } };

        switch(action.action){
            case "CHECK":
                if(action.playerIndex == this.bigblind && this.currentBet == this.bb){ 
                    this.nextturn();
                    return { result: "CHECK", isValid: true };
                } else if (this.currentBet == 0) {
                    this.nextturn();
                    return { result: "CHECK", isValid: true };
                } else {
                    return { result: "INVALID CHECK", isValid: false };
                }

            case "CALL":
                if (action.value == this.currentBet){
                    this.players[action.playerIndex].stack -= this.currentBet;
                    this.nextturn();
                    return { result: "CALL", isValid: true };
                } else if (action.value >= this.players[action.playerIndex].stack){
                    this.players[action.playerIndex].stack = 0; // player's bet makes him go all in
                    this.nextturn();
                    return { result: "FORCED ALL IN", isValid: true };
                } else {
                    return { result: "INVALID CALL", isValid: false };
                }

            case "RAISE":
                if(action.value > this.currentBet){
                    if (action.value >= this.players[action.playerIndex].stack){
                        this.players[action.playerIndex].stack = 0; // player's bet makes him go all in
                        this.currentBet = action.value;
                        this.nextturn();
                        return { result: "ALL IN", isValid: true };
                    } else if (action.value >= this.currentBet + this.bb) {
                        this.players[action.playerIndex].stack -= action.value; // deduct bet from player stack
                        this.nextturn();
                        return { result: "RAISE", isValid: true };
                    } 
                } else {
                    return { result: "INVALID RAISE", isValid: true };
                }

            case "FOLD":
                let remove = this.notfolded.indexOf(playerIndex);
                if (remove == -1){
                    return { result: "INVALID FOLD", isValid: false };
                } 
                this.notfolded.splice(remove, 1);
                this.nextturn();
                return { result: "FOLD", isValid: true };

            default:
                return { result: "INVALID ACTION", isValid: true };
        }
    }


    // function after showdown
    newRound(){
        this.phase = 0;
        this.board = [];
        this.button++;
        this.button = this.button % this.players.length; // make sure it loops around
        this.smallblind = (this.button + 1) % this.players.length;
        this.bigblind = (this.smallblind + 1) % this.players.length;
        this.underthegun = (this.bigblind + 1) % this.players.length;
        this.toact = this.underthegun;
        this.pot = this.sb + this.bb;
        this.players[this.smallblind].stack -= this.sb; 
        if (this.players[this.smallblind].stack > 0){
            this.players[this.smallblind].stack = 0; // forced all-in cause of small blind
        }
        this.players[this.bigblind].stack -= this.bb;
        if (this.players[this.bigblind].stack > 0){
            this.players[this.bigblind].stack = 0; // forced all-in cause of big blind
        }
        this.currentBet = this.bb;
        this.notfolded = [...Array(this.players.length).keys()]; // first round, so all players not folded
        this.deal();
    }

    // for next player action
    nextturn() {
        this.toact++;
        this.toact % this.notfolded.length;
        // set condition when betting ends
        if (this.toact == this.lastbet){ // if lastbet goes back around
            nextphase();
        }
    }

    // for next betting phase (pre-flop, flop, turn, river, showdown), condition for each
    nextphase() {
        this.phase++;
        switch (phase){
            case 1:
                this.flop(); // 3 cards to board
                break;
            case 2:
                this.turn(); // 1 card to board
                break;
            case 3:
                this.river(); // 1 card to board
                break;
            case 4:
                this.showdown(); // showcards
                break;
        }
    }

    
    deal() {
        this.deck = [];
        let i;
        for (i=1;i<=52;i++){
            this.deck.push(i);
        }
        shuffle(this.deck);
        for(i=0;i<this.players.length;i++){
            var hand = [];
            var draw = this.deck.pop();
            let card = {
                val: Math.floor(draw%13+1),
                suit: Math.floor(draw/13),
                numval: draw
            };
            hand.push(card);
            let draw2 = this.deck.pop();
            card = {
                val: Math.floor(draw2%13+1),
                suit: Math.floor(draw2/13),
                numval: draw2
            };
            hand.push(card);

            console.log(draw + " " + draw2);

            this.players[i].hand = hand;
        }
    }

    flop(){
        this.board.push(this.deck.pop()); // too lazy to make this a for loop
        this.board.push(this.deck.pop());
        this.board.push(this.deck.pop());
        this.currentBet = 0;
        this.toact = this.button + 1; 
    }

    turn(){
        this.board.push(this.deck.pop());
        this.currentBet = 0;
        this.toact = this.button + 1;
    }

    river(){
        this.board.push(this.deck.pop());
        this.currentBet = 0;
        this.toact = this.button + 1;
    }

    showdown(){
        // place showdown code here 

        this.newRound();
    }

    

    bestHandTypes(){
        let hand = this.playerHands[playerIndex];
        let i;
        for (i=9;i>=0;i++){ //iterate backwards, as soon as we find the highest thats our handtype

        }
        return this.handTypeNames[i];
    }

    // returns index of highest hand from all players involved
    getWinner(arrHands){
        arrFound = [];
        let i;
        for(i=0;i<arrHands.length;i++){
            
        }
    }

    highCard(hand) {
        let i;
        for (i=0;i<hand.length;i++){
            
        }
    }
}

exports.Yeehaw = yeehaw;
exports.Player = player;