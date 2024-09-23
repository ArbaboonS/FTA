// Initialize Telegram Web App
let webApp = window.Telegram.WebApp;
webApp.ready();

// Application state
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
let score = 0;

const sneakerTypes = {
    Walker: { optimalSpeed: { min: 1, max: 6 }, gstReturn: 4 },
    Jogger: { optimalSpeed: { min: 4, max: 10 }, gstReturn: 5 },
    Runner: { optimalSpeed: { min: 8, max: 20 }, gstReturn: 6 },
    Trainer: { optimalSpeed: { min: 1, max: 20 }, gstReturn: 5.5 }
};

// Initialize the map with Leaflet
function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Select sneaker type and highlight the chosen type
function selectSneakerType(type) {
    sneakerType = type;
    document.querySelectorAll('.sneaker-type').forEach(el => el.classList.remove('active'));
    document.querySelector(`.sneaker-type:nth-child(${Object.keys(sneakerTypes).indexOf(type) + 1})`).classList.add('active');
    webApp.showAlert(`You selected ${type} sneaker`);
}

// Select activity mode and highlight the chosen mode
function selectActivityMode(mode) {
    activityMode = mode;
    document.querySelectorAll('.mode-select').forEach(el => el.classList.remove('active'));
    document.querySelector(`.mode-select:nth-child(${['Walking', 'Running', 'Group Running', 'Cycling'].indexOf(mode) + 1})`).classList.add('active');
    webApp.showAlert(`You selected ${mode} mode`);
}

// Start tracking activity using geolocation
function startTracking() {
    if (navigator.geolocation) {
        webApp.showAlert("Tracking started");
        startTime = new Date().getTime();
        watchId = navigator.geolocation.watchPosition(geoSuccess, geoError, { enableHighAccuracy: true });
    } else {
        webApp.showAlert("Geolocation is not supported by this browser.");
    }
}

// Stop tracking activity
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        webApp.showAlert("Tracking stopped");
    }
}

// Success callback for geolocation
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

// Error callback for geolocation
function geoError(error) {
    webApp.showAlert(`Error occurred. Error code: ${error.code}`);
}

// Update statistics based on the new position
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

// Calculate distance between two geographical points using Haversine formula
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

// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Open a related Dapp in a new window
function openDapp(link) {
    window.open(link, '_blank');
}

// Join a fitness challenge
function joinChallenge(challenge) {
    webApp.showAlert(`Joined ${challenge}`);
    // Custom logic for tracking challenge participation
}

// Claim a reward based on points
function claimReward(points) {
    if (score >= points) {
        score -= points;
        webApp.showAlert(`Reward of ${points} points claimed`);
        document.getElementById('score').innerText = score;
    } else {
        webApp.showAlert('Not enough points to claim this reward');
    }
}

// Copy invite link to clipboard
function copyInviteLink() {
    const inviteLink = document.getElementById('inviteLink');
    inviteLink.select();
    document.execCommand('copy');
    webApp.showAlert('Invite link copied to clipboard');
}

// Perform level up
function levelUp() {
    const requiredGst = 10 + level * 5;
    const requiredGmt = 5 + level * 2;

    if (gst >= requiredGst && gmt >= requiredGmt) {
        level++;
        gst -= requiredGst;
        gmt -= requiredGmt;
        webApp.showAlert('Level up successful');
        document.getElementById('currentLevel').innerText = level;
    } else {
        webApp.showAlert('Not enough GST or GMT to level up');
    }
}

// Buy items from the shop
function buyItem(item) {
    webApp.showAlert(`Bought ${item}`);
    // Custom logic for purchasing items
}

// Go to home section
function goHome() {
    // Logic to return to the "home" section from any other section
    document.querySelectorAll('div[id]').forEach(div => div.style.display = 'none');
    document.getElementById('home').style.display = 'block';
}

window.onload = function() {
    initMap();
    document.getElementById('home').style.display = 'block';
};
``
