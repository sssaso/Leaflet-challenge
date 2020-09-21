//Visualization with Leaflet with GeoJSON data//

//Store USGS API (GeoJSON data) inside queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the URL
d3.json(queryURL, function(data) {
  //console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


//Colors by magnitude. the higher, the darker 
//(color ref:https://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=5)
function ColorsByMag (m) {
  if (m <= 1) {return '#c2e699'}
  else if (m <= 2) {return '#fecc5c'}
  else if (m <= 3) {return '#fd8d3c'}
  else if (m <= 4) {return '#f03b20'}
  else {return '#6f0303'};

// Shortcut for IF statement  ====>   Condition ? expression_1 : expression_2
//   return m <= 1 ? '#800026' :  
//          m <= 2 ? '#BD0026' :
//          m <= 3 ? '#FD8D3C' :
//          m <= 4 ? '#FEB24C' :
//                   '#FFEDA0';
// }

} 

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place, time, and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3 align='center'>" + feature.properties.place +
        "</h3><hr><p><u>Occurrence:</u> " + new Date(feature.properties.time) + "</p>" +
        "</h3><p><u>Magnitude:</u> " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature:onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius:feature.properties.mag*5,
        fillColor: ColorsByMag(feature.properties.mag),
        weight:1.5,
        opacity:1,
        fillopacity:1
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // define tile layers: streetmap, darkmap satellite layers
  var streetMap =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
  });
  
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetMap,
    "Dark Map": darkmap,
    "Satellite Map":satellite
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Creating map object
  var myMap = L.map("map", {
    center: [38, -110],
    zoom:4,
    layers: [streetMap,earthquakes]
  });

  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //add legend
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (myMap) {    
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4],
      labels = [];
     
      div.innerHTML ='<strong>Magnitude</strong><br><hr>'
  
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + ColorsByMag(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i>&nbsp&nbsp' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
  
  return div;
  };
  
  legend.addTo(myMap);

}