import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmtNGsTGII7c7ecu9F2SATccmkxxcPdXY",
  authDomain: "time-stamp-f5d2e.firebaseapp.com",
  projectId: "time-stamp-f5d2e",
  storageBucket: "time-stamp-f5d2e.appspot.com",
  messagingSenderId: "863911799120",
  appId: "1:863911799120:web:64a9c3b92891bddbcc2455",
  measurementId: "G-QKN79NR1T2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize the map and marker variables
let map;
let marker;

function initializeMap(lat, long) {
  const myCenter = new google.maps.LatLng(lat, long);
  const mapProp = {
    center: myCenter,
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.HYBRID, // Use SATELLITE or HYBRID for tilt
    tilt: 45, // Tilt the map
    heading: 90 // Set the map heading (rotation)
  };
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
  marker = new google.maps.Marker({ position: myCenter });
  marker.setMap(map);
}

function smoothMoveMarker(toLat, toLng) {
  const fromLatLng = marker.getPosition();
  const toLatLng = new google.maps.LatLng(toLat, toLng);
  const deltaLat = toLatLng.lat() - fromLatLng.lat();
  const deltaLng = toLatLng.lng() - fromLatLng.lng();
  const steps = 100; // Number of steps for the animation
  let currentStep = 0;

  function moveMarker() {
    const newLat = fromLatLng.lat() + (deltaLat * currentStep) / steps;
    const newLng = fromLatLng.lng() + (deltaLng * currentStep) / steps;
    const newLatLng = new google.maps.LatLng(newLat, newLng);
    marker.setPosition(newLatLng);
    map.setCenter(newLatLng);

    if (currentStep < steps) {
      currentStep++;
      requestAnimationFrame(moveMarker);
    }
  }

  moveMarker();
}

function updateMap(lat, long) {
  smoothMoveMarker(lat, long);
}

function myMap() {
  const dbRef = ref(db, `/Time_Stamp_App`);
  onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      const locationData = snapshot.val();
      if (!map || !marker) {
        initializeMap(locationData.lat, locationData.long);
      } else {
        updateMap(locationData.lat, locationData.long);
      }
    } else {
      console.log("No data available");
    }
  }, (error) => {
    console.error(error);
  });
}

// Ensure DOM is fully loaded before calling myMap
document.addEventListener("DOMContentLoaded", (event) => {
  // Ensure Google Maps API is loaded before calling myMap
  if (typeof google !== 'undefined' && google.maps) {
    myMap();
  } else {
    console.error('Google Maps API not loaded');
  }
});
