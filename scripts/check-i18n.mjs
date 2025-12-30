#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

const messagesDir = path.join(process.cwd(), 'messages')
const baseFile = 'zh.json'

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
}

/**
 * 根据完整性百分比返回对应的颜色
 */
function getCompletenessColor(completeness) {
  if (completeness === 100) {
    return colors.green
  }

  if (completeness >= 90) {
    return colors.yellow
  }

  return colors.red
}

/**
 * 获取值的类型
 */
function getValueType(value) {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  return typeof value
}

/**
 * 递归获取对象的所有键路径和类型信息
 * 返回格式: Map<keyPath, { type: string, value: any }>
 */
function getAllKeysWithType(obj, prefix = '') {
  const keyMap = new Map()

  function traverse(currentObj, currentPrefix) {
    for (const key in currentObj) {
      if (!Object.prototype.hasOwnProperty.call(currentObj, key)) {
        continue
      }

      const fullPath = currentPrefix ? `${currentPrefix}.${key}` : key
      const value = currentObj[key]
      const type = getValueType(value)

      keyMap.set(fullPath, { type, value })

      // 递归处理对象类型（排除 null 和数组）
      if (type === 'object') {
        traverse(value, fullPath)
      }
    }
  }

  traverse(obj, prefix)

  return keyMap
}

/**
 * 检查两个键映射之间的类型不匹配
 */
function getTypeMismatches(baseKeys, targetKeys) {
  const mismatches = []

  for (const [keyPath, baseInfo] of baseKeys.entries()) {
    const targetInfo = targetKeys.get(keyPath)

    if (targetInfo && baseInfo.type !== targetInfo.type) {
      mismatches.push({
        key: keyPath,
        baseType: baseInfo.type,
        targetType: targetInfo.type,
      })
    }
  }

  return mismatches
}

/**
 * 将缺失键按层级分组显示
 */
function displayMissingKeysHierarchy(missingKeys) {
  const tree = {}

  // 构建树状结构
  for (const key of missingKeys) {
    const parts = key.split('.')
    let current = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1

      if (!current[part]) {
        current[part] = isLast ? null : {}
      }
      else if (isLast && current[part] !== null) {
        // 如果已存在但不是叶子节点，标记为冲突
        current[part] = null
      }

      if (!isLast && current[part] !== null) {
        current = current[part]
      }
    }
  }

  // 递归打印树状结构
  function printTree(node, prefix = '') {
    const keys = Object.keys(node)

    keys.forEach((key, index) => {
      const isLastChild = index === keys.length - 1
      const connector = isLastChild ? '└─' : '├─'
      const childPrefix = isLastChild ? '  ' : '│ '
      const value = node[key]

      console.log(`${prefix}${connector}${key}`)

      if (value !== null && typeof value === 'object') {
        const nextPrefix = prefix + childPrefix
        printTree(value, nextPrefix)
      }
    })
  }

  printTree(tree)
}

/**
 * 读取并解析 JSON 文件
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    return JSON.parse(content)
  }
  catch (error) {
    console.error(`读取文件失败: ${filePath}`)
    console.error(error.message)

    return null
  }
}

/**
 * 获取 messages 目录下的所有语言文件
 */
function getLanguageFiles() {
  try {
    return fs.readdirSync(messagesDir)
      .filter((file) => file.endsWith('.json') && file !== baseFile)
  }
  catch (error) {
    console.error('读取 messages 目录失败')
    console.error(error.message)
    process.exit(1)
  }
}

/**
 * 格式化文件名用于显示
 */
function formatFileName(fileName) {
  return fileName.replace('.json', '').toUpperCase()
}

/**
 * 主函数
 */
