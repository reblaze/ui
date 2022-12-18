export const httpRequestMethods = [
  'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'TRACE', 'OPTIONS', 'PATCH',
] as const

export const TRAFFIC_COLORS = {
  'hits': '#7a7a7a', // $color-boulder
  'passed': '#278a5b', // $color-eucalyptus
  'reported': '#c1a004', // $color-buddha-gold
  'blocked': '#dc143c', // $color-crimson
  'humans': '#4169e1', // $color-royal-blue
  'bots': '#843179', // $color-plum
}

export const STATUS_COLORS = {
  '1': '#02a4d3', // $color-cerulean
  '2': '#50c878', // $color-emerald
  '3': '#ffdb58', // $color-mustard
  '4': '#f34723', // $color-pomegranate
  '5': '#ff355e', // $color-radical-red
}
