export interface LocationInfo {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  type: string;
}

export interface SessionMetadata {
  location: LocationInfo;
  device: DeviceInfo;
  ip: string;
}
