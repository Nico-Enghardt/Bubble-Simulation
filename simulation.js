var a = 1; //Größe des Kondensationsfläche in Quadratmetern
var V_max = 1 * Math.pow(10, -2); //Gesamtes zu kondensierendes Volumen in Kubikmetern6
var menge = 2;
var V_initial = V_max / menge;  //Kondensierende Menge
var winkel = 50; //Grenzflächenwinkel in Grad

const getR = function (V, alpha) {
    return Math.pow(V / Math.PI / reduced(alpha), 1 / 3)
}

const reduced = function (alpha) {
    alpha *= Math.PI / 180;
    let cos_w = Math.cos(alpha);
    let sin_w = Math.sin(alpha);
    return (2 - 3 * cos_w + Math.pow(cos_w, 3)) / (3 * Math.pow(sin_w, 3));
}

const unify = function (bubble) {
    return {
        x: bubble.x / a,
        y: bubble.y / a,
        r: bubble.r / a,
        id: bubble.id,
        V_original: bubble.V
    }
}

const dist = function (b1, b2) {
    //console.log("Distance calculated of: ",b1.id,b2.id);
    return Math.pow(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2), 1 / 2);
};

const doMeet = function (bubble1, bubble2) {
    //console.log("Figuring out wether", bubble1.id, "and", bubble2.id, "meet.");
    if (dist(bubble1, bubble2) < bubble1.r + bubble2.r) { return true } return false
}

const sumBubble = function (bubble1, bubble2, alpha) {
    var r = getR(bubble1.V + bubble2.V, alpha);
    var distx = bubble2.x - bubble1.x;
    var disty = bubble2.y - bubble1.y;
    var t = 1 - bubble1.V / (bubble1.V + bubble2.V);
    var x = t * distx + bubble1.x;
    var y = t * disty + bubble1.y;
    return { x: x, r: r, y: y, V: bubble1.V + bubble2.V, original: false }
}

var simulate = function (volume, number, phi) {

    var calculating = true;
    var status = 0;

    V_initial = volume / number;
    menge = number;
    winkel = phi;
    V_max = volume;

    circles = [];
    close_circles = [];
    newBubbles = [];
    sumBubbles = [];
    let V_current = 0;

    do {
        V_current += V_initial;

        newBubbles.push({
            x: a - Math.random() * a,
            y: a - Math.random() * a,
            r: getR(V_initial, phi),
            V: V_initial,
            original: true
        })
        for (var i = 0; i < newBubbles.length; i++) {
            if (newBubbles[i]) {
                var newBubble = newBubbles[i];
                newBubble.id = circles.length;
                for (var c = 0; c < circles.length; c++) {
                    if (circles[c]) {
                        if (doMeet(circles[c], newBubble)) {
                            //console.log(circles[c].id, "and the new Bubble were close enough to melt into a new bubble");
                            //console.log(circles[c],newBubble);
                            newBubbles.push(sumBubble(circles[c], newBubble, phi));
                            newBubbles[i] = null;
                            circles[c] = null;
                        }
                    }
                }
                if (newBubbles[i]) {
                    circles.push(newBubble);
                    newBubbles[i] = null;
                }
            }
        }
        status = V_current / volume;
        //console.log("Anteil an kondendsiertem Wasser: ", V_current / volume);

    } while (V_current < volume)


    //console.log("Data of all the cirlces: ", circles);

    var total = 0;
    var wassermenge = 0;
    var Heizfläche = 0;
    circles.forEach((circle) => {
        if (circle) {
            total++;
            if (circle && circle.V) {
                wassermenge += circle.V;
            }
            Heizfläche += Math.pow(circle.r,2)*Math.PI;
    };
    })

    console.log(total + " of total " + menge + " Bubbles are still visible on the screen.");
    console.log(" Messunsicherheit in Prozent: ", Math.abs(wassermenge - V_max) / 100 / V_max);
    console.log("k = "+ Heizfläche/Math.pow(a,2))

    for (let i = 0; i < circles.length; i++) {
        if (circles[i] != null) {
            circles[i] = unify(circles[i]);
        }
    };

    return circles
}



//module.exports = circles;