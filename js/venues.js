// venues.js
// Hardcoded venue list for mapping name to id (should match DB)
export const VENUES = [
  { id: 1, name: "Main Hall" },
  { id: 2, name: "Phase A Area 1" },
  { id: 3, name: "Phase 2 Area B" },
  { id: 4, name: "NxtGen Room" }
];

export function getVenueIdByName(name) {
  const venue = VENUES.find(v => v.name === name);
  return venue ? venue.id : null;
}
