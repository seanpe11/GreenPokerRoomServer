seven = [13, 10, 9, 8, 7, 6, 5];
let count = 0, j;
let bestfive = [];

seven.sort((a, b) =>  (a < b) ? 1 : -1);
for (i=0;i<seven.length-1;i++){
    if (seven[i]-1 == seven[i+1]){
        count++;
        if (count == 4) j = i+1;
    } else { count = 0 }
}
bestfive.push(seven.splice(j-4, 5)) 
console.log(bestfive);