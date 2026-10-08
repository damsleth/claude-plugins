import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { IsOn } from '../types'

const isOn = atom({ plugin: 'clean-view', key: 'isOn' } as const, true as IsOn)

type Patch = { lines: string[] }[]

export const churn = (patch: Patch = []) => {
  let added = 0
  let removed = 0
  for (const hunk of patch) {
    for (const line of hunk.lines) {
      if (line[0] === '+') added++
      else if (line[0] === '-') removed++
    }
  }
  return `+${added} −${removed}`
}

// ponytail: Edit/Write/Bash get a summary, every other tool's result is hidden; add cases as they annoy you.
export const summary = (tool: string, output: any): string => {
  if (tool === 'Edit') return churn(output?.structuredPatch)
  if (tool === 'Write')
    return output?.type === 'create'
      ? `new, ${String(output.content ?? '').split('\n').length} lines`
      : churn(output?.structuredPatch)
  if (tool === 'Bash') return '✓'
  return ''
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'clean',
      description: 'Toggle clean view (hide diffs and tool output)',
    })
    return next(e)
  })

  on('command.run', { command: 'clean' }, async $ => {
    const now = await update($, isOn, was => !was)
    return { text: now ? 'Clean view on.' : 'Clean view off: diffs and output shown.' }
  })

  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (!(await read($, isOn))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    if (e.props.isErrored) {
      if (typeof e.props.output !== 'string') return next(e)
      const first = e.props.output.trim().split('\n')[0]
      return <Text color="red">  ⎿ {first} (/clean to expand)</Text>
    }
    const text = summary(e.props.tool, e.props.output)
    return text ? <Text dimColor>  ⎿ {text}</Text> : <Box />
  })

  on('ui.render', { component: 'InfoNotice' }, async ($, e, next) => {
    if (!(await read($, isOn))) return next(e)
    const { Box } = $.ui.resolve(e)
    return <Box />
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) =>
    (await read($, isOn)) ? next({ ...e, props: { ...e.props, hint: '' } }) : next(e),
  )
}
