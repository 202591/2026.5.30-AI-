type VerdictPayload = {
  playerName: string
  identityTitle: string
  chapterTitles: string[]
  clueCount: number
  completedCount: number
}

const fallbackVerdicts = [
  '见狐灯而不逐，照古镜而知伪，闻夜驿而不惑，此人可归，可记，可传。',
  '以心为烛，以识为镜，在异与常之间辨真相，终成此卷。',
  '不贪怪，不惧鬼，不误人，故得留名卷尾，成为异闻所记之人。',
  '能审其形，亦能审其心，故宣室旧卷愿为此人开一页新录。',
]

function buildPrompt(payload: VerdictPayload) {
  return [
    '你是《宣室异闻录》的卷末判词官。',
    '请用唐代志怪、案牍批语的笔法，写一段 60 到 120 字的中文判词。',
    '不要使用现代口语、网络词、标题符号或分点。',
    `玩家署名：${payload.playerName}`,
    `卷末身份：${payload.identityTitle}`,
    `已通关卷次：${payload.chapterTitles.join('、')}`,
    `已收集线索数：${payload.clueCount}`,
    `已完成卷次：${payload.completedCount}`,
    '判词必须包含：行为总结、因果评价、卷中归属感。',
  ].join('\n')
}

export async function generateVerdict(payload: VerdictPayload): Promise<{ text: string; fallback: boolean }> {
  const endpoint = import.meta.env.VITE_VERDICT_API_URL

  if (!endpoint) {
    return { text: buildFallbackVerdict(payload), fallback: true }
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        prompt: buildPrompt(payload),
        meta: payload,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`verdict request failed: ${response.status}`)
    }

    const data = (await response.json()) as { verdict?: string }
    if (!data.verdict) {
      throw new Error('missing verdict')
    }

    return { text: data.verdict, fallback: false }
  } catch {
    return { text: buildFallbackVerdict(payload), fallback: true }
  } finally {
    window.clearTimeout(timeout)
  }
}

function buildFallbackVerdict(payload: VerdictPayload) {
  const template = fallbackVerdicts[payload.clueCount % fallbackVerdicts.length]
  return `${payload.playerName}既被判为“${payload.identityTitle}”，${template}`
}
