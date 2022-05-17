 var simulate = function (V_gesamt, Bubble_number, Grenzflächenwinkel) {
    //V_gesamt: Gesamtes zu kondensierendes Volumen in Kubikmetern
    //Bubble_number: Menge an Tröpfchen, auf die das Gesamtvolumen aufgeteilt wird
    //Grenzflächenwinkel: Kontaktwinkel zwischen Tropfenoberfläche und Untergrund

    const unify = function (bubble) {   //Funktion normalisiert die Werte eines Tropfens 
        return {
            x: bubble.x / a,
            y: bubble.y / a,
            r: bubble.r / a,
            id: bubble.id,
            V_original: bubble.V,
            d: bubble.d
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

    const sumTropfen = function (bubble1, bubble2) {
        var r = getR(bubble1.V + bubble2.V);
        var distx = bubble2.x - bubble1.x;
        var disty = bubble2.y - bubble1.y;
        var t = 1 - bubble1.V / (bubble1.V + bubble2.V);
        var x = t * distx + bubble1.x;
        var y = t * disty + bubble1.y;
        return { x: x, r: r, y: y, V: bubble1.V + bubble2.V, original: false }
    }

    const getR = function (V) {
        return Math.pow(V / Math.PI / reducedWinkel, 1 / 3)
    }
    
    const reduced = function (alpha) {
        alpha *= Math.PI / 180;
        let cos_w = Math.cos(alpha);
        let sin_w = Math.sin(alpha);
        return (2 - 3 * cos_w + Math.pow(cos_w, 3)) / (3 * Math.pow(sin_w, 3));
    }

    
    var reducedWinkel = reduced(Grenzflächenwinkel);    //Einmalig errechneter Faktor, der für die Radiusberechnung des Kugelschnittes verwendet wird
    var V_Tröpfchen = V_gesamt / Bubble_number;              //Kleinstvolumen
    var A = 8.618 * Math.pow(10,-6);
    var a = Math.pow(A,1/2)          //Seitenlänge der Kondensationsfläche in Metern

    var circles = [];
    var newTropfen = [];
    let V_current = 0;

    do {
        V_current += V_Tröpfchen;

        newTropfen.push({
            x: Math.random() * a,
            y: Math.random() * a,
            r: getR(V_Tröpfchen),
            V: V_Tröpfchen,
        })
        
        for (var i = 0; i < newTropfen.length; i++) {
            if (newTropfen[i]) {
                newTropfen[i].id = circles.length;
                for (var c = 0; c < circles.length; c++) {
                    if (circles[c]) {
                        if (doMeet(circles[c], newTropfen[i])) {
                            newTropfen.push(sumTropfen(circles[c], newTropfen[i]));
                            circles[c] = null;
                            newTropfen[i] = null;
                            break;
                        }
                    }
                }
                if (newTropfen[i]) {
                    circles.push(newTropfen[i]);
                    newTropfen[i] = null;
                }
            }
        }

        newTropfen = [];

    } while (V_current < V_gesamt)

    var bubbleCount = 0;
    var wassermenge = 0;
    var Heizfläche = 0;

    for (let i = 0; i < circles.length; i++) {
        if (circles[i] != null) {
            bubbleCount++;
            wassermenge += circles[i].V;
            var A = Math.pow(circles[i].r, 2) * Math.PI
            Heizfläche += A;
            circles[i].d = circles[i].V/A;
            circles[i] = unify(circles[i]);
        }
    };

    var information = {};

    information.Bubble_number = Bubble_number;
    information.BubbleCount = bubbleCount;
    information.bubblePercentage = bubbleCount / Bubble_number * 100;
    information.uncertainty = Math.abs(wassermenge - V_gesamt) * 100 / V_gesamt;
    information.k = Heizfläche / Math.pow(a, 2);;
    information.circles = circles.filter(circle => {return circle!=null});
    information.meanD = information.circles.map(circle => {return circle.d}).reduce((sum,d) => {return sum + d})/Bubble_number;

    //console.log(bubbleCount + " of total " + Bubble_number + " Bubbles are still visible on the screen.");
    //console.log(" Messunsicherheit in Prozent: ", information.uncertainty);
    //console.log("k = " + information.k);
    //console.log("meanD is "+ information.meanD*1000 + " mm")

    return information;
}

module.exports = simulate;  //Diese Zeile gibt Fehler aus, wenn man das Script im Browser ausführt. Das ist ein Node.js-Command, mit dem man die Simulationsfunktion in "simulation_save.js" importieren kann.
