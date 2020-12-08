const getStandardAbweichung = function (array) {
    var average = getAverage(array);
    var staw = 0;
    array.forEach(element => {
        staw += Math.pow(element - average, 2);
    });
    staw /= (array.length - 1);
    staw = Math.pow(staw,0.5);
    return staw;
}

const getAverage = function(array){
    return array.reduce((a, b) => a + b) / array.length;
}

module.exports.staw = getStandardAbweichung;
module.exports.average = getAverage;
