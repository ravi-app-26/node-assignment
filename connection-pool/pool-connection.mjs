import { pbkdf2 } from "node:crypto";
import { monitorEventLoopDelay } from "node:perf_hooks";

const h = monitorEventLoopDelay({
  resolution: 10
});

h.enable();

const start = performance.now();
let ticks = 0;

const beat = setInterval(() => {
  ticks++;
}, 10);

let done = 0;
for (let i = 0; i < 8; i++) {
  pbkdf2(
    "secret",
    "salt",
    300_000,
    64,
    "sha512",
    () => {
      console.log(
        `job ${i} at ${(performance.now() - start) | 0} ms`
      );
       if (++done === 8) {
    clearInterval(beat);
    console.log("beats", ticks);
console.log(
  "p99 delay ms",
  h.percentile(99) / 1e6
);
  }
    }
  );
}