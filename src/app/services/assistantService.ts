export interface AssistantStreamInput {
  mode: 'project' | 'conversation'
  prompt: string
  modelId: string
  projectName?: string | null
  projectPath?: string | null
}

export interface CommandProposalPayload {
  summary: string
  command: string
  projectPath: string
  workingDirectory: string
  requiresApproval: boolean
}

export interface ChangedFilePayload {
  path: string
  summary: string
  diff: string
}

export interface AssistantStreamHandlers {
  onStage?: (stageLabel: string, body: string) => void
  onToolSummary?: (toolLabel: string, toolSummary: string) => void
  onAssistantStart?: () => void
  onAssistantChunk: (chunk: string) => void
  onCommandProposal?: (proposal: CommandProposalPayload) => void
  onComplete?: () => void
}

export interface ExecutionHandlers {
  onStatus?: (label: string) => void
  onOutput: (stream: 'stdout' | 'stderr' | 'system', text: string) => void
  onReviewReady?: (files: ChangedFilePayload[]) => void
  onComplete?: () => void
  onError?: () => void
}

const stageDelay = 260
const chunkDelay = 90
const executionDelay = 180

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function streamChunks(text: string, onChunk: (chunk: string) => void) {
  const words = text.split(' ')
  for (const word of words) {
    onChunk(`${word} `)
    await wait(chunkDelay)
  }
}

function buildProjectResponse(input: AssistantStreamInput) {
  return {
    stages: [
      {
        label: 'Understanding request',
        body: `I’m grounding the task against ${input.projectName ?? 'the active project'} and shaping the coding workflow.`,
      },
      {
        label: 'Analyzing project',
        body: 'I’m scanning the active context, keeping the request conversation-first, and identifying the safest path to a useful answer.',
      },
      {
        label: 'Generating result',
        body: `I found an impactful command path for: “${input.prompt}”. Review it before execution so the project context stays explicit and safe.`,
      },
    ],
    proposal: {
      summary: 'Run project analysis command',
      command: `claude-code task --project "${input.projectPath ?? input.projectName ?? 'active-project'}" --prompt "${input.prompt.replace(/"/g, '\\"')}"`,
      projectPath: input.projectPath ?? input.projectName ?? 'active-project',
      workingDirectory: input.projectPath ?? input.projectName ?? 'active-project',
      requiresApproval: true,
    },
    toolSummary: {
      toolLabel: 'Task summary',
      toolSummary: 'Prepared an impactful project command and paused for explicit approval before execution.',
    },
  }
}

function buildConversationResponse(input: AssistantStreamInput) {
  return `Here’s a direct response to “${input.prompt}”. This conversation stays lightweight and chat-first while still preserving the current session transcript and streaming state.`
}

function buildChangedFiles(): ChangedFilePayload[] {
  return [
    {
      path: 'src/app/layout/CenterWorkspace.tsx',
      summary: 'Add review surface summary to the conversation shell.',
      diff: `@@ -320,6 +320,12 @@\n- <Transcript ... />\n+ <ReviewSummary ... />\n+ <Transcript ... />`,
    },
    {
      path: 'src/app/layout/BottomPanel.tsx',
      summary: 'Expose changed files and diff preview in the bottom panel.',
      diff: `@@ -22,6 +22,18 @@\n- <div className="bottom-panel__content">\n+ <div className="bottom-panel__tabs">\n+   <button>Output</button>\n+   <button>Review</button>\n+ </div>`,
    },
  ]
}

export async function streamAssistantResponse(input: AssistantStreamInput, handlers: AssistantStreamHandlers) {
  if (input.mode === 'project') {
    const response = buildProjectResponse(input)

    for (let index = 0; index < response.stages.length; index += 1) {
      const stage = response.stages[index]
      handlers.onStage?.(stage.label, stage.body)
      await wait(stageDelay)

      if (index === response.stages.length - 1) {
        handlers.onAssistantStart?.()
        await streamChunks(stage.body, handlers.onAssistantChunk)
      }
    }

    handlers.onCommandProposal?.(response.proposal)
    handlers.onToolSummary?.(response.toolSummary.toolLabel, response.toolSummary.toolSummary)
    handlers.onComplete?.()
    return
  }

  handlers.onAssistantStart?.()
  await streamChunks(buildConversationResponse(input), handlers.onAssistantChunk)
  handlers.onComplete?.()
}

export async function runApprovedCommand(command: string, handlers: ExecutionHandlers) {
  handlers.onStatus?.('Starting command')
  handlers.onOutput('system', `Preparing execution for: ${command}`)
  await wait(executionDelay)
  handlers.onOutput('stdout', 'Inspecting project context...')
  await wait(executionDelay)
  handlers.onStatus?.('Running command')
  handlers.onOutput('stdout', 'Running assistant-driven command safely inside the active working directory...')
  await wait(executionDelay)
  handlers.onOutput('stdout', 'Collecting command results and updating session timeline...')
  await wait(executionDelay)
  handlers.onReviewReady?.(buildChangedFiles())
  handlers.onOutput('system', 'Execution finished successfully.')
  handlers.onComplete?.()
}
