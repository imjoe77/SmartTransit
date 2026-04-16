export type LatLng = { lat: number; lng: number };

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(from: LatLng, to: LatLng) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function calculateETA(from: LatLng, to: LatLng, avgSpeedKmh = 30) {
  const speed = Math.max(1, avgSpeedKmh);
  const distanceKm = haversineDistanceKm(from, to);
  const minutes = (distanceKm / speed) * 60;
  return Math.max(1, Math.round(minutes));
}
