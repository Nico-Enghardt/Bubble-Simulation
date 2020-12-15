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
var volumes = [];
let variabel = 'Volume';

for (var V = 0.02; V <= 1.3; V += 0.02) {
    volumes.push(V / 1000000);
}

console.log(volumes);

ergebnisse.parameter = {
    volume: volumes,
    number: 500,
    angle: 30,
}

var heute = new Date()
ergebnisse.run_information = {
    Tag: heute.getDate() + '.' + heute.getMonth() + '.' + heute.getFullYear(),
    Zeit: heute.getHours() + ':' + heute.getMinutes(),
}
ergebnisse.runs = [];

volumes.forEach(volume => {
    var run = { volume: volume };
    run.information = [];
    for (var i = 0; i < 5; i++) {
        console.log("Simulation", i, "with Volume", volume);
        var information = simulate(volume, ergebnisse.parameter.number, ergebnisse.parameter.angle);
        delete information.circles;
        run.information.push(information);
    }
    run.werte = run.information.map((bundle) => { return bundle.k });
    run.standardabweichung = stat.staw(run.werte);
    run.average = stat.average(run.werte);

    ergebnisse.runs.push(run);
})


ergebnisse.run_information.Dauer = timeDiffCalc(new Date(), heute);

ergebnisse.ergebnisse = ergebnisse.runs.map((element) => {
    return {
        number: element.volume,
        average: element.average,
        standardabweichung: element.standardabweichung,
    }
});

var csv = "";

ergebnisse.ergebnisse.forEach((row) => {
    csv += row.number + ";" + row.average + ";" + row.standardabweichung + "\n";
})

var i = 'Grenzflächenwinkel: ' + ergebnisse.parameter.angle + ' Bubble_Number: ' + ergebnisse.parameter.number + ' V_gesamt: ' + minMax(ergebnisse.parameter.volume);
var jsonFile = './results/' + i + '.json';
var csvFile = './results/' + i + '.csv';

fs.writeFile(jsonFile, JSON.stringify(ergebnisse, null, 2), function (err) {
    if (err) { console.log(err) }
})

fs.writeFile(csvFile, csv, function (err) {
    if (err) { console.log(err) }
})