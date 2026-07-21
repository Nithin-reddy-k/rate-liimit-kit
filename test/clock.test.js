import test from "node:test";
import assert from "node:assert/strict";

import { systemClock } from "../src/clock.js";
import { ManualClock } from "../src/testing.js";

test("systemClock is monotonic", () => {
    const a = systemClock.now();
    const b = systemClock.now();

    assert.ok(b >= a);
});

test("ManualClock ony moves when told eplicitly", () => {
    const clock = new ManualClock();
    assert.equal(clock.now(), 0);

    clock.advance(1500);
    assert.equal(clock.now(), 1500);

    assert.throws(() => clock.advance(-1), RangeError);
})