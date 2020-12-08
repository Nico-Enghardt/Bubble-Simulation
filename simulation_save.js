const fs = require('fs');
const simulate = require('./simulation.js');
const stat = require("./standardabweichung");

var ergebnisse = [];

// numbers = [];
// for(var n = 650000; n<=1000000;n+=50000){
//     numbers.push(n);
// }
// console.log(numbers);

// numbers.forEach((number) => {
//     var ergebnis = { number: number }

//var angles = [0.2];
// for (var a = 5; a >= 0.2; a -= 0.2) {
//     angles.push(a);
// }


var volumes =[];

for(var V = 0.02; V<=1.3; V+=0.02){
    volumes.push(V/1000);
}

ergebnisse.push({
    volume: volumes,
    number: 50000,
    angle: 30,
})

ergebnisse.push()

console.log(volumes);
volumes.forEach(volume => {
    var ergebnis = {volume: volume};
    ergebnis.information = [];
    for (var i = 0; i < 5; i++) {
        console.log("Simulation", i, "with Volume", volume);
        var information = simulate(volume, 50000, 60);
        delete information.circles;
        ergebnis.information.push(information);
    }
    ergebnis.werte = ergebnis.information.map((bundle) => { return bundle.k });
    ergebnis.standardabweichung = stat.staw(ergebnis.werte);
    ergebnis.average = stat.average(ergebnis.werte);

    ergebnisse.push(ergebnis);
})

var short = ergebnisse.map((element) => {
    return {
        number: element.number,
        average: element.average,
        standardabweichung: element.standardabweichung,
    }
});

ergebnisse.push(short);

var csv = "";

short.forEach((row) => {
    csv += row.number + ";" + row.average + ";" + row.standardabweichung + "\n";
})

var i = fs.readdirSync('./results').length + 1;
var jsonFile = './results/' + i + '.json';
var csvFile = './results/' + i + '.csv';

fs.writeFile(jsonFile, JSON.stringify(ergebnisse, null, 2), function (err) {
    if (err) { console.log(err) }
})

fs.writeFile(csvFile, csv, function (err) {
    if (err) { console.log(err) }
})