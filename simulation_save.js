const { time } = require("console");
const fs = require("fs");
const simulate = require("./simulation.js");
const stat = require("./standardabweichung");

function timeDiffCalc(dateFuture, dateNow) {
  //Fremder Code, Quelle: https://bearnithi.com/2019/11/10/how-to-calculate-the-time-difference-days-hours-minutes-between-two-dates-in-javascript/

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

  let difference = "";
  if (days > 0) {
    difference += days === 1 ? `${days} Tag, ` : `${days} Tage, `;
  }
  if (hours > 0) {
    difference +=
      hours === 0 || hours === 1 ? `${hours} Stunde, ` : `${hours} Stunden, `;
  }
  if (minutes > 0) {
    difference +=
      minutes === 0 || hours === 1
        ? `${minutes} Minute, `
        : `${minutes} Minuten, `;
  }
  (difference += diffInMilliSeconds / 1000), "Sekunden";
  return difference;
}

function minMax(array) {
  return Math.min(...array) + "-" + Math.max(...array);
}

var ergebnisse = {};
var angles = [];
let variabel = "Number";

serie = '9-1'

file = require("../Experimente/Programme/Serienergebnisse/Volumendaten/"+serie);

console.log(file);

file.volumes = file.volumes.map((v) => {
  return v / Math.pow(1180 * 1000, 3);
});


n = [1000, 0];
v_center = file.volumes[Math.floor(file.volumes.length / 2)];

while (Math.abs(n[0] - n[1]) > 3) {
  n[1] = n[0];
  simulation = simulate(v_center, n[0], file.phi).k;
  console.log(simulation, file.k);
  n[0] += Math.round(1000 * (file.k - simulation));
}

ergebnisse.parameter = {
  volume: file.volumes,
  number: n[0],
  angle: file.phi,
  i: 6,
};

var heute = new Date();
ergebnisse.run_information = {
  Tag: heute.getDate() + "." + heute.getMonth() + "." + heute.getFullYear(),
  Zeit: heute.getHours() + ":" + heute.getMinutes(),
};
ergebnisse.runs = [];

file.volumes.forEach((v) => {
  var run = { volume: v, information: [] };
  for (var i = 0; i < ergebnisse.parameter.i; i++) {
    console.log("Simulation", i, "with angle =", file.phi, "and v=", v);
    var information = simulate(v,
      ergebnisse.parameter.number,
      ergebnisse.parameter.angle
    );
    delete information.circles;
    run.information.push(information);
  }
  run.werte = run.information.map((bundle) => {   return bundle.k;   });
  run.standardabweichung = stat.staw(run.werte);
  run.average = stat.average(run.werte);

  ergebnisse.runs.push(run);
});

ergebnisse.run_information.Dauer = timeDiffCalc(new Date(), heute);

ergebnisse.ergebnisse = ergebnisse.runs.map((element) => {
  return {
    volume: element.volume,
    average: element.average,
    standardabweichung: element.standardabweichung,
  };
});
console.log(ergebnisse.ergebnisse);

var csv = "";

ergebnisse.ergebnisse.forEach((row) => {
  csv += row.angle + ";" + row.average + ";" + row.standardabweichung + "\n";
});

var i =
  "Grenzflächenwinkel: " +
  ergebnisse.parameter.angle +
  " Bubble_Number: " +
  ergebnisse.parameter.number +
  " V_gesamt: " +
  minMax(ergebnisse.parameter.volume) + "_" +serie
var File = "./results/" + i;

fs.writeFile(
  File + ".json",
  JSON.stringify(ergebnisse, null, 2),
  function (err) {
    if (err) {
      console.log(err);
    }
  }
);

fs.writeFile(File + ".csv", csv, function (err) {
  if (err) {
    console.log(err);
  }
});

fs.writeFile(
  File + ".txt",
  ergebnisse.ergebnisse.map((element) => {
    return element.average;
  }),
  function (err) {
    if (err) {
      console.log(err);
    }
  }
);
