import * as Network from 'expo-network';
import { DEFAULT_PORT, CONNECTION_STRING } from "../../common/constants";

const getRangeIps = (ip) => {
  return [
    '192.168.1.113'
  ]

  const ips = [];
  const [nr1, nr2, nr3, last] = ip.split('.');
  const prefix = [nr1, nr2, nr3].join('.');

  for(let i = 1; i <= 254; i++) {
    ips.push(`${prefix}.${i}`);
  }

  return ips;
}

const createPath = (ip, path) => {
  return `http://${ip}:${DEFAULT_PORT}${path}`;
}

const fetchWithTimeout = async (resource, options) => {
  const { timeout = 100 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
}

const callFetch = async (url, options = {}) => {
  const resp = await fetchWithTimeout(url, options);
  if (resp.ok) return resp;
  return null;
}

const checkIp = async (ipAddress) => {
  try {
    const path = createPath(ipAddress, "/ping");
    const resp = await callFetch(path, {
      timeout: 100, // Should be a bit higher, but for local development this works.
    });
    if ( resp ) {
      const string = await resp.text();
      return string === CONNECTION_STRING;
    }
    return false;
  } catch (err) {
    console.error(err.message.substr(0, 1000));
    return false;
  }
};

const detectServers = async () => {
  const servers = [];
  const { isConnected, type } = await Network.getNetworkStateAsync();

  if ( isConnected && type === Network.NetworkStateType.WIFI ) {
    const possibleIp = await Network.getIpAddressAsync();
    const rangeIps = getRangeIps(possibleIp);
    for (const ip of rangeIps) {
      const isServer = await checkIp(ip);
      if (isServer) {
        servers.push(ip);
        console.log(`[${ip}] an server`)
      } else {
        console.log(`[${ip}] not an server`)
      }
    }
  }

  return servers;
}

const requestServerToGenerateCode = (server) => {
  return callFetch(createPath(server, "/create-code"));
}

const validateCode = async (server, code) => {
  const resp = await callFetch(createPath(server, "/validate-code"), {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: {'Content-Type': 'application/json'}
  });

  if (resp && resp.ok) return await resp.text();
  return null;
}

const validateToken = async (server, token) => {
  const resp = await callFetch(createPath(server, "/validate"), {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: {'Content-Type': 'application/json'}
  });
  if (resp && resp.ok) return true;
  return false;
}

export {
  validateToken,
  detectServers,
  requestServerToGenerateCode,
  validateCode,
}
