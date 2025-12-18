/** 私有网段 IP 正则 */
const PRIVATE_IP_PATTERNS = [
  // IPv4 私有地址
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // localhost
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^0\.0\.0\.0$/,
  // 链路本地地址
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
]

/** 危险主机名 */
const DANGEROUS_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  '*.local',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP metadata
]

export interface SafeUrlValidationResult {
  valid: boolean
  message?: string
}

/**
 * 检查主机名是否为私有 IP
 */
function isPrivateIp(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname))
}

/**
 * 检查主机名是否为危险主机
 */
function isDangerousHostname(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase()

  return DANGEROUS_HOSTNAMES.some((pattern) => {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1) // .local

      return lowerHostname.endsWith(suffix)
    }

    return lowerHostname === pattern
  })
}

/**
 * 验证 Base URL 是否安全
 * @param baseUrl - 要验证的 URL
 * @returns 验证结果
 */
export function validateSafeUrl(baseUrl: string): SafeUrlValidationResult {
  // 空值检查
  if (!baseUrl || typeof baseUrl !== 'string') {
    return { valid: false, message: 'Base URL is required' }
  }

  const trimmedUrl = baseUrl.trim()

  // URL 解析
  let url: URL

  try {
    url = new URL(trimmedUrl)
  }
  catch {
    return { valid: false, message: 'Invalid URL format' }
  }

  // 只允许 HTTPS（生产环境安全要求）
  if (url.protocol !== 'https:') {
    return { valid: false, message: 'Only HTTPS URLs are allowed' }
  }

  // 检查是否为危险主机名
  if (isDangerousHostname(url.hostname)) {
    return { valid: false, message: 'This hostname is not allowed' }
  }

  // 检查是否为私有 IP
  if (isPrivateIp(url.hostname)) {
    return { valid: false, message: 'Private IP addresses are not allowed' }
  }

  // 检查是否为纯 IP 地址（可选的严格模式）
  const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/

  if (ipv4Regex.test(url.hostname)) {
    return { valid: false, message: 'IP addresses are not allowed, please use a domain name' }
  }

  return { valid: true }
}

/**
 * 快速检查 URL 是否安全（返回布尔值）
 */
export function isSafeUrl(baseUrl: string): boolean {
  return validateSafeUrl(baseUrl).valid
}
