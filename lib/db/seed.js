export const seedRoutes = [
  {
    id: "r-blue",
    name: "Blue Line",
    stops: [
      { id: "s1", name: "Main Gate", lat: 12.9352, lng: 77.6146 },
      { id: "s2", name: "Library", lat: 12.9367, lng: 77.6099 },
      { id: "s3", name: "Hostel Block A", lat: 12.9391, lng: 77.6062 },
      { id: "s4", name: "Sports Complex", lat: 12.9421, lng: 77.6031 },
    ],
    segmentMinutes: 4,
  },
  {
    id: "r-green",
    name: "Green Loop",
    stops: [
      { id: "s5", name: "Main Gate", lat: 12.9352, lng: 77.6146 },
      { id: "s6", name: "Engineering Block", lat: 12.9325, lng: 77.6193 },
      { id: "s7", name: "Cafeteria", lat: 12.9297, lng: 77.6218 },
      { id: "s8", name: "Medical Center", lat: 12.9277, lng: 77.6171 },
    ],
    segmentMinutes: 5,
  },
];

export const seedBuses = [
  {
    id: "b101",
    number: "KA-01-101",
    routeId: "r-blue",
    status: "On Time",
    currentSegmentIndex: 0,
    segmentProgress: 0.1,
    delayMinutes: 0,
  },
  {
    id: "b205",
    number: "KA-01-205",
    routeId: "r-green",
    status: "On Time",
    currentSegmentIndex: 1,
    segmentProgress: 0.45,
    delayMinutes: 0,
  },
];
