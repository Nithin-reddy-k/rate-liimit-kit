import test from "node:test";
import assert from "node:assert/strict";

import { SlidingWindowLogLimiter } from "../src/sliding-log.js";
import { ManualClock } from "../src/testing.js";


test("no boundary burst here: window slides", () => {
    const clock = new ManualClock();
    const rl = new SlidingWindowLogLimiter({ limit: 100, windowMs: 60_000, clock });

    clock.advance(59_999);
    for (let i=0; i < 100; i++) {
        assert.equal(rl.check().allowed, true);
    }

    clock.advance(2);
    assert.equal(rl.check().allowed, false);
});


test("capacity(to acceopt) returns exactly as entries age out", () => {
    const clock = new ManualClock();
    const rl = new SlidingWindowLogLimiter({ limit: 2, windowMs: 1000, clock });

    rl.check();
    clock.advance(400);
    rl.check();
    assert.equal(rl.check().allowed, false);

    clock.advance(600);
    assert.equal(rl.check().allowed, true);
    assert.equal(rl.size, 2);

});


test("retryAfterMs predics exactly when a retry will again succeed", () => {
    const clock = new ManualClock();
    const rl = new SlidingWindowLogLimiter({ limit: 1, windowMs: 1000, clock });
    rl.check();
    const denied = rl.check();
    assert.equal(denied.allowed, false);

    clock.advance(denied.retryAfterMs - 1);
    assert.equal(rl.check().allowed, false);
    clock.advance(1);
    assert.equal(rl.check().allowed, true);
    
});