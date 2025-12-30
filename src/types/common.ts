/** 页面组件的属性类型，用于 Next.js 页面组件 */
export interface PageProps<T> {
  /** 页面参数，包含路由参数等信息 */
  params: Promise<T>
}
