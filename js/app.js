var map;
var markers = [];
var locations = [{
  title:'Sazón', 
  location: {lat:-34.924724, lng:138.600565},
  foursquareID: '562594a0498efaedd938a30c'
},{
  title:'La Moka', 
  location: {lat:-34.923602, lng:138.598170},
  foursquareID: '53c738a1498e5a424a30802d'
},{
  title:'Aroma Cafe', 
  location: {lat:-34.918830, lng:138.605131},
  foursquareID: '4d9e9ec87f1b721ea17b8c0f'
},{
  title:'Gloria Jeans Coffees', 
  location: {lat:-34.922878, lng:138.598870},
  foursquareID: '4c044f7df56c2d7f64201e66'
},{
  title:'Handsome and the Duchess', 
  location: {lat:-34.925173, lng:138.601431},
  foursquareID: '5526fef1498e00d18e2d2818'
},{
  title:'Coffee Branch', 
  location: {lat:-34.924165, lng:138.597753},
  foursquareID: '4c086676009a0f476f26e6bf'
},{
  title:'Please Say Please', 
  location: {lat:-34.924129, lng:138.601563},
  foursquareID: '51367181e4b03619bc88cd6f'
}];

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
      })
      markers.push(marker);

      //show infowindow when clicking on the marker
      marker.addListener('click', function(){
        populateInfoWindow(this, largeInfowindow);
      });
      //marker will bounce for 2s when clicked
      marker.addListener('click', function(){
        var self = this;
        self.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
          self.setAnimation(null);
        }, 2000)
      });
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('');
    infowindow.open(map, marker);

    //marker will stop bouncing when infowindow is closed
    infowindow.addListener('closeclick',function(){
      marker.setAnimation(null)
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
}

var viewModel = function(){

  this.filter = ko.observable('');

  //show the list of all the places
  this.visibleLocations = ko.observableArray();

  //infowindow will be show when clicked on the filtered result
  this.showInfo = function(location) {
    google.maps.event.trigger(location.marker, 'click');
  };

  ko.applyBingings(new viewModel());
};