var map;
var marker;
var markers = [];


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.92866, lng: 138.59863},
      zoom: 15,
      mapTypeControl: false,
      zoomControl: true
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    for (i = 0; i < locations.length; i++){
      var position = locations[i].location;
      var title = locations[i].title;
      var foursquareID = locations[i].foursquareID;
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i,
        foursquareID: foursquareID
      });
      markers.push(marker);
      
      //connect marker on the map with viewModel
      // Place()[i].marker = marker;

      marker.addListener('click', markerWindow);
      marker.addListener('click', toggleBounce);

      bounds.extend(markers[i].position);
    }

    //open infowindow when the marker is clicked
    function markerWindow(){
      var marker = this;
      populateInfoWindow(this, largeInfowindow);
    }

    //marker will bounce 2 times when clicked
    function toggleBounce(marker) {
      var self = this;
      self.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
          self.setAnimation(null);
      }, 1400);
    }

    map.fitBounds(bounds);
}



// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    // infowindow.setContent('');
    infowindow.open(map, marker);

    //marker will stop bouncing when infowindow is closed
    infowindow.addListener('closeclick',function(){
      marker.setAnimation(null);
    });
  }

  var foursquareID = marker.foursquareID;
  var version = "20170101";
  var clientSecret = "JQQ1HHLHEPWE0PKE5TE5YPLPU3NXWWDXVPODTTXH1PBLXRQA";
  var clientID = "OEQ5VETJR0K1RASY1KRMR3JPZ2ZOBJZI5MRQSOV2HZWDYYWT";
  var url = 'https://api.foursquare.com/v2/venues/' + foursquareID + '?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=' + version;

  $.ajax({
      dataType: "json",
      url: url,
      success: function(data) {
          var results = data.response.venue;
          // console.log(data);
          var address = results.location.address;
          var likes = results.likes.summary;
          infowindow.setContent('<div><strong>' + marker.title + '</strong></div>' + 
                                '<div>' + address + '</div>' +
                                '<div>' + likes + '</div>');
          infowindow.open(map, marker);
      },
      error: function(e) {
          alert("Foursquare API returned error");
      }
  });
}

mapError = function() {
  alert("The Google Maps API didn't load correctly. Please try again later.");
};

var place = function(data){
  this.title = ko.observable(data.title);
  //address comes from foursquare; how to display it?
  // this.results.location.address = ko.observable(data.results.location.address);
  this.marker = ko.observable(data.marker);
}

var viewModel = function() {
  this.query = ko.observable("");
  this.places = ko.observableArray([]);

  locations.forEach(function(place){
    this.places.push(place);
  });

  this.filteredPlaces = ko.observableArray();

  this.places().forEach(function(place){
    this.filteredPlaces.push(place);
  })

  //when the place title in list view is clicked 
  //it triggers the same action as if marker was clicked on
  this.place.title = function(place, marker) {
    google.maps.event.trigger(place.marker(), 'click');
  };

  this.filter = ko.computed(function(){
    this.filteredPlaces.removeAll();

    this.places().forEach(function(place){
      place.marker().setVisible(false);
      if (place.title().toLowerCase().indexOf(this.query().toLowerCase()) !== -1){
        this.filteredPlaces.push(place);
      }
    });

    this.filteredPlaces().forEach(function(place){
      place.marker().setVisible(true);
    });
  });
};

ko.applyBindings(viewModel);