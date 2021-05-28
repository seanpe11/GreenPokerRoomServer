const yeehaw = require('./yeehawholdem.js')

let board=[]
let hand1=0
let hand2 = 0
let seven = []
board = [1, 2, 3, 4, 5]
hand1 = 8
hand2 = 6

seven = board
seven.push(hand1)
seven.push(hand2)
console.log(seven)
