const { time } = require('console');
const fs = require('fs');
const simulate = require('./simulation.js');
const stat = require("./standardabweichung");

function timeDiffCalc(dateFuture, dateNow) { //Fremder Code, Quelle: https://bearnithi.com/2019/11/10/how-to-calculate-the-time-difference-days-hours-minutes-between-two-dates-in-javascript/

    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let difference = '';
    if (days > 0) {
        difference += (days === 1) ? `${days} Tag, ` : `${days} Tage, `;
    }
    if (hours > 0) {
        difference += (hours === 0 || hours === 1) ? `${hours} Stunde, ` : `${hours} Stunden, `;
    } if (minutes > 0) {
        difference += (minutes === 0 || hours === 1) ? `${minutes} Minute, ` : `${minutes} Minuten, `;
    }
    difference += diffInMilliSeconds / 1000, 'Sekunden'
    return difference;
}

function minMax(array) {
    return Math.min(...array) + '-' + Math.max(...array);
}

var ergebnisse = {};
var angles = [];
let variabel = 'Number';


for (var a = 1; a < 10; a +=1) {
    angles.push(a);
}

for (var a = 10; a <= 90; a +=2) {
    angles.push(a);
}

console.log(angles);

ergebnisse.parameter = {
    volume: 0.0000005,
    number: 20000,
    angle: angles,
    i: 10,
}

var heute = new Date()
ergebnisse.run_information = {
    Tag: heute.getDate() + '.' + heute.getMonth() + '.' + heute.getFullYear(),
    Zeit: heute.getHours() + ':' + heute.getMinutes(),
}
ergebnisse.runs = [];

angles .forEach(a => {
    var run = { angle: a };
    run.information = [];
    for (var i = 0; i < ergebnisse.parameter.i; i++) {
        console.log("Simulation", i, "with angle =", a,"and n=",ergebnisse.parameter.number);
        var information = simulate(ergebnisse.parameter.volume, ergebnisse.parameter.number,a );
        delete information.circles;
        run.information.push(information);
    }
    run.werte = run.information.map((bundle) => { return bundle.meanD });
    run.standardabweichung = stat.staw(run.werte);
    run.average = stat.average(run.werte);

    ergebnisse.runs.push(run);
})


ergebnisse.run_information.Dauer = timeDiffCalc(new Date(), heute);

ergebnisse.ergebnisse = ergebnisse.runs.map((element) => {
    return {
        angle: element.angle,
        average: element.average,
        standardabweichung: element.standardabweichung,
    }
});

var csv = "";

ergebnisse.ergebnisse.forEach((row) => {
    csv += row.angle + ";" + row.average + ";" + row.standardabweichung + "\n";
})

var i = 'Grenzflächenwinkel: ' + minMax(ergebnisse.parameter.angle) + ' Bubble_Number: ' + ergebnisse.parameter.number + ' V_gesamt: ' + ergebnisse.parameter.volume + "meanD-measured";
var jsonFile = './results/' + i + '.json';
var csvFile = './results/' + i + '.csv';

fs.writeFile(jsonFile, JSON.stringify(ergebnisse, null, 2), function (err) {
    if (err) { console.log(err) }
})

fs.writeFile(csvFile, csv, function (err) {
    if (err) { console.log(err) }
})