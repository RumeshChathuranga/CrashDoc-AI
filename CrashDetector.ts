
export class CrashDetector {
  private threshold: number = 20; // m/s^2 delta
  private lastAcceleration: { x: number; y: number; z: number } | null = null;
  private onCrash: () => void;
  private isListening: boolean = false;

  constructor(onCrash: () => void) {
    this.onCrash = onCrash;
  }

  public async start() {
    if (this.isListening) return;

    // Handle iOS 13+ permission requirement
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          window.addEventListener('devicemotion', this.handleMotion);
          this.isListening = true;
        }
      } catch (e) {
        console.error("Permission denied or error:", e);
      }
    } else {
      // Non-iOS devices or older versions
      window.addEventListener('devicemotion', this.handleMotion);
      this.isListening = true;
    }
  }

  public stop() {
    window.removeEventListener('devicemotion', this.handleMotion);
    this.isListening = false;
    this.lastAcceleration = null;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

    if (x === null || y === null || z === null) return;

    // Calculate magnitude of the acceleration vector
    const currentMagnitude = Math.sqrt(x * x + y * y + z * z);

    if (this.lastAcceleration) {
      const lastMagnitude = Math.sqrt(
        this.lastAcceleration.x ** 2 + 
        this.lastAcceleration.y ** 2 + 
        this.lastAcceleration.z ** 2
      );

      // Check for sudden change in force (impact)
      const delta = Math.abs(currentMagnitude - lastMagnitude);

      if (delta > this.threshold) {
        this.onCrash();
      }
    }

    this.lastAcceleration = { x, y, z };
  };

  // For testing purposes (Judges)
  public simulateCrash() {
    this.onCrash();
  }
}
