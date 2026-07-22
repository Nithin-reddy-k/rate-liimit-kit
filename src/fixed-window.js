import { systemClock } from "./clock.js";



// shape of the data returned.
// {
//   allowed: true,        // was this request admitted?
//   limit: 100,           // the configured ceiling(max no of requests) (for headers)
//   remaining: 42,        // how many more can be admitted right now
//   resetAfterMs: 1250,   // ms until the limiter's state fully relaxes
//   retryAfterMs: 800,    // only when a req denied: ms until a retry could succeed
// }



export class FixedWindowLimiter {
    #limit;
    #windowMs;
    #clock;
    #windowStart = -1;
    #count = 0;

    constructor({ limit, windowMs, clock = systemClock }) {
        if(!Number.isInteger(limit) || limit <= 0) {
            throw new RangeError("limit must be a positive integer");
        }
        if(windowMs < 0) {
            throw new RangeError("windowMs must be greater than 0");
        }
        this.#limit = limit;
        this.#windowMs = windowMs;
        this.#clock = clock;
    }


    check() {
        const now = this.#clock.now();
        const windowStart = Math.floor(now / this.#windowMs) * this.#windowMs;

        if(windowStart !== this.#windowStart) {
            this.#windowStart = windowStart;
            this.#count = 0;
        }

        const resetAfterMs = this.#windowStart + this.#windowMs - now;

        if(this.#count < this.#limit) {
            this.#count += 1;
            return {
                allowed: true,
                limit: this.#limit,
                remaining: this.#limit - this.#count,
                resetAfterMs,
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
}