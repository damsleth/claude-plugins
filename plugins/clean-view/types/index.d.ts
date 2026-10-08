export type IsOn = boolean

declare module 'claude-code' {
  interface PluginState {
    'clean-view': { isOn: IsOn }
  }
}
