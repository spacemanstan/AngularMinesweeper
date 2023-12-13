/**
 * Maps a value from one range to another range.
 * 
 * Recreation of this https://processing.org/reference/map_.html
 * 
 * @param value The value to be mapped.
 * @param currentRangeStart The lower bound of the current range.
 * @param currentRangeStop The upper bound of the current range.
 * @param targetRangeStart The lower bound of the target range.
 * @param targetRangeStop The upper bound of the target range.
 * @returns The mapped value in the target range.
 */
export function map(
    value: number,
    currentRangeStart: number,
    currentRangeStop: number,
    targetRangeStart: number,
    targetRangeStop: number
  ): number {
    // Map the value from the current range to the target range
    return (
      targetRangeStart + // Start of the target range
      (targetRangeStop - targetRangeStart) * ((value - currentRangeStart) / (currentRangeStop - currentRangeStart))
      // Calculate the mapped value based on both ranges
    );
  }
  