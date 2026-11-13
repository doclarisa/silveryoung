/** Never leave a button stuck: give up after `ms` with an Error("timeout"). */
export function withTimeout<T>(promise: PromiseLike<T>, ms = 20000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}
