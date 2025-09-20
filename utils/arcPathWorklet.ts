export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  "worklet";
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  innerRadius = 0
) {
  "worklet";
  if (Math.abs(endAngle - startAngle) < 1e-6) return "";

  const outerStart = polarToCartesian(cx, cy, radius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

  if (innerRadius > 0) {
    return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  return `M ${outerStart.x} ${outerStart.y} 
    A ${radius} ${radius} 
    0 ${largeArc} 
    1 ${outerEnd.x} ${outerEnd.y} 
    L ${innerEnd.x} ${innerEnd.y} 
    A ${innerRadius} ${innerRadius} 
    0 ${largeArc} 
    0 ${innerStart.x} ${innerStart.y} Z`;
}
