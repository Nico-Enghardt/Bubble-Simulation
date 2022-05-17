const getStandardAbweichung = function (array) {
    //Diese Funktion berechnet die Standardabweichung aller Zahlen in "array" (geforderter Typ:Array)
    var average = getAverage(array);
    var staw = 0;
    array.forEach(element => {
        staw += Math.pow(element - average, 2);     //Jede Zahl in "array" wird vom Durchschnittswert subtrahiert und dann quadriert aufaddiert.
    });
    staw /= (array.length - 1);     //Teilen durch Menge aller Zahlen in "array"
    staw = Math.pow(staw,0.5);      //Wurzelziehen
    return staw;
}

const getAverage = function(array){
    //Diese Funktion berechnet den Mittelwert aller Zahlen in "array" (geforderter Typ:Array)
    return array.reduce((a, b) => a + b) / array.length;
}

module.exports.staw = getStandardAbweichung;
module.exports.average = getAverage;
