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

// Function to initialize the map
function initMap() {
    if (typeof(L) === 'undefined') {
        console.error('Leaflet library is not loaded.');
        return;
    }
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('"map" element not found in the DOM.');
        return;
    }
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    console.log('Map initialized.');
}

// Select sneaker type and highlight the chosen type
function selectSneakerType(type) {
    sneakerType = type;
    document.querySelectorAll('.sneaker-type').forEach(el => el.classList.remove('active'));
    document.querySelector(`.sneaker-type[data-type="${type}"]`).classList.add('active');
    webApp.showAlert(`You selected ${type} sneaker`);
}

// Select activity mode and highlight the chosen mode
function selectActivityMode(mode) {
    activityMode = mode;
    document.querySelectorAll('.mode-select').forEach(el => el.classList.remove('active'));
    document.querySelector(`.mode-select[data-mode="${mode}"]`).classList.add('active');
    webApp.showAlert(`You selected ${mode} mode`);
}

// Start tracking the user's position
function startTracking() {
    if (!navigator.geolocation) {
        webApp.showAlert("Geolocation is not supported by this browser.");
        return;
    }

    webApp.showAlert("Tracking started");
    startTime = Date.now();

    watchId = navigator.geolocation.watchPosition(geoSuccess, geoError, {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
    });
}

// Stop tracking the user's position
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        webApp.showAlert("Tracking stopped");
    } else {
        webApp.showAlert("No tracking to stop");
    }
}

// Successfully retrieved user position
function geoSuccess(position) {
    const { latitude, longitude } = position.coords;
    const newPosition = [latitude, longitude];

    if (!marker) {
        marker = L.marker(newPosition).addTo(map);
    } else {
        marker.setLatLng(newPosition);
    }

    map.setView(newPosition, 15);
    updateStats(newPosition);
}

// Handle geolocation errors
function geoError(error) {
    const errorTypes = {
        1: "Permission denied",
        2: "Position unavailable",
        3: "Timeout"
    };
    const errorMessage = errorTypes[error.code] || "Unknown error";
    webApp.showAlert(`Geolocation error: ${errorMessage}`);
    console.error(`Geolocation error (${error.code}): ${errorMessage}`);
}

// Update statistics based on the new position
function updateStats(newPosition) {
    if (lastPosition) {
        const distanceIncrement = calculateDistance(lastPosition, newPosition);
        distance += distanceIncrement;
        document.getElementById('distance').innerText = distance.toFixed(2);

        const elapsedMinutes = (Date.now() - startTime) / 60000;
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

// Show home section and hide others
function showHome() {
    document.querySelectorAll('div[id]').forEach(div => div.style.display = 'none');
    document.getElementById('home').style.display = 'block';
}

// Function to attach event listeners
function attachEventListeners() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    if (startButton) {
        startButton.addEventListener('click', startTracking);
    } else {
        console.error('"startButton" not found in the DOM.');
    }

    if (stopButton) {
        stopButton.addEventListener('click', stopTracking);
    } else {
        console.error('"stopButton" not found in the DOM.');
    }

    document.querySelectorAll('.sneaker-type').forEach(el => {
        el.addEventListener('click', function() {
            selectSneakerType(this.dataset.type);
        });
    });

    document.querySelectorAll('.mode-select').forEach(el => {
        el.addEventListener('click', function() {
            selectActivityMode(this.dataset.mode);
        });
    });
}

window.onload = function() {
    initMap();
    attachEventListeners();
};
