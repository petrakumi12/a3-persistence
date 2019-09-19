
window.onload = function() {
    animateText();
    document.querySelector( 'button' ).onclick = submit;
    getDistanceToFrom() //this also gets the data thats already there and makes table
    // viewData(); //get what data is already there
    createTableFromJSON();
};

google.maps.event.addDomListener(window, "load", initialize);





function moveToViewMode(){
    window.location.pathname = "/viewData.html";
}

const submit = function( e ) {
    // prevent default form action from being carried out
    e.preventDefault();
    let ifReturn = document.getElementById("returnCheck").checked;
    let returnval = "";
    if(ifReturn){
        returnval = "Yes";
    } else {
        returnval = "No";
    }
    const json = {
            placeFrom: document.querySelector( '#placeFrom' ).value,
            placeTo: document.querySelector( '#placeTo' ).value,
            mode: document.querySelector('input[name="transport"]:checked').value,
            returnval: returnval
        };
    let thebody = JSON.stringify( json );
    if(json.length !== 0){
        fetch( '/submit', {
            method:'POST',
            body: thebody,
            headers: { 'Content-Type' : 'application/json' }
        })
            .then( function( response ) {
                    // do something with the response
                    getDistanceToFrom();
            });
        return false
    }
};

//title text js
// Wrap every letter in a span
function animateText() {
    let textWrapper = document.querySelector('.ml12');
    textWrapper.setAttribute("display", "hidden");
    setTimeout(function(){
        textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

        anime.timeline({loop: false})
            .add({
                targets: '.ml12 .letter',
                translateX: [40,0],
                translateZ: 0,
                opacity: [0,1],
                easing: "easeOutExpo",
                duration: 2200,
                delay: (el, i) => 700 + 30 * i
            });
    }, 1000);
}


