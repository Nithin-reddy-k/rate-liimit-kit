

// A clock that can be advanced by hand, No need to wait so that test can simulate time of hours/min in short span.

export class ManualClock {
   
    #time = 0;

    now() {
        return this.#time;
    }

    advance(ms) {
        if (ms < 0) throw new RangeError("time cannot advance backwards.");
        this.#time += ms;
    }

};