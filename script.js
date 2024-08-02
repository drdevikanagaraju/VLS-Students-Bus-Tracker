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

// Define the custom icon
const customIcon = L.icon({
  iconUrl: '/bus_icon.png', // URL to your custom icon image
  iconSize: [38, 38], // size of the icon
  iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -38] // point from which the popup should open relative to the iconAnchor
});

function initializeMap(lat, long) {
  console.log(lat, long);
  map = L.map('map').setView([lat, long], 17);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  }).addTo(map);

  marker = L.marker([lat, long], { icon: customIcon }).addTo(map);
}

function smoothMoveMarker(toLat, toLng) {
  const fromLatLng = marker.getLatLng();
  const toLatLng = L.latLng(toLat, toLng);
  const deltaLat = toLatLng.lat - fromLatLng.lat;
  const deltaLng = toLatLng.lng - fromLatLng.lng;
  const steps = 100; // Number of steps for the animation
  let currentStep = 0;

  function moveMarker() {
    const newLat = fromLatLng.lat + (deltaLat * currentStep) / steps;
    const newLng = fromLatLng.lng + (deltaLng * currentStep) / steps;
    const newLatLng = L.latLng(newLat, newLng);
    marker.setLatLng(newLatLng);
    map.panTo(newLatLng);

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

function myMap(route) {
  const dbRef = ref(db, route);
  onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      const locationData = snapshot.val();
      console.log(locationData);
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

const dropdown = document.getElementById('dropdown');

document.addEventListener("DOMContentLoaded", (event) => {
    myMap("Default");
});

document.addEventListener('DOMContentLoaded', (event) => {
            const dropdown = document.getElementById('dropdown');

    dropdown.addEventListener('change', () => {

        var selectedValue = dropdown.value;
        myMap(selectedValue);

        dropdown.remove();

    });
});

