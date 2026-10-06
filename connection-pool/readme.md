1. pbkdf2Sync() blocked the event loop because it runs synchronously.

2. The async pbkdf2() runs used the libuv thread pool.
   Completion happened in waves, showing thread-pool work.

3. Increasing UV_THREADPOOL_SIZE to 8 improved this test,
   but increasing the pool does not always improve performance
   because of CPU contention and overhead.

4. For a login endpoint, use asynchronous pbkdf2()
   instead of pbkdf2Sync() so the event loop remains responsive.