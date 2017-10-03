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

    ko.applyBindings(viewModel);

    var bounds = new google.maps.LatLngBounds();
    markers.forEach(function(m){
      bounds.extend(m.position);
    });

    map.fitBounds(bounds);
}


function createMarker(data) {

    var marker = new google.maps.Marker({
      map: map,
      position: data.location,
      title: data.title,
      animation: google.maps.Animation.DROP,
      id: data.id,
      foursquareID: data.foursquareID
    });

    markers.push(marker);

    marker.addListener('click', markerWindow);
    marker.addListener('click', toggleBounce);


    //open infowindow when the marker is clicked
    var largeInfowindow = new google.maps.InfoWindow();
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

    return marker;
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

// createMarker().markerWindow();

mapError = function() {
  alert("The Google Maps API didn't load correctly. Please try again later.");
};


// Place View Model
var Place = function(data) {
  this.title = ko.observable(data.title);
  //address comes from foursquare; how to display it?
  // this.results.location.address = ko.observable(data.results.location.address);
  this.marker = ko.observable(createMarker(data));
};

// Overall App ViewModel
var viewModel = function() {
  this.query = ko.observable("");
  this.places = ko.observableArray([]);

  locations.forEach(function(data){
    this.places.push(new Place(data));
  });

  this.filteredPlaces = ko.observableArray();

  this.places().forEach(function(place){
    this.filteredPlaces.push(place);
  });

  this.filter = ko.computed(function(){
    this.filteredPlaces.removeAll();

    this.places().forEach(function(place){
      place.marker().setVisible(false);
      if (place.title().toLowerCase().indexOf(this.query().toLowerCase()) !== -1) {
        this.filteredPlaces.push(place);
        place.marker().setVisible(true);
      }
    });

  });

};