function main() {
  const baseFilePath = path.join(messagesDir, baseFile)
  const baseData = readJsonFile(baseFilePath)

  if (!baseData) {
    console.error(`无法读取基准文件: ${baseFile}`)
    process.exit(1)
  }

  const baseKeyMap = getAllKeysWithType(baseData)
  const baseKeys = Array.from(baseKeyMap.keys())

  if (baseKeys.length === 0) {
    console.error('基准文件为空或格式错误')
    process.exit(1)
  }

  const langFiles = getLanguageFiles()

  if (langFiles.length === 0) {
    console.log('未找到其他语言文件')
    process.exit(0)
  }

  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  国际化文件完整性检查报告${colors.reset}`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
  console.log(`${colors.bright}基准文件:${colors.reset} ${colors.green}${baseFile}${colors.reset}`)
  console.log(`${colors.bright}总键数:${colors.reset} ${colors.yellow}${baseKeys.length}${colors.reset}\n`)

  let hasIssues = false

  for (const langFile of langFiles) {
    const langFilePath = path.join(messagesDir, langFile)
    const langData = readJsonFile(langFilePath)

    if (!langData) {
      continue
    }

    const langKeyMap = getAllKeysWithType(langData)
    const langKeys = Array.from(langKeyMap.keys())

    // 检查缺失的键
    const missingKeys = baseKeys.filter((key) => !langKeys.includes(key))

    // 检查类型不匹配
    const typeMismatches = getTypeMismatches(baseKeyMap, langKeyMap)

    const presentKeys = baseKeys.length - missingKeys.length
    const completeness = parseFloat(((presentKeys / baseKeys.length) * 100).toFixed(2))

    const hasMissingKeys = missingKeys.length > 0
    const hasTypeMismatches = typeMismatches.length > 0
    const fileHasIssues = hasMissingKeys || hasTypeMismatches

    if (fileHasIssues) {
      hasIssues = true
    }

    const statusIcon = !fileHasIssues ? '✓' : '✗'
    const statusColor = !fileHasIssues ? colors.green : colors.red
    const langDisplayName = formatFileName(langFile)

    // 打印文件状态
    console.log(`${statusColor}${statusIcon} ${colors.bright}${langDisplayName}${colors.reset} (${langFile})`)
    console.log(`  ${colors.bright}完整性:${colors.reset} ${getCompletenessColor(completeness)}${completeness}%${colors.reset}`)

    // 显示缺失键信息
    if (hasMissingKeys) {
      console.log(`  ${colors.bright}缺失键数:${colors.reset} ${colors.red}${missingKeys.length}${colors.reset}`)
      console.log(`  ${colors.gray}缺失的键:${colors.reset}`)

      const maxDisplay = 20

      if (missingKeys.length <= maxDisplay) {
        console.log('')
        displayMissingKeysHierarchy(missingKeys)
      }
      else {
        const keysToShow = missingKeys.slice(0, maxDisplay)
        console.log('')
        displayMissingKeysHierarchy(keysToShow)
        console.log(`\n    ${colors.gray}... 还有 ${missingKeys.length - maxDisplay} 个缺失键${colors.reset}`)
      }
    }

    // 显示类型不匹配信息
    if (hasTypeMismatches) {
      console.log(`  ${colors.bright}类型不匹配:${colors.reset} ${colors.magenta}${typeMismatches.length}${colors.reset}`)
      console.log(`  ${colors.gray}不匹配的键:${colors.reset}`)

      const maxDisplay = 10
      const mismatchesToShow = typeMismatches.slice(0, maxDisplay)

      mismatchesToShow.forEach(({ key, baseType, targetType }) => {
        console.log(`    ${colors.magenta}✦${colors.reset} ${colors.gray}${key}${colors.reset}`)
        console.log(`      ${colors.gray}预期: ${colors.cyan}${baseType}${colors.reset}, ${colors.gray}实际: ${colors.red}${targetType}${colors.reset}`)
      })

      if (typeMismatches.length > maxDisplay) {
        console.log(`    ${colors.gray}... 还有 ${typeMismatches.length - maxDisplay} 个类型不匹配${colors.reset}`)
      }
    }

    // 显示额外的键（存在于目标文件但不在基准文件中）
    const extraKeys = langKeys.filter((key) => !baseKeys.includes(key))

    if (extraKeys.length > 0) {
      console.log(`  ${colors.bright}额外键数:${colors.reset} ${colors.cyan}${extraKeys.length}${colors.reset}`)
      console.log(`  ${colors.gray}额外键（未在基准文件中定义）:${colors.reset}`)

      const maxDisplay = 5
      const keysToShow = extraKeys.slice(0, maxDisplay)

      keysToShow.forEach((key) => {
        console.log(`    ${colors.cyan}+${colors.reset} ${colors.gray}${key}${colors.reset}`)
      })

      if (extraKeys.length > maxDisplay) {
        console.log(`    ${colors.gray}... 还有 ${extraKeys.length - maxDisplay} 个额外键${colors.reset}`)
      }
    }

    console.log('')
  }

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)

  if (hasIssues) {
    console.log(`${colors.red}发现翻译问题，请修复后重试${colors.reset}\n`)
    process.exit(1)
  }
  else {
    console.log(`${colors.green}所有翻译文件完整无误！${colors.reset}\n`)
  }
}

main()
