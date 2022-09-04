export const RESPONSE_ACTIONS = {
  'default': {'title': '503 Service Unavailable'},
  'challenge': {'title': 'Challenge'},
  'monitor': {'title': 'Tag Only'},
  'response': {'title': 'Response', 'params': {'status': '', 'content': ''}},
  'redirect': {'title': 'Redirect', 'params': {'status': '30[12378]', 'location': 'https?://.+'}},
  'ban': {'title': 'Ban', 'params': {'duration': '[0-9]+', 'action': {'type': 'default', 'params': {}}}},
  'request_header': {'title': 'Header', 'params': {'headers': ''}},
}
