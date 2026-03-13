import * as Location from 'expo-location';

// Calculate distance between two coordinates in km
// Uses Haversine formula — accurate for short distances
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

// Check if user is inside geofence
export function isInsideGeofence(userLat, userLon, targetLat, targetLon, radiusKm) {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  return distance <= radiusKm;
}

// Request location permissions
export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

// Get current position once
export async function getCurrentPosition() {
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}