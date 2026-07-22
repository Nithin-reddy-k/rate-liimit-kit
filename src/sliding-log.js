import { systemClock } from "./clock.js";


/*
Sliding window log is esact rate limiting
this stores one timestamps for every accesped request i.e., O(limit) memory for each instance/user
Requests that are denied are not recorded in memory
*/


export class SlidingWindowLogLimiter {
    #limit;
    #windowMs;
    #clock;
    #log = [];

    constructor({ limit, windowMs, clock = systemClock }) {
        if(!Number.isInteger(limit) || limit <= 0) {
            throw new RangeError("limit must be a positive integer.");
        }
        if(!Number.isFinite(windowMs) || windowMs <= 0) {
            throw new RangeError("windowMS must be > 0");
        }
        this.#limit = limit;
        this.#windowMs = windowMs;
        this.#clock = clock;
    }

    check() {
        const now = this.#clock.now();
        const cutoff = now - this.#windowMs;


        // Eviction stratedy(the sliding)
        let firstLive = 0;
        while (firstLive < this.#log.length && this.#log[firstLive] <= cutoff) {
            firstLive++;
        }
        if (firstLive > 0) {
            this.#log.splice(0, firstLive);
        }


        const resetAfterMs = this.#log.length === 0 ? 0 : this.#log[0] + this.#windowMs - now;

        if (this.#log.length < this.#limit) {
            this.#log.push(now);
            return {
                allowed: true,
                limit: this.#limit,
                remaining: this.#limit - this.#log.length,
                resetAfterMs: this.#log[0] + this.#windowMs - now,
            };
        }

        return {
            allowed: false,
            limit: this.#limit,
            remaining: 0,
            resetAfterMs,
            retryAfterMs: resetAfterMs 
        };
        
    }

    get size() {
        return this.#log.length;
    }
}