//getting distance between given cities
function getDistanceToFrom(){
    //getting all db data
    fetch( '/getData', {
        method:'GET',
    })
        .then( function( response ) {
            return response.json(); //the db data in json format
        }).then(function(theJsonData) {
            console.log("!!! the JSON Data is ", theJsonData, "with type ", typeof theJsonData)
        //adding all to and from places to array
        for (let a = 0; a < theJsonData.length; a++) { //iterating through all data one by one
            // placesFrom.push(theJsonData[a]["placeFrom"]);
            // placesTo.push(theJsonData[a]["placeTo"]);
            // transports.push(theJsonData[a]["mode"].toUpperCase())
            //getting distances
            var service = new google.maps.DistanceMatrixService;
            let travelType = theJsonData[a]["mode"];
            if (travelType.toLowerCase() === "public transportation"){
                travelType = "transit";
            }
            service.getDistanceMatrix({
                origins: [theJsonData[a]["placeFrom"]],
                destinations: [theJsonData[a]["placeTo"]],
                travelMode: [travelType.toUpperCase()],
            }, function (response, status) {
                if (status !== 'OK') {
                    // alert('Error was: ' + status);
                } else if (status === "ZERO_RESULTS") {
                    alert("No results");
                } else {
                    var originList = response.originAddresses; //get proper addresses for the places from
                    var destinationList = response.destinationAddresses; //get proper addresses for the places to
                    //CAN USE THESE FOR GEOCODING
                    //getting lat long of placeFrom
                    //they're arrays where the first element is latitude and the second is longtitude

                    // console.log("originAddress response " + originList);
                    // console.log("destAddress response " + destinationList);
                    // console.log("rows response " + response.rows[0].elements[0].distance.text);
                    for (var b = 0; b < originList.length; b++) {
                        // var latLongFrom = getLatLong(geocoder, originList[b]);
                        // var latLongTo = getLatLong(geocoder, destinationList[b]);
                        var results = response.rows[b].elements;
                        for (var c = 0; c < results.length; c++) {
                            var element = results[c];
                            var distance, duration;
                            if (element.status !== "OK") {
                                distance = "no available routes for this mode of transit";
                                duration = "NA"
                                theJsonData[a]["distance"] = distance;
                                theJsonData[a]["duration"] = duration;
                            } else {
                                distance = element.distance.text;
                                duration = element.duration.text;
                                var from = originList[b];
                                var to = destinationList[c];
                                theJsonData[a]["distance"] = distance;
                                theJsonData[a]["duration"] = duration;
                            }
                            //making modifications to the existing db with the new info on the json, and updating table after modifications are made
                        }
                    }
                    fetch('/modifyData', {
                        method: 'POST',
                        body: JSON.stringify(theJsonData),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(function(){
                        createTableFromJSON();
                    })
                }

            })
        }
    })
}

//creating table dynamically
function createTableFromJSON() {
    fetch('/getData', {
        method: 'GET',
    })
        .then(function (response) {
            return response.json();
        }).then(function (theJsonData) {
        if(theJsonData.size !== 0){
            //extract html header values
            let col = [];
            for (let i = 0; i < theJsonData.length; i++) {
                for (let key in theJsonData[i]) {
                    if (col.indexOf(key) === -1) {
                        col.push(key);
                    }
                }
            }
            //create dynamic table
            let table = document.createElement("table");
            table.setAttribute("class", "table table-responsive-md table-striped text-center table-dark ");
            table.setAttribute("style", "max-width: 100%;")
            table.setAttribute("id", "table-list");

            var tableHeaders = [
                "id",
                "Place From",
                "Place To",
                "Mode",
                "Return",
                "Distance",
                "Duration",
                ""
            ];

            //create table header
            var tr = table.insertRow(-1);

            for (var j = 0; j < tableHeaders.length; j++){
                var th = document.createElement("th");
                th.innerHTML = tableHeaders[j];
                tr.appendChild(th);
            }

            //now table has been made. adding json data as rows
            //and capitalizing first letter of every word
            for (var k = 0; k < theJsonData.length; k++) {
                tr = table.insertRow(-1);
                if (k === 0) {
                }
                if(k<theJsonData.length){
                    for (var l = 0; l < col.length; l++) {
                        //for all other columns add the info thats in the json
                        if(l<col.length-1){
                            var tabCell = tr.insertCell(-1);
                            let jsonElement = theJsonData[k][col[l+1]];
                            if (jsonElement != undefined) {
                                if(l===0){
                                    tabCell.innerHTML = jsonElement
                                } else {
                                    tabCell.innerHTML = jsonElement.toLowerCase()
                                        .split(' ')
                                        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                        .join(' ');
                                }

                            } else {
                                tabCell.innerHTML = "undefined";
                            }
                            //only allow editing of the first 4 columns
                            if(l < col.length-3){
                                tabCell.setAttribute("contenteditable", "true");
                                tabCell.addEventListener("focusout", event => {
                                    if(event.isComposing || event.keyCode === 229){
                                        return
                                    } else {
                                        userModify(event.target)
                                    }
                                });
                            }
                        } else  {
                            //for the last column insert the remove icon
                            let tabCell = tr.insertCell(-1);
                            tabCell.innerHTML = '<button type="button" class="btn btn-danger btn-rounded btn-sm my-0" onclick="removeRow(this)">Remove';
                        }
                    }
                }
            }
            //add the created table to a container
            let divContainer = document.getElementById("dbTable");
            divContainer.innerHTML = "";
            //add table to div that should contain it
            divContainer.appendChild(table);
            //change height of dataDisplay div based on height of table added to it
            document.getElementById("dataDisplay").style.height = "calc(" + document.getElementsByTagName("table")[0].clientHeight.toString() + "px + 12vh + 12vw";
            //remove the temporary text that said to submit something
            document.getElementById("tempDataText").innerText = "";
            // table.setAttribute("class", "table table-striped");
            table.setAttribute("data-aos", "fade-in");
            table.addEventListener("onfocusout", (function(){
                for (var row = 0; row < table.rows.length; row++){
                    for(var col = 0; col < table.rows[row].cells.length; col++){
                        alert(table.rows[row].cells[col].innerHTML)
                    }
                }
            }));
        }});
}



//table editing options
//remove element from table
//and update db
function removeRow(cellBtn){
    //send delete request to server
    //send over a row number, and server will find that row and delete it from json
    //need to send over id of element that will be deleted
    let row =  cellBtn.parentNode.parentNode.rowIndex
    let col = cellBtn.parentNode.cellIndex
    let a = { 'a' : cellBtn.parentNode.rows[row].cells[col].innerHTML}
    console.log("in table: row is ", row, " col is ", col, " a is ", a.a)
    fetch('/deleteData', {
        method: 'POST',
        body: JSON.stringify(a),
        headers: { 'Content-Type': 'application/json' }
    })
    //delete item from table
    document.getElementById("table-list").deleteRow(cellBtn.parentNode.parentNode.rowIndex);
}


//will send index of modified data and the modified data to db to change
function userModify(tabCell) {
    //sending over array of  {rowNo, keyword, info}
    var cellIdx = tabCell.cellIndex;
    var rowIdx = tabCell.parentNode.rowIndex;
    console.log("col,row ", cellIdx, rowIdx)
    var key = "";
    let data
    switch (cellIdx) {
        case 0:
            data = [
                {"id": tabCell.parentNode.cells[0].innerHTML}, //id
                {"firstname": tabCell.innerHTML}
            ];
            break;
        case 1:
            data = [
                {"id": tabCell.parentNode.cells[0].innerHTML}, //id
                {"placeFrom": tabCell.innerHTML}
            ];
            break;
        case 2:
            data = [
                {"id": tabCell.parentNode.cells[0].innerHTML}, //id
                {"placeTo": tabCell.innerHTML}
            ];
            break;
        case 3:
            data = [
                {"id": tabCell.parentNode.cells[0].innerHTML}, //id
                {"mode": tabCell.innerHTML}
            ];
            break;
        case 4:
            data = [
                {"id": tabCell.parentNode.cells[0].innerHTML}, //id
                {returnval : tabCell.innerHTML}
            ];
            break;
        default: key = "na";
    }
    //this is just an array not a json
    console.log("id grabbed from table in user mod mode ",  tabCell.parentNode.cells[0].innerHTML)
        fetch('/userModify', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
}




function initialize(){
    // Themes begin
    am4core.useTheme(am4themes_animated);
// Themes end

// Define marker path
    var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

// Create map instance
    var chart = am4core.create("chartdiv", am4maps.MapChart);
    var interfaceColors = new am4core.InterfaceColorSet();

// Set map definition
    chart.geodata = am4geodata_worldLow;

// Set projection
    chart.projection = new am4maps.projections.Mercator();

// Add zoom control
    chart.zoomControl = new am4maps.ZoomControl();

// Set initial zoom
    chart.homeZoomLevel = 2.5;
    chart.homeGeoPoint = {
        latitude: 42.2746,
        longitude: 71.8063
    };

// Create map polygon series
    var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.exclude = ["AQ"];
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.nonScalingStroke = true;

// Add images
    var imageSeries = chart.series.push(new am4maps.MapImageSeries());
    var imageTemplate = imageSeries.mapImages.template;
    imageTemplate.tooltipText = "{title}";
    imageTemplate.nonScaling = true;

    var marker = imageTemplate.createChild(am4core.Sprite);
    marker.path = targetSVG;
    marker.horizontalCenter = "middle";
    marker.verticalCenter = "middle";
    marker.scale = 0.7;
    marker.fill = interfaceColors.getFor("alternativeBackground");

    imageTemplate.propertyFields.latitude = "latitude";
    imageTemplate.propertyFields.longitude = "longitude";



//generate list of places with correct names
    fetch('/getData', {
        method: 'GET',
    }) .then( function( response ) {
        return response.json(); //the db data in json format
    }).then(function (result) {
        console.log("hereee??? result length ", result.length)

        map = new google.maps.Map(
            document.getElementById('map'))
        // var geocoder = new google.maps.Geocoder();

        let finalList = {}
        return getPlacesForView(result, finalList)
        // console.log("size of name list is ", list.length)

        // return finalList
    }).then(function (correctNameList){
        console.log("FINAL LIST" , correctNameList)
        applyThese (chart, interfaceColors, imageSeries, correctNameList)

        // let lineList = []
        // let indexList = [];
        // for( var a = 1; a < correctNameList.length; a+=2){
        //     indexList.push(a)
        // }

        // let lineList = new Array(correctNameList.length/2)
        //     .fill(1).map( (_, i) => i+2 )
        //     .forEach((index => lineElement(correctNameList, index, lineList)))
        //     .then(function(linelist){ console.log("linelist before then : ", linelist )})

    })
    //     .then(function(lineList) {
    //     console.log("linelist after then : ", lineList)
    //     // indexList.forEach(index => lineElement(correctNameList, index, lineList))
    //     console.log("indexlist size is ", lineList.length)
    //     console.log("LINELISTTTTTT", lineList)
    // })

}


// var latlong = function () {
//
// }
var lineElement = function (correctNameList, a, array){
    //making line list here
        array.push({"multigeoline" : [
                [
                    { "latitude": correctNameList[a-1].latitude, "longitude": correctNameList[a-1].longtitude },
                    { "latitude": correctNameList[a].latitude, "longitude": correctNameList[a].longtitude }
                ]
            ]
        });
        console.log("getLineElements array is ", array)
    return array
}


function getPlacesForView(result){
    console.log("GetPlacesForView, result is ", result)
    let correctNameList = [];

    //variable will get updated with every result
    result.forEach(element => getEachPlace(element, correctNameList))
    // correctNameList.push(result.forEach(getEachPlace()))
    console.log("getPlacesForView correctNameList: ", correctNameList)
    return correctNameList
}

let getEachPlace =  function(element, array){
    console.log("getEachPlace")
    let fromTo = [element.placeFrom, element.placeTo];
    fromTo.forEach(element => placesAPIBehavior(element, array))
    console.log("getEachPlace array is ", array)
    return array
};


function placesAPIBehavior (element, array) {
    console.log("placesAPIBehavior")
    var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
    var request = {
        query: element,
        fields: ['name', 'geometry'],
    };

    //finding geolocations
    var service = new google.maps.places.PlacesService(map);
    service.findPlaceFromQuery(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("results from placesServices ", results);
            array.push({
                "svgPath": targetSVG,
                "title": results[0].name,
                "latitude": results[0].geometry.location.lat(),
                "longtitude": results[0].geometry.location.lng(),
                "scale": 0.5
            })
        }
        console.log("aaaaa" , array);
        return array
    });

}
//attributes to apply to chart
function applyThese (chart, interfaceColors, imageSeries, correctNameList1) {
    console.log("haiiii ",JSON.stringify(correctNameList1))

    var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

    var lineSeries = chart.series.push(new am4maps.MapLineSeries());
    lineSeries.dataFields.multiGeoLine = "multiGeoLine";

    var lineTemplate = lineSeries.mapLines.template;
    lineTemplate.nonScalingStroke = true;
    lineTemplate.arrow.nonScaling = true;
    lineTemplate.arrow.width = 4;
    lineTemplate.arrow.height = 6;
    lineTemplate.stroke = interfaceColors.getFor("alternativeBackground");
    lineTemplate.fill = interfaceColors.getFor("alternativeBackground");
    lineTemplate.line.strokeOpacity = 0.4;
    // correctNameList[0].id = correctNameList[0].title;
    let e = [ {
        "id": "london",
        "svgPath": targetSVG,
        "title": "London",
        "latitude": 51.5002,
        "longitude": -0.1262,
        "scale": 1
    }, {
        "svgPath": targetSVG,
        "title": "Brussels",
        "latitude": 50.8371,
        "longitude": 4.3676,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Prague",
        "latitude": 50.0878,
        "longitude": 14.4205,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Athens",
        "latitude": 37.9792,
        "longitude": 23.7166,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Reykjavik",
        "latitude": 64.1353,
        "longitude": -21.8952,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Dublin",
        "latitude": 53.3441,
        "longitude": -6.2675,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Oslo",
        "latitude": 59.9138,
        "longitude": 10.7387,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Lisbon",
        "latitude": 38.7072,
        "longitude": -9.1355,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Moscow",
        "latitude": 55.7558,
        "longitude": 37.6176,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Belgrade",
        "latitude": 44.8048,
        "longitude": 20.4781,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Bratislava",
        "latitude": 48.2116,
        "longitude": 17.1547,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Ljubljana",
        "latitude": 46.0514,
        "longitude": 14.5060,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Madrid",
        "latitude": 40.4167,
        "longitude": -3.7033,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Stockholm",
        "latitude": 59.3328,
        "longitude": 18.0645,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Bern",
        "latitude": 46.9480,
        "longitude": 7.4481,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Kiev",
        "latitude": 50.4422,
        "longitude": 30.5367,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "Paris",
        "latitude": 48.8567,
        "longitude": 2.3510,
        "scale": 0.5
    }, {
        "svgPath": targetSVG,
        "title": "New York",
        "latitude": 40.43,
        "longitude": -74,
        "scale": 0.5
    } ];

    // correctNameList1[0].id = correctNameList1[0].title;

    imageSeries.data = e;
    console.log(imageSeries.data)
    lineSeries.data = [{
        "multiGeoLine": [
            [
                { "latitude": 51.5002, "longitude": -0.1262 },
                { "latitude": 50.4422, "longitude": 30.5367 }
            ]
        ]
    }];


    console.log(e)

}




// //start google maps map
// function initMap() {
//     map = new google.maps.Map(document.getElementById('map'), {
//         center: {lat: -34.397, lng: 150.644},
//         zoom: 8
//     });
// }

// Data for the markers consisting of a name, a LatLng and a zIndex for the
// order in which these markers should display on top of each other.

//
// function setMarkers(map) {
//
//     var beaches = [
//         ['Bondi Beach', -33.890542, 151.274856, 4],
//         ['Coogee Beach', -33.923036, 151.259052, 5],
//         ['Cronulla Beach', -34.028249, 151.157507, 3],
//         ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
//         ['Maroubra Beach', -33.950198, 151.259302, 1]
//     ];
//     // Adds markers to the map.
//
//     // Marker sizes are expressed as a Size of X,Y where the origin of the image
//     // (0,0) is located in the top left of the image.
//
//     // Origins, anchor positions and coordinates of the marker increase in the X
//     // direction to the right and in the Y direction down.
//     var image = {
//         url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
//         // This marker is 20 pixels wide by 32 pixels high.
//         size: new google.maps.Size(20, 32),
//         // The origin for this image is (0, 0).
//         origin: new google.maps.Point(0, 0),
//         // The anchor for this image is the base of the flagpole at (0, 32).
//         anchor: new google.maps.Point(0, 32)
//     };
//     // Shapes define the clickable region of the icon. The type defines an HTML
//     // <area> element 'poly' which traces out a polygon as a series of X,Y points.
//     // The final coordinate closes the poly by connecting to the first coordinate.
//     var shape = {
//         coords: [1, 1, 1, 20, 18, 20, 18, 1],
//         type: 'poly'
//     };
//     for (var i = 0; i < beaches.length; i++) {
//         var beach = beaches[i];
//         var marker = new google.maps.Marker({
//             position: {lat: beach[1], lng: beach[2]},
//             map: map,
//             icon: image,
//             shape: shape,
//             title: beach[0],
//             zIndex: beach[3]
//         });
//     }
// }


// //calculating flight distance using the Haversine formula
// //never got geolocation to work so never put it to good use :(
// function calculateFlightDistance(placeFrom, placeTo){
//     //getting lat long of placeFrom
//     //they're arrays where the first element is latitude and the second is longtitude
//     var latLongFrom = getLatLong(geocoder, placeFrom);
//     var latLongTo = getLatLong(geocoder, placeTo);
//
//     console.log("lat long from " + latLongFrom);
//     console.log("lat long to " + latLongTo);
//
//     var R = 6378137; // Earth’s mean radius in meter
//     var dLat = rad(latLongTo[0] - latLongFrom[0]);
//     var dLong = rad(latLongTo[1] - latLongFrom[1]);
//     var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(rad(placeFrom[0])) * Math.cos(rad(placeTo[0])) *
//         Math.sin(dLong / 2) * Math.sin(dLong / 2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     var d = R * c;
//     return d/1000; // returns the distance in kilometers
// }
//
// var rad = function(x) {
//     return x * Math.PI / 180;
// };
//
//
//
// function getLatLong(geocoder, aplace){
//     geocoder.geocode({
//             "placeId": aplace
//         },
//         function(results, status) {
//             if (status === 'OK') {
//                 if (results[0]) {
//                     return results[0].geometry.location;
//                 } else {
//                     window.alert('No results found');
//                 }
//             } else {
//                 window.alert('Geocoder failed due to: ' + status);
//             }
//         });
// }

