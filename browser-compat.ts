// Safari 15.6, the last Safari generation on Catalina, lacks AbortSignal.timeout.
if (!AbortSignal.timeout) {
  AbortSignal.timeout = (milliseconds: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), milliseconds);
    return controller.signal;
  };
}
