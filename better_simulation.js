var simulate = function (V_gesamt, Bubble_number, Grenzflächenwinkel) {

    const unify = function (tropfen) {
        return {
            x: tropfen.x / a,
            y: tropfen.y / a,
            r: tropfen.r / a,
            id: tropfen.id,
            V_original: tropfen.V
        }
    }

    const dist = function (b1, b2) {
        //console.log("Distance calculated of: ",b1.id,b2.id);
        return Math.pow(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2), 1 / 2);
    };

    const doMeet = function (tropfen1, tropfen2) {
        //console.log("Figuring out wether", tropfen1.id, "and", tropfen2.id, "meet.");
        if (dist(tropfen1, tropfen2) < tropfen1.r + tropfen2.r) { return true } return false
    }

    const torusMeet = function (oldT, newT) {

        if (doMeet(oldT, newT)) {
            return sumtropfen(oldT, newT);
        }

        if (oldT.ctxB) {
            //Bei close to xBorder -> xposition verändern
            oldT.x+=oldT.ctxB*a;
        }

        if (oldT.ctyB) {
            //Bei close to yBorder -> yposition verändern
            oldT.y+=oldT.ctyB*a;
        }

        if(oldT.ctxB||oldT.ctyB){
            return sumtropfen(oldT,newT);
        }
        return false;
    }

    const closetoBorders = function (tropfen) {
        tropfen.ctxB = false;
        tropfen.ctyB = false;
        if (tropfen.x - tropfen.r <= tropfen.r / 2) {
            tropfen.ctxB = 1;
        }
        if (tropfen.x + tropfen.r * 1.5 >= a) {
            tropfen.ctxB = -1;
        }
        if (tropfen.y - tropfen.r <= tropfen.r / 2) {
            tropfen.ctyB = 1;
        }
        if (tropfen.y + tropfen.r * 1.5 >= a) {
            tropfen.ctyB = -1;
        }
        return tropfen
    }

    const sumTropfen = function (bubble1, bubble2) {
        var r = getR(tropfen1.V + tropfen2.V);
        var distx = tropfen2.x - tropfen1.x;
        var disty = tropfen2.y - tropfen1.y;
        var t = 1 - tropfen1.V / (tropfen1.V + tropfen2.V);
        var x = slide(t * distx + tropfen1.x);
        var y = slide(t * disty + tropfen1.y);        
        return { x: x, r: r, y: y, V: tropfen1.V + tropfen2.V, original: false }
    }

    const slide = function(value){
        if(value<0){
            return value+=a;
        } else if (value>a){
            return value-=a;
        } 
        return value
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

    //V_gesamt: Gesamtes zu kondensierendes Volumen in Kubikmetern
    //Bubble_number: Menge an Tröpfchen, auf die das Gesamtvolumen aufgeteilt wird
    //Grenzflächenwinkel: siehe Dokumentation
    var reducedWinkel = reduced(Grenzflächenwinkel);    //Einmalig errechneter Faktor, der für die Radiusberechnung des Kugelschnittes verwendet wird
    var V_Tröpfchen = V_gesamt / Bubble_number;              //Kleinstvolumen
    var a = 0.1;                                        //Seitenlänge der Kondensationsfläche in Metern

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
                        var sumB = torusMeet(circles[c], newTropfen[i])  //returns null or sumTropfen
                        if (sumB) {
                            newTropfen.push(sumB);
                            circles[c] = null;
                            newTropfen[i] = null;
                            break;
                        }
                    }
                }
                if (newTropfen[i]) {
                    newTropfen[i] = closetoBorders(newTropfen[i]);
                    circles.push(newTropfen[i]);
                    newTropfen[i] = null;
                }
            }
        }

        newTropfen = [];

    } while (V_current < V_gesamt)

    var tropfenCount = 0;
    var wassermenge = 0;
    var Heizfläche = 0;

    console.log(circles);

    for (let i = 0; i < circles.length; i++) {
        if (circles[i] != null) {
            tropfenCount++;
            wassermenge += circles[i].V;
            Heizfläche += Math.pow(circles[i].r, 2) * Math.PI;
            circles[i] = unify(circles[i]);
        }
    };

    var information = {};

    information.Bubble_number = Bubble_number;
    information.bubblePercentage = bubbleCount / Bubble_number * 100;
    information.uncertainty = Math.abs(wassermenge - V_gesamt) * 100 / V_gesamt;
    information.k = Heizfläche / Math.pow(a, 2);;
    information.circles = circles;

    console.log(tropfenCount + " of total " + Bubble_number + " Bubbles are still visible on the screen.");
    console.log(" Messunsicherheit in Prozent: ", information.uncertainty);
    console.log("k = " + information.k);

    return information;
}

console.log(simulate(0.000001,100,45))

module.exports = simulate;
