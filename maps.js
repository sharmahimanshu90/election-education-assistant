// maps.js
// Handles Google Maps initialization, Geolocation, and finding nearby polling booths.

let map;
let userMarker;
let boothMarker;
let isMapLoaded = false;
let userLocation = null;
let googleMapsConfigured = false;

// Initialize Google Maps script dynamically
function initGoogleMapsAPI() {
    if (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_MAPS_API_KEY && CONFIG.GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY") {
        googleMapsConfigured = true;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        console.warn("Google Maps API key not configured. Map will run in mock mode.");
        // Expose a mock initMap to avoid breaking if called
        window.initMap = mockInitMap;
    }
}

// Global callback for Maps script
window.initMap = function() {
    isMapLoaded = true;
    console.log("Google Maps loaded.");
}

function mockInitMap() {
    isMapLoaded = true;
    console.log("Mock Google Maps initialized.");
}

const MapsManager = {
    
    // Request user location and render map
    findNearestBooth: async () => {
        const mapContainer = document.getElementById('map-section');
        const mapView = document.getElementById('google-map');
        const mapDetails = document.getElementById('map-details');
        const boothNameEl = document.getElementById('booth-name');
        const boothDistanceEl = document.getElementById('booth-distance');
        const navLinkEl = document.getElementById('nav-link');

        mapContainer.classList.remove('hidden');

        // Check for geolocation support
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (googleMapsConfigured && window.google) {
                MapsManager.renderRealMap(userLocation, mapView, mapDetails, boothNameEl, boothDistanceEl, navLinkEl);
            } else {
                MapsManager.renderMockMap(userLocation, mapView, mapDetails, boothNameEl, boothDistanceEl, navLinkEl);
            }

        } catch (error) {
            console.error("Error getting location", error);
            alert("Unable to retrieve your location. Please check your permissions.");
        }
    },

    renderRealMap: (location, mapView, mapDetails, boothNameEl, boothDistanceEl, navLinkEl) => {
        map = new google.maps.Map(mapView, {
            center: location,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
        });

        // User Marker
        userMarker = new google.maps.Marker({
            position: location,
            map: map,
            title: "Your Location",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#1a73e8",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff"
            }
        });

        // Search for nearest "local government office" or "school" (common polling places)
        const service = new google.maps.places.PlacesService(map);
        const request = {
            location: location,
            radius: '2000',
            type: ['school', 'local_government_office']
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const nearestBooth = results[0];
                
                boothMarker = new google.maps.Marker({
                    position: nearestBooth.geometry.location,
                    map: map,
                    title: nearestBooth.name,
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    }
                });

                // Adjust bounds to show both user and booth
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(userMarker.getPosition());
                bounds.extend(boothMarker.getPosition());
                map.fitBounds(bounds);

                // Calculate distance (straight line roughly)
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    userMarker.getPosition(), boothMarker.getPosition()
                );
                
                mapDetails.classList.remove('hidden');
                boothNameEl.textContent = nearestBooth.name;
                boothDistanceEl.textContent = `Approx. ${(distance / 1000).toFixed(1)} km away`;
                
                // Directions Link
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${nearestBooth.geometry.location.lat()},${nearestBooth.geometry.location.lng()}&travelmode=driving`;
                navLinkEl.href = directionsUrl;

            } else {
                mapDetails.classList.remove('hidden');
                boothNameEl.textContent = "No polling booths found nearby.";
                boothDistanceEl.textContent = "Please check your local election authority website.";
                navLinkEl.style.display = 'none';
            }
        });
    },

    renderMockMap: (location, mapView, mapDetails, boothNameEl, boothDistanceEl, navLinkEl) => {
        // Fallback visual
        mapView.style.background = `url('https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:U%7C${location.lat},${location.lng}&key=${CONFIG.GOOGLE_MAPS_API_KEY || ''}') center/cover no-repeat`;
        mapView.style.backgroundColor = "#e9e9e9";
        mapView.style.display = "flex";
        mapView.style.alignItems = "center";
        mapView.style.justifyContent = "center";
        
        if (!googleMapsConfigured) {
             mapView.innerHTML = "<div style='background:rgba(255,255,255,0.8); padding: 10px; border-radius: 8px; text-align:center;'><p>Map View Unavailable</p><small>Google Maps API Key required</small></div>";
        }

        mapDetails.classList.remove('hidden');
        boothNameEl.textContent = "Mock Polling Station (Demo)";
        boothDistanceEl.textContent = "Approx. 1.2 km away";
        
        // Mock coordinates slightly offset from user
        const mockDestLat = location.lat + 0.01;
        const mockDestLng = location.lng + 0.01;
        
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${mockDestLat},${mockDestLng}&travelmode=driving`;
        navLinkEl.href = directionsUrl;
    }
};

window.MapsManager = MapsManager;

// Trigger init immediately
initGoogleMapsAPI();
