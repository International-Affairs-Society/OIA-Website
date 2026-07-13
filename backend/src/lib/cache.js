/**
 * Lightweight in-memory TTL cache.
 * Avoids redundant DB round-trips for frequently read, rarely written data.
 *
 * Usage:
 *   getCached('events:all')               → data | null
 *   setCached('events:all', data, 60_000) → sets with 60s TTL
 *   invalidateCache('events:')            → clears all keys with prefix
 */

const cache = new Map()

/**
 * Retrieve a cached value.
 * Returns null if the key doesn't exist or has expired.
 * @param {string} key
 * @returns {any | null}
 */
export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

/**
 * Store a value in the cache with a TTL.
 * @param {string} key
 * @param {any} data
 * @param {number} ttlMs - Time to live in milliseconds (default: 60 seconds)
 */
export function setCached(key, data, ttlMs = 60_000) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

/**
 * Invalidate all cache entries whose keys start with the given prefix.
 * Call this in write operations (create, update, delete) to bust stale reads.
 * @param {string} prefix
 */
export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

/**
 * Clear the entire cache (useful for testing or full resets).
 */
export function clearCache() {
  cache.clear()
}
