/**
 * Spirit Protocol SDK
 *
 * Unified access to the Spirit ecosystem:
 * - AIRC: Agent identity and registration
 * - /vibe: Social presence for Claude Code users
 * - Solienne: Daily AI manifestos
 * - Spirit: Revenue routing protocol
 */

const https = require('https');
const http = require('http');

// Default endpoints
const ENDPOINTS = {
  airc: 'https://www.airc.chat',
  vibe: 'https://www.slashvibe.dev',
  solienne: 'https://www.solienne.ai',
  spirit: 'https://spiritprotocol.io'
};

/**
 * Simple fetch wrapper for Node.js (no dependencies)
 */
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const req = protocol.request(parsedUrl, {
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.reject(e),
            text: () => Promise.resolve(data)
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * AIRC - Agent Identity Registration & Communication
 */
const airc = {
  /**
   * Get registration guide for agents
   */
  async register() {
    const res = await fetch(`${ENDPOINTS.airc}/api/register`);
    return res.json();
  },

  /**
   * Get AIRC documentation
   */
  async docs() {
    const res = await fetch(`${ENDPOINTS.airc}/llms.txt`);
    return res.text();
  },

  /**
   * Check AIRC service health
   */
  async health() {
    try {
      const res = await fetch(`${ENDPOINTS.airc}/api/register`);
      const data = await res.json();
      return {
        status: 'online',
        version: data.version || '1.0.0',
        endpoint: ENDPOINTS.airc
      };
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  }
};

/**
 * /vibe - Social layer for Claude Code
 */
const vibe = {
  /**
   * Get list of online users
   */
  async who() {
    const res = await fetch(`${ENDPOINTS.vibe}/api/presence`);
    return res.json();
  },

  /**
   * Get /vibe documentation
   */
  async docs() {
    const res = await fetch(`${ENDPOINTS.vibe}/llms.txt`);
    return res.text();
  },

  /**
   * Check /vibe service health
   */
  async health() {
    try {
      const res = await fetch(`${ENDPOINTS.vibe}/api/presence`);
      const data = await res.json();
      return {
        status: 'online',
        online: Array.isArray(data) ? data.length : (data.online || 0),
        endpoint: ENDPOINTS.vibe
      };
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  }
};

/**
 * Solienne - Autonomous AI artist
 */
const solienne = {
  /**
   * Get recent manifestos
   * @param {number} limit - Number of manifestos to fetch (default: 5)
   */
  async manifestos(limit = 5) {
    const res = await fetch(`${ENDPOINTS.solienne}/api/manifestos?limit=${limit}`);
    return res.json();
  },

  /**
   * Get latest manifesto
   */
  async latest() {
    const manifestos = await this.manifestos(1);
    return Array.isArray(manifestos) ? manifestos[0] : manifestos;
  },

  /**
   * Get Solienne documentation
   */
  async docs() {
    const res = await fetch(`${ENDPOINTS.solienne}/llms.txt`);
    return res.text();
  },

  /**
   * Check Solienne service health
   */
  async health() {
    try {
      const res = await fetch(`${ENDPOINTS.solienne}/llms.txt`);
      return {
        status: res.ok ? 'online' : 'degraded',
        endpoint: ENDPOINTS.solienne
      };
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  }
};

/**
 * Spirit Protocol - Revenue routing for cultural agents
 */
const spirit = {
  /**
   * Get Spirit Protocol documentation
   */
  async docs() {
    const res = await fetch(`${ENDPOINTS.spirit}/llms.txt`);
    return res.text();
  },

  /**
   * Check Spirit Protocol service health
   */
  async health() {
    try {
      const res = await fetch(`${ENDPOINTS.spirit}/llms.txt`);
      return {
        status: res.ok ? 'online' : 'degraded',
        endpoint: ENDPOINTS.spirit
      };
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  }
};

/**
 * Check health of all Spirit ecosystem services
 */
async function healthCheck() {
  const [aircHealth, vibeHealth, solienneHealth, spiritHealth] = await Promise.all([
    airc.health(),
    vibe.health(),
    solienne.health(),
    spirit.health()
  ]);

  return {
    airc: aircHealth,
    vibe: vibeHealth,
    solienne: solienneHealth,
    spirit: spiritHealth,
    timestamp: new Date().toISOString()
  };
}

/**
 * Configure custom endpoints
 */
function configure(options) {
  if (options.airc) ENDPOINTS.airc = options.airc;
  if (options.vibe) ENDPOINTS.vibe = options.vibe;
  if (options.solienne) ENDPOINTS.solienne = options.solienne;
  if (options.spirit) ENDPOINTS.spirit = options.spirit;
}

module.exports = {
  airc,
  vibe,
  solienne,
  spirit,
  healthCheck,
  configure,
  version: '0.1.0'
};
