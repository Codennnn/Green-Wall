---
type: "agent_requested"
---

# TypeScript 项目整体开发指南

## 代码编写要求

- 启用 TypeScript 严格模式（strict），显式声明类型，避免隐式 `any`。
- 禁止使用 `any`，如必须，请使用 `unknown` 并通过类型守卫缩小范围。
- 对象类型定义优先使用 `interface`，仅在需要联合或复杂类型时使用 `type`。
- 命名规范：
  - **PascalCase**：类型、接口、枚举
  - **camelCase**：变量、函数
  - **UPPER_CASE**：常量
- 优先使用具名导出（named export），避免默认导出（default export）。
- 函数保持单一职责，简洁明了，不做过度抽象。
- 异步逻辑统一使用 `async/await`，避免 Promise 链式调用。
- 禁止滥用非空断言（`!`），仅在绝对安全时使用。
- 使用 `readonly` 声明不可变属性，提升类型安全。
- 导入路径使用 tsconfig 的路径别名，避免层层相对路径。
- 类型与实现分离：业务逻辑与类型定义应分文件存放。
- 错误处理必须类型安全，不允许抛出字符串，推荐自定义错误类。
- 使用枚举（`enum`）或字面量联合类型，避免「魔法字符串」。
