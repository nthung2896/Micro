class Utils {
  /**
   * Get Breakpoint
   * @param {Object} screens - Grid.useBreakpoint() from antd
   * @return {Array} array of breakpoint size
   */
  static getBreakPoint(screens?: { [key: string]: boolean }): string[] {
    const breakpoints: string[] = [];
    if (screens) {
      for (const key in screens) {
        if (screens.hasOwnProperty(key) && screens[key]) {
          breakpoints.push(key);
        }
      }
    }
    return breakpoints;
  }

  static rgba(hex: string, opacity = 1) {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      throw new Error("Invalid Hex");
    }

    const decimal = parseInt(hex.substring(1), 16);

    const r = (decimal >> 16) & 255;
    const g = (decimal >> 8) & 255;
    const b = decimal & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

export default Utils;
