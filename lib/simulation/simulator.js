import { seedBuses, seedRoutes } from "@/lib/seed";

const TICK_SECONDS = 8;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getRouteByIdUnsafe(state, routeId) {
  return state.routes.find((route) => route.id === routeId);
}

function computeCurrentPosition(bus, route) {
  const from = route.stops[bus.currentSegmentIndex];
  const nextIndex = (bus.currentSegmentIndex + 1) % route.stops.length;
  const to = route.stops[nextIndex];
  return {
    lat: lerp(from.lat, to.lat, bus.segmentProgress),
    lng: lerp(from.lng, to.lng, bus.segmentProgress),
  };
}

function etaToStopMinutes(bus, route, stopIndex) {
  const segmentMinutes = route.segmentMinutes;
  const nextIndex = (bus.currentSegmentIndex + 1) % route.stops.length;
  if (stopIndex === nextIndex) {
    const base = (1 - bus.segmentProgress) * segmentMinutes;
    return Math.max(1, Math.round(base + bus.delayMinutes));
  }

  let hops = 0;
  let cursor = nextIndex;
  while (cursor !== stopIndex) {
    hops += 1;
    cursor = (cursor + 1) % route.stops.length;
    if (hops > route.stops.length) {
      break;
    }
  }

  const timeToNext = (1 - bus.segmentProgress) * segmentMinutes;
  const afterNext = hops * segmentMinutes;
  return Math.max(1, Math.round(timeToNext + afterNext + bus.delayMinutes));
}

function createInitialState() {
  return {
    routes: clone(seedRoutes),
    buses: clone(seedBuses),
    lastUpdated: new Date().toISOString(),
  };
}

function tick(state) {
  for (const bus of state.buses) {
    const route = getRouteByIdUnsafe(state, bus.routeId);
    if (!route || route.stops.length < 2) {
      continue;
    }

    const step = TICK_SECONDS / (route.segmentMinutes * 60);
    bus.segmentProgress += step;
    if (bus.segmentProgress >= 1) {
      bus.segmentProgress = bus.segmentProgress - 1;
      bus.currentSegmentIndex =
        (bus.currentSegmentIndex + 1) % route.stops.length;
    }

    if (Math.random() < 0.08) {
      bus.delayMinutes = Math.min(10, bus.delayMinutes + 1);
    } else if (Math.random() < 0.2) {
      bus.delayMinutes = Math.max(0, bus.delayMinutes - 1);
    }
    bus.status = bus.delayMinutes >= 4 ? "Delayed" : "On Time";
  }

  state.lastUpdated = new Date().toISOString();
}

function ensureState() {
  if (!globalThis.smartTransitState) {
    globalThis.smartTransitState = createInitialState();
  }

  if (!globalThis.smartTransitInterval) {
    globalThis.smartTransitInterval = setInterval(() => {
      tick(globalThis.smartTransitState);
    }, TICK_SECONDS * 1000);
  }

  return globalThis.smartTransitState;
}

export function getBuses() {
  const state = ensureState();
  return state.buses.map((bus) => {
    const route = getRouteByIdUnsafe(state, bus.routeId);
    if (!route) return null;

    const nextIndex = (bus.currentSegmentIndex + 1) % route.stops.length;
    const position = computeCurrentPosition(bus, route);
    return {
      ...bus,
      routeName: route.name,
      nextStop: route.stops[nextIndex]?.name ?? "Unknown",
      etaMinutes: etaToStopMinutes(bus, route, nextIndex),
      position,
    };
  }).filter(Boolean);
}

export function getBusById(busId) {
  return getBuses().find((bus) => bus.id === busId) ?? null;
}

export function getRoutes() {
  const state = ensureState();
  return clone(state.routes);
}

export function getRouteDetails(routeId) {
  const state = ensureState();
  const route = getRouteByIdUnsafe(state, routeId);
  if (!route) return null;

  const buses = state.buses.filter((bus) => bus.routeId === route.id);
  const stopsWithEta = route.stops.map((stop, stopIndex) => {
    const etaCandidates = buses.map((bus) => etaToStopMinutes(bus, route, stopIndex));
    const etaMinutes = etaCandidates.length ? Math.min(...etaCandidates) : null;
    return {
      ...stop,
      etaMinutes,
    };
  });

  return {
    ...clone(route),
    stops: stopsWithEta,
    buses: buses.map((bus) => ({
      ...bus,
      position: computeCurrentPosition(bus, route),
    })),
  };
}

export function getNotifications() {
  const buses = getBuses();
  const notes = [];

  for (const bus of buses) {
    if (bus.etaMinutes <= 5) {
      notes.push({
        id: `${bus.id}-arriving`,
        type: "arriving_soon",
        message: `${bus.number} is arriving at ${bus.nextStop} in ~${bus.etaMinutes} min`,
      });
    }
    if (bus.status === "Delayed") {
      notes.push({
        id: `${bus.id}-delayed`,
        type: "delayed",
        message: `${bus.number} is delayed by ~${bus.delayMinutes} min`,
      });
    }
  }

  return notes;
}

export function getSnapshotForAI() {
  const state = ensureState();
  return {
    lastUpdated: state.lastUpdated,
    buses: getBuses().map((bus) => ({
      number: bus.number,
      routeName: bus.routeName,
      status: bus.status,
      nextStop: bus.nextStop,
      etaMinutes: bus.etaMinutes,
      delayMinutes: bus.delayMinutes,
    })),
  };
}

export function addBus(payload) {
  const state = ensureState();
  const route = getRouteByIdUnsafe(state, payload.routeId);
  if (!route) {
    throw new Error("Route not found");
  }

  const bus = {
    id: payload.id ?? `b${Math.floor(Math.random() * 900 + 100)}`,
    number: payload.number,
    routeId: payload.routeId,
    status: "On Time",
    currentSegmentIndex: 0,
    segmentProgress: 0.05,
    delayMinutes: 0,
  };

  state.buses.push(bus);
  return bus;
}

export function updateBus(busId, payload) {
  const state = ensureState();
  const idx = state.buses.findIndex((bus) => bus.id === busId);
  if (idx < 0) return null;

  const next = {
    ...state.buses[idx],
    ...payload,
  };

  state.buses[idx] = next;
  return next;
}

export function deleteBus(busId) {
  const state = ensureState();
  const before = state.buses.length;
  state.buses = state.buses.filter((bus) => bus.id !== busId);
  return state.buses.length !== before;
}

export function addRoute(payload) {
  const state = ensureState();
  const route = {
    id: payload.id ?? `r-${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name,
    segmentMinutes: payload.segmentMinutes ?? 4,
    stops: payload.stops ?? [],
  };
  state.routes.push(route);
  return route;
}

export function updateRoute(routeId, payload) {
  const state = ensureState();
  const idx = state.routes.findIndex((route) => route.id === routeId);
  if (idx < 0) return null;
  state.routes[idx] = { ...state.routes[idx], ...payload };
  return state.routes[idx];
}
