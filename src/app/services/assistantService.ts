import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import type {
  AssistantStreamEvent,
  AssistantStreamStartResponse,
  CommandProposal,
  ExecutionOutputEntry,
  SessionAttachment,
} from '../state/types'

const isBrowserTest = typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window
const ASSISTANT_STREAM_EVENT = 'assistant-turn-event'

type PlaywrightAssistantMocks = {
  assistantStreamEvents?: AssistantStreamEvent[]
  assistantTurnResponse?: AssistantTurnResponse
  executeCommandResponse: ExecuteCommandResponse
}

function getAssistantMocks(): PlaywrightAssistantMocks | null {
  if (!isBrowserTest) {
    return null
  }

  return (window as typeof window & { __PLAYWRIGHT_MOCKS__?: { assistant?: PlaywrightAssistantMocks } }).__PLAYWRIGHT_MOCKS__?.assistant ?? null
}

export interface AssistantInputSegment {
  type: 'text' | 'command'
  text: string
  commandName?: string
}

export interface AssistantStreamInput {
  mode: 'project' | 'conversation'
  prompt: string
  modelId: string
  projectName?: string | null
  projectPath?: string | null
  inputSegments?: AssistantInputSegment[]
  attachments?: SessionAttachment[]
  turnId?: string
}

export type CommandProposalPayload = CommandProposal

export interface ChangedFilePayload {
  path: string
  summary: string
  diff: string
}

export interface AssistantStreamHandlers {
  onStage?: (stageLabel: string, body: string) => void | Promise<void>
  onToolSummary?: (toolLabel: string, toolSummary: string) => void | Promise<void>
  onAssistantStart?: () => void | Promise<void>
  onAssistantChunk: (chunk: string) => void | Promise<void>
  onCommandProposal?: (proposal: CommandProposalPayload) => void | Promise<void>
  onComplete?: () => void | Promise<void>
}

export interface ExecutionHandlers {
  onStatus?: (label: string) => void
  onOutput: (stream: ExecutionOutputEntry['stream'], text: string) => void
  onReviewReady?: (files: ChangedFilePayload[]) => void
  onComplete?: (status?: 'completed' | 'failed') => void
  onError?: () => void
}

interface AssistantStageResponse {
  label: string
  body: string
}

interface AssistantToolSummaryResponse {
  toolLabel: string
  toolSummary: string
}

interface AssistantTurnResponse {
  stages: AssistantStageResponse[]
  assistantMessage: string
  toolSummary?: AssistantToolSummaryResponse | null
  commandProposal?: CommandProposalPayload | null
}

interface ExecuteCommandResponse {
  status: 'completed' | 'failed'
  startedAt: string
  completedAt: string
  output: Array<{
    stream: ExecutionOutputEntry['stream']
    text: string
    createdAt: string
  }>
  changedFiles: ChangedFilePayload[]
}

async function handleAssistantEvent(event: AssistantStreamEvent, handlers: AssistantStreamHandlers) {
  switch (event.kind) {
    case 'stage-status':
      await handlers.onStage?.(event.stageLabel ?? 'Working', event.body ?? '')
      break
    case 'assistant-start':
      await handlers.onAssistantStart?.()
      break
    case 'assistant-delta':
      await handlers.onAssistantChunk(event.delta ?? '')
      break
    case 'tool-summary':
      await handlers.onToolSummary?.(event.toolLabel ?? 'Tool summary', event.toolSummary ?? event.body ?? '')
      break
    case 'command-proposal':
      if (event.commandProposal) {
        await handlers.onCommandProposal?.(event.commandProposal)
      }
      break
    case 'complete':
      await handlers.onComplete?.()
      break
    case 'error':
      throw new Error(event.error ?? 'Assistant stream failed.')
  }
}

async function replayLegacyMockResponse(response: AssistantTurnResponse, handlers: AssistantStreamHandlers) {
  for (const stage of response.stages) {
    await handlers.onStage?.(stage.label, stage.body)
  }

  await handlers.onAssistantStart?.()
  await handlers.onAssistantChunk(response.assistantMessage)

  if (response.commandProposal) {
    await handlers.onCommandProposal?.(response.commandProposal)
  }

  if (response.toolSummary) {
    await handlers.onToolSummary?.(response.toolSummary.toolLabel, response.toolSummary.toolSummary)
  }

  await handlers.onComplete?.()
}

export async function streamAssistantResponse(input: AssistantStreamInput, handlers: AssistantStreamHandlers) {
  const mocks = getAssistantMocks()
  if (mocks?.assistantStreamEvents?.length) {
    for (const event of mocks.assistantStreamEvents) {
      await handleAssistantEvent(event, handlers)
    }
    return
  }

  if (mocks?.assistantTurnResponse) {
    await replayLegacyMockResponse(mocks.assistantTurnResponse, handlers)
    return
  }

  let unlisten: UnlistenFn | null = null

  try {
    const turnId = input.turnId ?? crypto.randomUUID()

    await new Promise<void>(async (resolve, reject) => {
      let settled = false

      const finalize = (callback: () => void) => {
        if (settled) {
          return
        }
        settled = true
        callback()
      }

      try {
        unlisten = await listen<AssistantStreamEvent>(ASSISTANT_STREAM_EVENT, (message) => {
          const event = message.payload
          if (!event || event.turnId !== turnId) {
            return
          }

          void (async () => {
            try {
              await handleAssistantEvent(event, handlers)
              if (event.kind === 'complete') {
                finalize(resolve)
              }
            } catch (error) {
              finalize(() => reject(error))
            }
          })()
        })

        const response = await invoke<AssistantStreamStartResponse>('start_assistant_turn_stream', {
          input: {
            ...input,
            turnId,
          },
        })

        if (response.turnId !== turnId) {
          finalize(() => reject(new Error(`Assistant stream turn mismatch: expected ${turnId}, received ${response.turnId}`)))
        }
      } catch (error) {
        finalize(() => reject(error))
      }
    })
  } finally {
    const cleanup = unlisten as (() => void) | null
    if (typeof cleanup === 'function') {
      cleanup()
    }
  }
}

export async function runApprovedCommand(
  command: string,
  projectPath: string,
  workingDirectory: string,
  handlers: ExecutionHandlers,
) {
  handlers.onStatus?.('Execution running')

  const mocks = getAssistantMocks()
  const response = mocks
    ? mocks.executeCommandResponse
    : await invoke<ExecuteCommandResponse>('execute_approved_command', {
        input: {
          command,
          projectPath,
          workingDirectory,
        },
      })

  for (const entry of response.output) {
    handlers.onOutput(entry.stream, entry.text)
  }

  if (response.changedFiles.length > 0) {
    handlers.onReviewReady?.(response.changedFiles)
  }

  if (response.status === 'failed') {
    handlers.onComplete?.('failed')
    handlers.onError?.()
    return
  }

  handlers.onComplete?.('completed')
}
