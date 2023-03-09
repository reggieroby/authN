import applicationConfig from '../config'

export function isEmailWhitelisted(email) {
  const { registrationWhitelist } = applicationConfig.get()
  return registrationWhitelist.length === 0 ||
    registrationWhitelist.includes(email.toLowerCase())
}