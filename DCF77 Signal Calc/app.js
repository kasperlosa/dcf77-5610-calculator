// Initialize map
var map = L.map('map').setView([50.012, 9.011], 5);  // Center on DCF77 station

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// DCF77 Station coordinates
var dcf77 = L.marker([50.012, 9.011]).addTo(map).bindPopup("DCF77 Station");

var radiusOptions = {color: '#000', weight: 1, fillColor: '#888', fillOpacity: 0.2};

// Draw signal rings
L.circle([50.012, 9.011], { ...radiusOptions, radius: 500000 }).addTo(map);
L.circle([50.012, 9.011], { ...radiusOptions, radius: 1000000 }).addTo(map);
L.circle([50.012, 9.011], { ...radiusOptions, radius: 1500000 }).addTo(map);

document.getElementById('search').addEventListener('click', function() {
    var address = document.getElementById('address').value;
    getCoordinates(address).then(coords => {
        var latLng = [coords.lat, coords.lon];
        var distance = map.distance(latLng, [50.012, 9.011]);
        var signalStrength = calculateSignalStrength(distance);
        var bestTime = calculateBestTime(coords);

        // Check if the address is in restricted areas
        if (isInRestrictedArea(coords)) {
            alert("DCF77 not possible. Other towers available. Please check if you are inside any of the other towers' ranges.");
            signalStrength = "Impossible";
            bestTime = "";
        } else {
            // Place a marker and update the map view
            L.marker(latLng).addTo(map).bindPopup(`Your Location: ${address}`).openPopup();
            map.setView(latLng, 7);

            // Update signal strength and best time
            document.getElementById('signal-strength').innerText = `Signal Strength: ${signalStrength}`;
            document.getElementById('best-time').innerText = `Best Time for Synchronization: ${bestTime}`;
        }
    });
});

document.getElementById('info').addEventListener('click', function() {
    alert("To ensure that the watch will sync with the DCF77 Station, it is recommended to put it near a window. If you are outside of the optimal range, syncing may be difficult or impossible. Check other towers' ranges or try using an app like Radio Wave Sync to synchronize your watch. Additionally, make sure to change your timezone to Central European Time (CET) to match the timezone of the DCF77 tower.");
});

// Function to check if the location is in restricted areas
function isInRestrictedArea(coords) {
    const { lat, lon } = coords;
    
    // Simple geographic restrictions (not precise, use appropriate geographic libraries or APIs for exact bounds)
    // Approximate bounds for Japan, Korea, USA (excluding Alaska and Hawaii)
    const inJapan = lat >= 24.396308 && lat <= 45.551483 && lon >= 122.93457 && lon <= 153.986672;
    const inKorea = lat >= 33.060388 && lat <= 43.001498 && lon >= 124.611328 && lon <= 131.868439;
    const inUSA = lat >= 24.396308 && lat <= 49.384358 && lon >= -125.0 && lon <= -66.93457;
    
    // Check for Alaska and Hawaii exclusions
    const inAlaska = lat >= 51.214 && lat <= 71.538 && lon >= -179.148 && lon <= -129.998;
    const inHawaii = lat >= 18.776 && lat <= 20.501 && lon >= -155.995 && lon <= -154.789;
    
    return (inJapan || inKorea || (inUSA && !inAlaska && !inHawaii));
}

// Function to calculate signal strength
function calculateSignalStrength(distance) {
    if (distance < 500000) return "Strong";
    if (distance < 1000000) return "Medium";
    if (distance < 1500000) return "Weak";
    return "Impossible";
}

// Function to calculate best time for signal synchronization
function calculateBestTime(coords) {
    var currentHour = new Date().getUTCHours();
    if (currentHour >= 0 && currentHour <= 6) return "Now";
    return "Nighttime (00:00 - 06:00 UTC)";
}

// Fetch coordinates from address using OpenStreetMap's Nominatim API
async function getCoordinates(address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    return data[0];
}

