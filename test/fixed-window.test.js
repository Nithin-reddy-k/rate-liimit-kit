import test from "node:test";
import assert from "node:assert/strict";

import { FixedWindowLimiter } from "../src/fixed-window.js";
import { ManualClock } from "../src/testing.js";


test("admits upto the limit and then denies", () => {
    const clock = new ManualClock();
    const rl = new FixedWindowLimiter({ limit: 3, windowMs: 1000, clock});

    assert.equal(rl.check().allowed, true);
    assert.equal(rl.check().allowed, true);
    const third = rl.check();
    assert.equal(third.allowed, true);
    assert.equal(third.remaining, 0);

    const denied = rl.check();
    assert.equal(denied.allowed, false);
    assert.equal(denied.retryAfterMs, 1000);
});

test("window resets after windowMs", () => {
    const clock = new ManualClock();
    const rl = new FixedWindowLimiter({ limit: 1, windowMs: 1000, clock});

    assert.equal(rl.check().allowed, true);
    assert.equal(rl.check().allowed, false);
    clock.advance(1000);
    assert.equal(rl.check().allowed, true);
});


test("Documented Flaw: Boundary burst admits 2x the limit in a span of 2ms at the boundary", () => {
    const clock = new ManualClock();
    const rl = new FixedWindowLimiter({ limit: 100, windowMs: 60_000, clock });

    clock.advance(59_999);
    for(let i = 0; i < 100; i++) {
        assert.equal(rl.check().allowed, true);
    }

    clock.advance(2);
    for(let i = 0; i< 100; i++) {
        assert.equal(rl.check().allowed, true);
    }
});