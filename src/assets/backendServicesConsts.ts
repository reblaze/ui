const transportProtocols = [
  {
    name: 'Per Request',
    value: 'default',
  },
  {
    name: 'HTTP Always',
    value: 'http',
  },
  {
    name: 'HTTPS Always',
    value: 'https',
  },
  {
    name: 'Port Bridge Mode',
    value: 'port_bridge',
  },
]

const stickinessModels = [
  {
    name: 'None',
    value: 'none',
  },
  {
    name: 'Auto Cookie',
    value: 'autocookie',
  },
  {
    name: 'Custom Cookie',
    value: 'customcookie',
  },
  {
    name: 'IP Hash',
    value: 'iphash',
  },
  {
    name: 'Least Connection',
    value: 'least_conn',
  },
]

export default {
  name: 'backendServicesConsts',
  transportProtocols,
  stickinessModels,
}
