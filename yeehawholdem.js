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

class Player {
    name = "";
    stack = 1000;
    score = 0;
    isWinner = false;
    hand1 = {};
    hand2 = {};
    best = []; // best 5 cards
    constructor(name){
        this.name = name;
        this.ready = false;
    }
}

class Card {
    constructor(value, suit, number){
        this.val = value;
        this.suit = suit;
        this.numval = number;

        let cardString = "";
        let faces = ['J', 'Q', 'K', 'A'];
        let suits = ['c','d','h','s'];
        
        if (this.val == 13) {
            cardString = cardString.concat('A');
        } else if (this.val >= 10) {
            cardString = cardString.concat(faces[this.val-10]);
        } else {
            cardString = cardString.concat(this.val+1);
        }

        this.cardString = cardString.concat(suits[this.suit]);
    }
}

class Yeehaw {
    deck = []; // deck of cards, drawing without replacement
    board = []; // board of cards, numbers only
    phase = 0; // betting phase

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
        this.sidepot = this.sb + this.bb; // in case someone goes all in and there are other players still betting after one goes all in
        this.currentBet = this.bb; // bet to match or raise to stay in the pot
        this.players[this.smallblind].stack -= this.sb; 
        this.players[this.bigblind].stack -= this.bb;
        this.notfolded = [...Array(this.players.length).keys()];// index of players not folded
        this.deal();
    }

    get info(){
        let infostring = "\n"
            + "board: " + JSON.stringify(this.board) + "\n"
            + "phase: " + this.phase + " currentbet: " + this.currentBet + " toact: " + this.toact + " notfolded: " + this.notfolded + "\n"
            + "button: " + this.button + " sb: " + this.sb + " bb: " + this.bb + " pot: " + this.pot + " lastBet: " + this.lastbet + "\n";
        // infostring.concat("currentbet: " + this.currentBet + "toact: " + this.toact + "notfolded: " + this.notfolded + "\n");
        // infostring.concat("button: " + this.button + "sb: " + this.sb + "bb: " + this.bb + "pot: " + this.pot + "\n");
        return infostring;
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
        if (action.playerIndex != this.toact) { 
            return { result: "INVALID PLAYER", isValid: false } 
        }else{
            console.log("INSIDE ACTION", action)
            switch(action.action){
                case "CHECK":
                    if( action.playerIndex == this.bigblind && this.currentBet == this.bb){ 
            
                        this.nextturn();
                        return { result: "CHECK", isValid: true, playerIndex: action.playerIndex, value: action.value };
                    } else if (this.currentBet == 0 ) {
                            this.nextturn();
                        return { result: "CHECK", isValid: true, playerIndex: action.playerIndex, value: action.value };
                    } else if(action.playerIndex != this.bigblind && this.currentBet != 0 )
                    {
                        return { result: "INVALID CHECK", isValid: false, playerIndex: action.playerIndex, value: action.value };
                    }
                    break;

                case "CALL":
                    if (action.value == this.currentBet){
                        this.players[action.playerIndex].stack -= this.currentBet;
                        this.pot += this.currentBet;
                        this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
                        if (this.toact == this.lastbet) // TODO: condition when bet has been matched
                            { 
                                this.nextphase();
                            } 
                        
                        return { result: "CALL", isValid: true, playerIndex: action.playerIndex, value: action.value };
                    } else if (action.value >= this.players[action.playerIndex].stack){
                        this.pot += this.players[action.playerIndex].stack;
                        this.players[action.playerIndex].stack = 0; // player's bet makes him go all in
                        this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
                        if (this.toact == this.lastbet) // TODO: condition when bet has been matched
                            { 
                                this.nextphase();
                            } 
                        return { result: "FORCED ALL IN", isValid: true, playerIndex: action.playerIndex, value: action.value };
                    } else if (action.playerIndex == this.smallblind && this.currentBet == this.bb) {
                        this.players[this.smallblind].stack =this.players[this.smallblind].stack - (this.bigblind - this.smallblind);
                        this.pot = this.pot + (this.bigblind - this.smallblind);
                        
                        if (this.toact == this.lastbet) // TODO: condition when bet has been matched
                            { 
                                this.nextphase();
                            } 
                        this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
                        return { result: "CALL", isValid: true, playerIndex: action.playerIndex, value: action.value };
                    } else {
                        return { result: "INVALID CALL", isValid: false, playerIndex: action.playerIndex, value: action.value };
                    }
                    break;

                case "RAISE":
                    if(action.value > this.currentBet){
                        if (action.value >= this.players[action.playerIndex].stack){
                            this.pot += this.player[action.playerIndex].stack;
                            this.players[action.playerIndex].stack = 0; // player's bet makes him go all in
                            this.currentBet = action.value;
                            this.lastbet = action.playerIndex;
                            this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
                            return { result: "ALL IN", isValid: true, playerIndex: action.playerIndex, value: action.value };
                        } else if (action.value >= this.currentBet + this.bb) {
                            this.pot += action.value;
                            this.players[action.playerIndex].stack -= action.value; // deduct bet from player stack
                            this.currentBet = action.value; 
                            this.lastbet = action.playerIndex;
                            this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
                            return { result: "RAISE", isValid: true, playerIndex: action.playerIndex, value: action.value };
                        } 
                    } else {
                        return { result: "INVALID RAISE", isValid: true, playerIndex: action.playerIndex, value: action.value, playerIndex: action.playerIndex, value: action.value };
                    }
                    break;

                case "FOLD":
                    let remove = this.notfolded.indexOf(action.playerIndex);
                    if (remove == -1){
                        return { result: "INVALID FOLD", isValid: false, playerIndex: action.playerIndex, value: action.value };
                    } 
                    
                    this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
                    
                    this.notfolded.splice(remove, 1);
                    if (this.toact == this.lastbet) // TODO: condition when bet has been matched
                            { 
                                this.nextphase();
                            } 
                    return { result: "FOLD", isValid: true, playerIndex: action.playerIndex, value: action.value };

                default:
                    return { result: "INVALID ACTION", isValid: true, playerIndex: action.playerIndex, value: action.value };
            }
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
        this.toact = (this.bigblind + 1) % this.players.length;
        this.lastbet = this.bigblind;
        this.pot = this.sb + this.bb;
        this.currentBet = this.bb;
        this.players[this.smallblind].stack -= this.sb; 
        if (this.players[this.smallblind].stack < 0){
            this.players[this.smallblind].stack = 0; // forced all-in cause of small blind
        }
        this.players[this.bigblind].stack -= this.bb;
        if (this.players[this.bigblind].stack < 0){
            this.players[this.bigblind].stack = 0; // forced all-in cause of big blind
        }
        this.notfolded = [...Array(this.players.length).keys()]; // first round, so all players not folded
        this.deal();
    }

    // for next player action
    nextturn() {
        
        // if someone goes all in, skip their turn but don't fold them
        if (this.players[this.toact].stack == 0){
            this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length];
        }

        // set condition when betting ends
        if (this.toact == this.lastbet) // TODO: condition when bet has been matched
        { 
            this.nextphase();
        } 
        
        else if (this.notfolded.length == 1) // all players have folded except one
        { 
            this.players[this.notfolded[0]].stack += this.pot;
            // something about highlighting winner
            this.newRound();
        }else{
            this.toact = this.notfolded[(this.notfolded.indexOf(this.toact) + 1) % this.notfolded.length]
        }
    }
    
    // for next betting phase (pre-flop, flop, turn, river, showdown), condition for each
    nextphase() {
        let i;
        this.phase++;
        switch (this.phase){
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
                let count = 0
                let temp = 0
                this.showdown(); // showcards
                for(i=0;i<this.players.length;i++)
                    if(this.players[i].isWinner == true){
                        count++
                        temp = i
                        
                    }
                if(count== 1){
                    console.log("Player " + [temp] + "is the Winner")
                }else if(count > 1){
                    console.log("Split Pot")
                }   
                break;
        }
    }

    
    deal() {
        this.deck = [];
        let i;
        for (i=0;i<52;i++){
            this.deck.push(new Card(Math.floor(i%13+1), Math.floor(i/13), i));
        }
        shuffle(this.deck);
        for(i=0;i<this.players.length;i++){

            let draw1 = this.deck.pop();
            let draw2 = this.deck.pop();

            this.players[i].hand1 = draw1;
            this.players[i].hand2 = draw2;

        }
    }

    flop(){
        this.board.push(this.deck.pop()); // too lazy to make this a for loop
        this.board.push(this.deck.pop());
        this.board.push(this.deck.pop());
        this.currentBet = 0;
        this.findFirstToAct(); 
    }

    turn(){
        this.board.push(this.deck.pop());
        this.currentBet = 0;
        this.findFirstToAct();
    }

    river(){
        this.board.push(this.deck.pop());
        this.currentBet = 0;
        this.findFirstToAct();
    }

    // finds first player after the button; this player is first to act for next phase of betting
    findFirstToAct(){
        let i
        let toactSB = this.notfolded.indexOf(this.smallblind)
        let toactBB = this.notfolded.indexOf(this.bigblind)
        let toactBTN = this.notfolded.indexOf(this.button)
        let toactUTG = this.notfolded.indexOf(this.underthegun)
        if(toactSB == -1){
            this.toact = this.bigblind;
        } else if(toactBB == -1 && toactSB == -1){
            this.toact == this.underthegun;
        }else{
            this.toact = this.smallblind
        }

        if(toactBTN != -1){
            this.lastbet = this.notfolded.indexOf(this.button)
        } else if (toactUTG != -1){
            this.lastbet = this.notfolded.indexOf(this.underthegun)
        } else{
            this.lastbet = this.notfolded.indexOf(this.bigblind)
        }
    }

    showdown(){
        // place showdown code here 
        this.getWinner()
    }

    bestHandTypes(){
        let hand = this.playerHands[playerIndex];
        let i;
        for (i=9;i>=0;i++){ //iterate backwards, as soon as we find the highest thats our handtype

        }
        return this.handTypeNames[i];
    }

    // returns index of highest hand from all players involved
    getWinner(){
        

        let showdowners = [];
        let sevencards = []
        let tempcards
        let tempboard = this.board
        let card1, card2
        let temp, split
        let total1 = 0;
        let total2=0;
        let straightflush, quads, fullhouse, flush, straight, trips, twopair, pair, highcard;
        let i,j;
        for (i=0;i<this.notfolded.length;i++){
            showdowners.push(this.players[this.notfolded[i]]);
            
        }
        
        for(i=0;i<showdowners.length;i++){
            
            card1 = showdowners[i].hand1
            card2 = showdowners[i].hand2
            sevencards = tempboard
            sevencards.push(card1)
            sevencards.push(card2)
            tempcards = sevencards
            

            // get best hand for each    
            let straightflush = this.evalStraightFlush(tempcards)
            // console.log("1")
            // console.log(tempcards)
            let quads = this.evalQuads(tempcards)
            // console.log("2")
            // console.log(tempcards)
            let fullhouse = this.evalFullHouse(tempcards)
            // console.log("3")
            // console.log(tempcards)
            let flush = this.evalFlush(tempcards)
            // console.log("4")
            // console.log(tempcards)
            let straight = this.evalStraight(tempcards)
            // console.log("5")
            // console.log(tempcards)
            let trips = this.evalTrips(tempcards)
            // console.log("6")
            // console.log(tempcards)
            let twopair = this.evalTwoPair(tempcards)
            // console.log("7")
            // console.log(tempcards)
            let pair = this.evalPair(tempcards)
            // console.log("8")
            // console.log(tempcards)
            let highcard = this.evalHighCard(tempcards)
            // console.log("9")
            // console.log(tempcards)
            if(straightflush.isThis == true){
                showdowners[i].score = straightflush.score
                showdowners[i].bestFive = straightflush.bestFive
            } else if(quads.isThis == true){
                showdowners[i].score = quads.score
                showdowners[i].bestFive = quads.bestFive
            }else if(fullhouse.isThis == true){
                showdowners[i].score = fullhouse.score
                showdowners[i].bestFive = fullhouse.bestFive
            }else if(flush.isThis == true){
                showdowners[i].score = flush.score
                showdowners[i].bestFive = flush.bestFive
            }else if(straight.isThis == true){
                showdowners[i].score = straight.score
                showdowners[i].bestFive = straight.bestFive
            }else if(trips.isThis == true){
                showdowners[i].score = trips.score
                showdowners[i].bestFive = trips.bestFive
            }else if(twopair.isThis == true){
                showdowners[i].score = twopair.score
                showdowners[i].bestFive = twopair.bestFive
            }else if(pair.isThis == true){
                showdowners[i].score = pair.score
                showdowners[i].bestFive = pair.bestFive
            }else if(highcard.isThis == true){
                showdowners[i].score = highcard.score
                showdowners[i].bestFive = highcard.bestFive
            }
            console.log("PLAYER " + this.notfolded[i] + " score " + showdowners[i].score)
            console.log("PLAYER " + this.notfolded[i])
            console.log(tempcards)
            sevencards = []
            sevencards.length = 0
            tempcards = []
            tempcards.length = 0
            card1 = 0
            card2 = 0

        }

        for(i=0;i<showdowners.length-1;i++){
            if(showdowners[i].score>showdowners[i+1].score){
                temp = i
            }else if (showdowners[i].score == showdowners[i+1].score){
                for(j=0;j<showdowners[i].bestFive.length;j++){
                    total1 += showdowners[i].bestFive[j].val
                }
                for(j=0;j<showdowners[i+1].bestFive.length;j++){
                    total2 += showdowners[i].bestFive[j].val
                }
                if(total1>total2){
                    temp = i
                }else if(total1<total2){
                    temp=i+1
                }else{
                    split = i
                    temp=-1
                }
            }else{
                temp=i+1
            }
        }
        if(temp!=-1){
            this.players[this.notfolded[temp]].isWinner = true
            this.players[this.notfolded[temp]].stack += this.pot
            
            //show hand 1 and hand 2
        }else{
            //split pot
            this.players[this.notfolded[split]].stack = this.pot/2
            this.players[this.notfolded[split + 1]].stack = this.pot/2
        }
        //this.newRound();


        // figure out who wins
    }


    evalStraightFlush(seven) {
        
        let i, j;
        let count = 0;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-1;i++){
            if (seven[i].val-1 == seven[i+1].val){
                count++;
                if (count >= 4)
                    j = i+1;
            } else {
                count = 0;
            }
        }
        
        if (count == 4){
            bestfive.push(...seven.slice(j-4, 5));
            for (i=0;i<bestfive.length-1;i++){
                if (bestfive[i].suit != bestfive[i+1].suit){
                    return false;
                }
            }
            if (bestfive[0].val == 13 && bestfive[1].val == 12){
                return { isThis:true, score: 10, bestFive: bestfive}
            }
            return { isThis:true, score: 9, bestFive: bestfive}
        }
        
        return {isThis: false};
        
    }

    evalQuads(seven){
        
        let i;
        let found = false;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-3;i++){
            if (seven[i].val == seven[i+1].val && seven[i].val == seven[i+2].val && seven[i].val == seven[i+3].val){
                found = true;
                break;
            }
        }
      
        if (found) {
            bestfive.push(...seven.slice(i, 4)); // add quads to bestfive in the front
            bestfive.push(...seven.slice(0)); // add highest kicker
            return { isThis: true, score: 8, bestFive: bestfive };
        }
        return {isThis: false};
    }

    evalFullHouse (seven) {
        
        let i;
        let foundtrips = false
        let found = false;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-2;i++){
            if (seven[i].val == seven[i+1].val && seven[i].val == seven[i+2].val){ // find trips
                foundtrips = true;
                break;
            }
        }
        if(foundtrips == true){
            bestfive.push(...seven.slice(i, 3)); // add pair to bestfive in the front
        }
        for (i=0;i<seven.length-1;i++){ // find second pair
            if (seven[i].val == seven[i+1].val){
                found = true;
                break;
            }
        }
        if(found == true && foundtrips == true ){
            bestfive.push(...seven.slice(i, 2));
        }

        if (found){
            return { isThis: false, score: 7, bestFive: bestfive };
        } 
        return {isThis: false};
    }

    evalFlush(seven) {
        let counts = [0, 0, 0, 0];
        let i;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length;i++){
            counts[seven[i].suit]++;
        }

        console.log("inside flush")
        if (counts.indexOf(5) != -1){
            let suit = counts.indexOf(5);
            for (i=0;i<seven.length;i++){
                if(seven[i].suit == suit){
                    bestFive.push(seven[i]);
                }
            }
            return { isThis:true, score: 6, bestFive: bestfive}
        }

        return {isThis: false};
    }

    evalStraight(seven){
        let i, j;
        let count = 0;
        let bestfive = [];

        // HERES MY IDEA: IF THERE'S AN ACE, SIMPLY ADD 0 TO THE SEVEN

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-1;i++){
            
            if (seven[i].val-1 == seven[i+1].val){
                count++;
                // 5 4 3 2 A straight
                if (count == 3 && seven[0].val == 13){
                    bestfive.push(...seven.slice(i+1-4, 4));
                    bestfive.push(seven[0]);
                    return { isThis:true, score: 5, bestFive: bestfive}
                }
                if (count >= 4)
                    j = i+1;
            } else {
                count = 0;
            }
        }
        console.log("inside straight")
        if (count == 4){
            bestfive.push(...seven.slice(j-4, 5));
            return { isThis:true, score: 5, bestFive: bestfive}
        }

        return {isThis: false};
    }

    evalTrips(seven) {
        let i;
        let found = false;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-2;i++){
            if (seven[i].val == seven[i+1].val && seven[i].val == seven[i+2].val){
                found = true;
                break;
            }
        }

        console.log("inside trips")
        if (found) {
            bestfive.push(...seven.slice(i, 3)); // add pair to bestfive in the front
            bestfive.push(...seven.slice(0,2)); // take 3 highest cards from remaining seven
            return { isThis: true, score: 4, bestFive: bestfive };
        }
        return {isThis: false};
    }

    evalTwoPair(seven){
        let i;
        let found = false;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-1;i++){ // find first pair
            if (seven[i].val == seven[i+1].val){
                break;
            }
        }
        console.log("inside two pair")
        bestfive.push(...seven.slice(i, 2)); // add pair to bestfive in the front
        for (i=0;i<seven.length-1;i++){ // find second pair
            if (seven[i].val == seven[i+1].val){
                found = true;
                break;
            }
        }
        

        if (found){
            bestfive.push(...seven.slice(i, 2)); // add pair to bestfive in the front
            bestfive.push(seven[0]);
            return { isThis: false, score: 3, bestFive: bestfive };
        } 
        return {isThis: false};
    }

    evalPair(seven) {
        let i;
        let found = false;
        let bestfive = [];

        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        for (i=0;i<seven.length-1;i++){
            if (seven[i].val == seven[i+1].val){
                found = true;
                break;
            }
        }
        console.log("inside pair")

        if (found) {
            bestfive.push(...seven.slice(i, 2)); // add pair to bestfive in the front
            bestfive.push(...seven.slice(0,3)); // take 3 highest cards from remaining seven
            return { isThis: true, score: 2, bestFive: bestfive };
        }
        return {isThis: false}; 
    }

    evalHighCard(seven) {
        console.log("inside high")
        let i;
        seven.sort((a, b) =>  (a.val < b.val) ? 1 : -1);
        seven.slice(5,2)
        return { isThis: true, score: 1, bestFive: seven };
    }
    
}

module.exports.Card = Card;
module.exports.Yeehaw = Yeehaw;
module.exports.Player = Player;