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
    best = [];
    constructor(name, startingStack){
        this.name = name;
        this.stack = startingStack;
    }
}

let Yeehaw = class {
    deck = [];
    handTypeNames = ['HIGH_CARD', 'PAIR', 'TWO_PAIR', 'THREE_OF_A_KIND', 'STRAIGHT', 'FLUSH', 'FULL_HOUSE', 'FOUR_OF_A_KIND', 'STRAIGHT_FLUSH'];
    betPhases = ['Pre-Flop', 'Flop', 'Turn', 'River'];
    phase = 0;

    // cards are represented as int 1-13 for the card value, 0-3 for suits

    constructor(arrPlayers, sb, bb){
        this.players = arrPlayers; //will be 2d array with card objects
        this.sb = smallblind; 
        this.bb = bigblind;
        // indexes of player with designation
        this.button = 0; 
        this.smallblind = (this.button + 1) % this.players.length; // make sure it loops around
        this.bigblind = (this.smallblind + 1) % this.players.length;
        this.currentTurn = (this.bigblind + 1) % this.players.length;
        // values for each turn
        this.pot = this.sb + this.bb;
        this.currentBet = this.bb;
        this.notfolded = [...Array(this.players.length).keys()];// players not folded
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

    // function after showdown
    newRound(){
        this.phase = 0;
        this.board = [];
        this.playerHands = [];
        this.button++;
        this.button = this.button % this.players.length; // make sure it loops around
        this.smallblind = (this.button + 1) % this.players.length;
        this.bigblind = (this.smallblind + 1) % this.players.length;
        this.currentTurn = (this.bigblind + 1) % this.players.length;
        this.pot = this.sb + this.bb;
        this.notfolded = [...Array(this.players.length).keys()];
    }

    // for next player action
    nextturn() {
        this.currentTurn++;
        this.currentTurn % this.players.length;
        // set condition to start next phase
        if (somethign){
            nextphase();
        }
    }

    // for next betting phase (pre-flop, flop, turn, river, showdown)
    nextphase() {
        this.phase++;
    }

    // player actions
    playerAction(action){
        if (action.playerIndex != this.currentTurn) { return "INVALID PLAYER" };

        switch(action.action){
            case "BET":
                if(action.value > this.currentBet){
                    if (action.value >= this.players[action.playerIndex].stack){
                        this.players[action.playerIndex].stack = 0; // player's bet makes him go all in
                        this.currentBet = action.value;
                        this.nextturn();
                        return "ALL IN";
                    } else {
                        this.players[action.playerIndex].stack -= action.value; // deduct bet from player stack
                        this.nextturn();
                        return "BET";
                    }
                } else {
                    return "INVALID BET";
                }
            case "CHECK":
                if(action.playerIndex == this.bigblind && this.currentBet == this.bb){
                    this.nextturn();
                } else if (this.currentBet == 0) {
                    this.nextturn();
                } else {
                    return "INVALID CHECK";
                }
            case "FOLD":
                this.notfolded = this.notfolded.filter((value) ) // remove player from notfolded
        }
    }

    showdown(){
        
    }

    deal() {
        this.deck = [];
        let i;
        for (i=0;i<52;i++){
            this.deck.push(i+1);
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

            this.playerHands.push(hand);
        }
    }

    reshuffle() {
        let i;
        this.deck = [];
        for (i=0;i<52;i++){
            this.deck.push(i+1);
        }
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