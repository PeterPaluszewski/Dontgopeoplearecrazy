export function getHeadingDegreesFromVector(x: number, z: number): number {
  const heading = (Math.atan2(x, z) * 180) / Math.PI;
  return (heading + 360) % 360;
}

export function getCompassLabel(headingDegrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const index = Math.round(headingDegrees / 45);
  return directions[index];
}