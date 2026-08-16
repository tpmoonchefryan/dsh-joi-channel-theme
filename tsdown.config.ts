/**
 * 两个构建面，一次 tsdown：
 *   · 宿主半边 lib/index.js —— 普通 ESM，Loader 直接 import。
 *   · 浏览器半边 lib/client.js —— 闭包工厂产物，由 window.__ModuleLoader__ 装载。
 *
 * 客户端产物的形状不是自由发挥：dsh 的模块表用注入的 require 解析外部依赖，
 * 所以 bundle 必须是 CJS 主体外包一层 `__ModuleLoader__.load({id, factory})`。
 * banner/intro/footer 三段就是这层壳，与 harness 自带 packages/client/tsdown.client.ts
 * 的产物逐字节同形（对照 ui-goal 的 lib/client.js 实测）。
 *
 * 外部化名单只能是模块表里真有的那些。表里没有的 require 一定在运行时抛错，
 * 所以规则是「表内外部化，其余全部内联」——本包除 react 外无运行时依赖，
 * 跨插件协作一律走 cordis 服务（ctx.theme / ctx.slots / ctx.settingsScope）。
 */
import type { UserConfig } from 'tsdown'

/** dsh 浏览器模块表里的平台模块，与 packages/client/web/src/platform.ts 对齐。 */
const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
  // 文档化的临时豁免：快照 store 引擎（defineStore 等）暂居 runtime，
  // 尚未升格为平台模块，但 runtime 是 immediately 层行，其工厂在任何依赖
  // bundle 物化之前就已注册，模块表答得上这个 require。
  '@deepseek-ai/dsh-client-runtime/client',
]

const ID = 'dsh-joi-channel-theme'

const host: UserConfig = {
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: 'esm',
  platform: 'neutral',
  dts: false,
  clean: false,
  outputOptions: { entryFileNames: 'index.js' },
}

const client: UserConfig = {
  entry: ['src/client/index.tsx'],
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  external: [...PLATFORM_MODULES],
  // 表内的交给 external，其余一律内联：模块表答不上来的 require 是必然的运行时抛错。
  noExternal: (id: string) => (PLATFORM_MODULES.includes(id) ? undefined : true),
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    footer: 'return module.exports; } });',
  },
}

export default [host, client]
