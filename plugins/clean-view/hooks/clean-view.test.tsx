import { expect, test } from 'claude-code/testing'

const EDIT = {
  component: 'ToolResult',
  props: {
    tool_use_id: 't1',
    tool: 'Edit',
    isErrored: false,
    output: {
      filePath: '/x.ts', oldString: 'a', newString: 'b', originalFile: 'a',
      structuredPatch: [{ oldStart: 1, oldLines: 1, newStart: 1, newLines: 1, lines: ['-a', '+b'] }],
      userModified: false, replaceAll: false,
    },
  },
} as const

test('Edit diff collapses to one line, /clean brings it back', async ($, on) => {
  // stands in for the engine's own drawing
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const on = await $.ui.mount({ plugin: 'clean-view', surface, ...EDIT })
    expect(await on.find({ type: 'Text', text: /\+1 −1/ })).toBeDefined()
    await on.unmount()
  }
  await $.command.run({
    command: 'clean',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })
  const off = await $.ui.mount({ plugin: 'clean-view', surface: 'terminal', ...EDIT })
  expect(await off.find({ type: 'Text', text: /\+1 −1/ })).toBeUndefined()
  expect(await off.find({ type: 'Text', text: 'engine' })).toBeDefined()
  await off.unmount()
})
