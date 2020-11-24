var alltime = require('./simulation.js');
const fs = require('fs');

console.log(alltime[0]);



var i = fs.readdirSync('./results').length + 1;
var newFile = './results/' + i + '.json';

fs.writeFile(newFile, JSON.stringify(alltime, null, 2), function (err) {
    console.log(err)
})
