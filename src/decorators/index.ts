export function measure(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await method.apply(this, args);
    const end = performance.now();
    
    console.log(`${propertyName} executou em ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

export function retry(attempts: number = 3) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let i = 0; i < attempts; i++) {
        try {
          return await method.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (i < attempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      
      throw lastError!;
    };
  };
}