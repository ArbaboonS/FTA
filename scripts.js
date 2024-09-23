let webApp = window.Telegram.WebApp;
webApp.ready();

let gst = 0;
let gmt = 0;
let energy = 10;
let level = 0;
let sneakerType = 'Walker';
let activityMode = 'Walking';
let watchId;
let map;
let marker;
let startTime;
let distance = 0;
let lastPosition;

const sneakerTypes = {
    Walker: { optimalSpeed: { min: 1, max: 6 }, gstReturn: 4 },
    Jogger: { optimalSpeed: { min: 4, max:10 }, gstReturn: 5 },
    Runner: { optimalSpeed: { min: 8, max: 20 }, gstReturn: 6 },
    Trainer: { optimalSpeed: { min: 1, max: 20 }, gstReturn: 5.5 }
};

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function selectSneakerType(type) {
    sneakerType = type;
    document.querySelectorAll('.sneaker-type').forEach(el => el.classList.remove('active'));
    document.querySelector(`.sneaker-type:nth-child(${['Walker', 'Jogger', 'Runner', 'Trainer'].indexOf(type) + 1})`).classList.add('active');
    webApp.showAlert(`You selected ${type} sneaker`);
}

function selectActivityMode(mode) {
    activityMode = mode;
    document.querySelectorAll('.mode-select').forEach(el => el.classList.remove('active'));
    document.querySelector(`.mode-select:nth-child(${['Walking', 'Running', 'Group Running', 'Cycling'].indexOf(mode) + 1})`).classList.add('active');
    webApp.showAlert(`You selected ${mode} mode`);
}

function startTracking() {
    if (navigator.geolocation) {
        webApp.showAlert("Tracking started");
        startTime = new Date().getTime();
        watchId = navigator.geolocation.watchPosition(geoSuccess, geoError, { enableHighAccuracy: true });
    } else {
        webApp.showAlert("Geolocation is not supported by this browser.");
    }
}

function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        webApp.showAlert("Tracking stopped");
    }
}

function geoSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const newPosition = [latitude, longitude];

    if (!marker) {
        marker = L.marker(newPosition).addTo(map);
    } else {
        marker.setLatLng(newPosition);
    }

    map.setView(newPosition, 15);
    updateStats(newPosition);
}

function geoError(error) {
    webApp.showAlert(`Error occurred. Error code: ${error.code}`);
}

function updateStats(newPosition) {
    if (lastPosition) {
        const distanceIncrement = calculateDistance(lastPosition, newPosition);
        distance += distanceIncrement;
        document.getElementById('distance').innerText = distance.toFixed(2);

        const elapsedMinutes = (new Date().getTime() - startTime) / 60000;
        const speed = distance / elapsedMinutes;
        document.getElementById('speed').innerText = speed.toFixed(2);

        const gstIncrement = sneakerTypes[sneakerType].gstReturn * distanceIncrement;
        gst += gstIncrement;
        document.getElementById('gst').innerText = gst.toFixed(2);
    }
    lastPosition = newPosition;
}

function calculateDistance(start, end) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(end[0] - start[0]);
    const dLon = deg2rad(end[1] - start[1]);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(start[0])) * Math.cos(deg2rad(end[0])) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function openDapp(link) {
    window.open(link, '_blank');
}

window.onload = function() {
    initMap();
};
