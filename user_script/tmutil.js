function runUntilTrue(fn, delay = 300) {
  return new Promise((resolve) => {
    const intervalId = setInterval(async () => {
      try {
        const result = await fn();
        if (result === true) {
          clearInterval(intervalId);
          resolve();
        }
      } catch (error) {
        console.error('Error in runUntilTrue:', error);
        // Continue execution despite errors
      }
    }, delay);
  });
}
