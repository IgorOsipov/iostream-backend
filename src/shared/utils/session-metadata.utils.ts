import type { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';

import type { SessionMetadata } from '../types/session-metadata.types';

import { IS_DEV_ENV } from './is-dev.util';

import DeviceDetector = require('device-detector-js');

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getSessionMetadata(
  req: Request,
  userAgent: string
): SessionMetadata {
  const ip = IS_DEV_ENV
    ? '127.0.0.1'
    : Array.isArray(req.headers['cf-connection-ip'])
      ? req.headers['cf-connection-ip'][0]
      : (req.headers['cf-connecting-ip'] as string) ||
        (typeof req.headers['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',')[0]
          : req.ip) ||
        'Unknown';

  const location = lookup(ip);
  const device = new DeviceDetector().parse(userAgent);

  return {
    ip,
    device: {
      browser: device.client?.name || 'Unknown',
      os: device.os?.name || 'Unknown',
      type: device.device?.type || 'Unknown'
    },
    location: {
      country: countries.getName(location?.country || 'US', 'en') || 'Unknown',
      city: location?.city || 'Unknown',
      latitude: location?.ll?.[0] || 0,
      longitude: location?.ll?.[1] || 0
    }
  };
}
