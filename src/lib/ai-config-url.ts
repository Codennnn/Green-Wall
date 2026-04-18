import { type SafeUrlValidationCode, validateSafeUrl } from './security/safe-url'

export type AiConfigUrlErrorKey
  = | 'invalidUrlFormat'
    | 'httpsUrlRequired'
    | 'urlHostNotAllowed'
    | 'urlPrivateAddressNotAllowed'

export type AiConfigUrlValidationResult
  = | { valid: true, domain: string }
    | { valid: false, errorKey: AiConfigUrlErrorKey }

export function extractDomain(baseUrl: string): string | null {
  try {
    const hostname = new URL(baseUrl).hostname

    return hostname || null
  }
  catch {
    return null
  }
}

function getUrlErrorKey(code?: SafeUrlValidationCode): AiConfigUrlErrorKey {
  switch (code) {
    case 'https_required':
      return 'httpsUrlRequired'

    case 'hostname_not_allowed':
      return 'urlHostNotAllowed'

    case 'private_ip_not_allowed':
      return 'urlPrivateAddressNotAllowed'

    case 'ip_not_allowed':
      return 'urlPrivateAddressNotAllowed'

    case 'required':
      return 'invalidUrlFormat'

    case 'invalid_format':
      return 'invalidUrlFormat'

    default:
      return 'invalidUrlFormat'
  }
}

export function validateAiConfigBaseUrl(baseUrl: string): AiConfigUrlValidationResult {
  const domain = extractDomain(baseUrl)

  if (!domain) {
    return { valid: false, errorKey: 'invalidUrlFormat' }
  }

  const validation = validateSafeUrl(baseUrl)

  if (!validation.valid) {
    return { valid: false, errorKey: getUrlErrorKey(validation.code) }
  }

  return { valid: true, domain }
}
