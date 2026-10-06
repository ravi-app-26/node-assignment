import { pbkdf2Sync } from "node:crypto";
const start = performance.now();

for (let i = 0; i < 8; i++) {
  pbkdf2Sync(
    "secret",
    "salt",
    300_000,
    64,
    "sha512"
  );

  console.log(
    `job ${i} at ${(performance.now() - start) | 0} ms`
  );
}