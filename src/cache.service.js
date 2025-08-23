class CacheService {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }
    
    set(key, value, ttl = 300000) { // Default 5 minutes
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
        
        const timer = setTimeout(() => {
            this.delete(key);
        }, ttl);
        
        this.timers.set(key, timer);
    }
    
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }
        
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return null;
        }
        
        return entry.value;
    }
    
    delete(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        
        return this.cache.delete(key);
    }
    
    clear() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        
        this.cache.clear();
        this.timers.clear();
    }
    
    size() {
        return this.cache.size;
    }
    
    keys() {
        return Array.from(this.cache.keys());
    }
    
    getStats() {
        return {
            size: this.cache.size,
            keys: this.keys(),
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                age: Date.now() - entry.timestamp,
                ttl: entry.ttl,
                expired: Date.now() - entry.timestamp > entry.ttl
            }))
        };
    }
}

module.exports = new CacheService();