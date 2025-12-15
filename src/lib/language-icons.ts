/**
 * 语言名称到 Simple Icons slug 的映射表
 * 映射基于 GitHub 语言名称和 Simple Icons 的标准 slug
 */
const LANGUAGE_SLUG_MAP: Record<string, string> = {
  // 主流编程语言
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  C: 'c',
  'C++': 'cplusplus',
  'C#': 'csharp',
  Go: 'go',
  Rust: 'rust',
  Ruby: 'ruby',
  PHP: 'php',
  Swift: 'swift',
  Kotlin: 'kotlin',
  Dart: 'dart',
  Scala: 'scala',
  R: 'r',
  Perl: 'perl',
  Lua: 'lua',
  Haskell: 'haskell',
  Elixir: 'elixir',
  Erlang: 'erlang',
  Clojure: 'clojure',
  Julia: 'julia',
  'Objective-C': 'objectivec',

  // Web 技术
  HTML: 'html5',
  CSS: 'css',
  SCSS: 'sass',
  Sass: 'sass',
  Less: 'less',
  Stylus: 'stylus',
  Vue: 'vuedotjs',
  Svelte: 'svelte',

  // Shell 脚本
  Shell: 'gnubash',
  Bash: 'gnubash',
  PowerShell: 'powershell',
  Batchfile: 'windowsterminal',

  // 标记语言
  Markdown: 'markdown',
  XML: 'xml',
  YAML: 'yaml',
  JSON: 'json',
  TOML: 'toml',

  // 其他语言
  Solidity: 'solidity',
  Zig: 'zig',
  Nim: 'nim',
  Crystal: 'crystal',
  V: 'v',
  Assembly: 'assemblyscript',
  WebAssembly: 'webassembly',
  GLSL: 'opengl',
  HLSL: 'unity',

  // 数据库相关
  SQL: 'mysql',
  PLpgSQL: 'postgresql',
  TSQL: 'microsoftsqlserver',

  // 框架特定语言
  'Jupyter Notebook': 'jupyter',
  'Vim Script': 'vim',
  'Emacs Lisp': 'gnuemacs',

  // .NET 相关
  'F#': 'fsharp',
  'Visual Basic .NET': 'dotnet',
  VBA: 'microsoftexcel',

  // JVM 语言
  Groovy: 'apachegroovy',

  // 其他
  Dockerfile: 'docker',
  Makefile: 'cmake',
  CMake: 'cmake',
}

/**
 * 获取编程语言对应的 Simple Icons slug
 * @param language - GitHub 语言名称
 * @returns Simple Icons slug，如果未找到则返回 undefined
 */
export function getLanguageSlug(language: string): string | undefined {
  // 直接查找映射表
  if (LANGUAGE_SLUG_MAP[language]) {
    return LANGUAGE_SLUG_MAP[language]
  }

  // 尝试不区分大小写的匹配
  const lowerLanguage = language.toLowerCase()
  const matchedKey = Object.keys(LANGUAGE_SLUG_MAP).find(
    (key) => key.toLowerCase() === lowerLanguage,
  )

  if (matchedKey) {
    return LANGUAGE_SLUG_MAP[matchedKey]
  }

  // 尝试将语言名称转换为小写作为 slug（一般情况）
  const simplifiedSlug = language.toLowerCase().replace(/[^a-z0-9]/g, '')

  return simplifiedSlug || undefined
}

/**
 * 获取语言名称的首字母（用于回退显示）
 * @param language - 语言名称
 * @returns 大写的首字母
 */
export function getLanguageInitial(language: string): string {
  if (!language || language.length === 0) {
    return '?'
  }

  // 对于特殊情况，返回更有意义的缩写
  const specialCases: Record<string, string> = {
    'C++': 'C+',
    'C#': 'C#',
    'F#': 'F#',
    'Objective-C': 'OC',
    'Visual Basic .NET': 'VB',
  }

  if (specialCases[language]) {
    return specialCases[language]
  }

  // 默认返回首字母大写
  return language.charAt(0).toUpperCase()
}

/**
 * 生成 Simple Icons CDN URL
 * @param slug - Simple Icons slug
 * @returns CDN URL
 */
export function getLanguageIconUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}`
}
