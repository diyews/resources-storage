function runUntil(fn, delay = 300) {
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

function runUntilEnhanced(fn, delay = 300, options = {}) {
  const {
    timeout = 0,
    maxAttempts = 0,
    onProgress = null
  } = options;

  return new Promise((resolve, reject) => {
    let attempts = 0;
    let isResolved = false;

    const intervalId = setInterval(async () => {
      if (isResolved) return;

      attempts++;

      // Check max attempts
      if (maxAttempts > 0 && attempts > maxAttempts) {
        clearInterval(intervalId);
        reject(new Error(`Max attempts (${maxAttempts}) exceeded`));
        return;
      }

      try {
        const result = await fn();
        
        // Call progress callback
        if (onProgress) {
          onProgress(attempts, result);
        }

        if (result === true) {
          isResolved = true;
          clearInterval(intervalId);
          resolve({
            attempts,
            totalTime: attempts * delay
          });
        }
      } catch (error) {
        console.error('Error in runUntilTrue:', error);
        // Continue trying despite errors
      }
    }, delay);

    // Set timeout if specified
    if (timeout > 0) {
      setTimeout(() => {
        if (!isResolved) {
          clearInterval(intervalId);
          reject(new Error(`Timeout after ${timeout}ms`));
        }
      }, timeout);
    }
  });
}
