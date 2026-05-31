export type ToolId = 'back' | 'ledger' | 'listen' | 'mirror'

export type ChapterId = 'fox-lantern' | 'mirror' | 'river' | 'inn' | 'ending'

export type Chapter = {
  id: ChapterId
  era: string
  title: string
  subtitle: string
  prompt: string
  narrative: string[]
  clues: string[]
  sceneLabel: string
  sceneHint: string
  verdict: string
  seal: string
  sceneImage: string
  ambientAudio: string
}

export type EndingIdentity = {
  id: 'dream' | 'rewrite' | 'night'
  title: string
  description: string
}

export type FoxLantern = {
  id: string
  label: string
  title: string
  type: 'human' | 'fox'
  description: string
  clueKey?: string
  evidence: string
  position: {
    left: string
    top: string
  }
}

export type MirrorZone = {
  id: string
  label: string
  clueKey: string
  title: string
  description: string
  evidence: string
  position: {
    left: string
    top: string
    width: string
    height: string
  }
}

export type RiverSound = {
  id: string
  title: string
  description: string
  options: string[]
  correct: string
  clueKey: string
}

export type InnVoice = {
  id: string
  title: string
  description: string
  options: string[]
  correct: string
  clueKey: string
}

export const coverImage = '/images/cover.png'
export const shareReferenceImage = '/images/share-reference.png'
export const mirrorImage = '/images/ui/mirror.png'
export const innMapImage = '/images/ui/inn-map.png'

export const watchLabels = ['初更', '二更', '三更', '四更', '鸡鸣']

export const tools = [
  { id: 'back' as const, label: '返卷', glyph: '卷' },
  { id: 'ledger' as const, label: '案牍', glyph: '录' },
  { id: 'listen' as const, label: '听符', glyph: '听' },
  { id: 'mirror' as const, label: '古镜', glyph: '鉴' },
]

export const chapters: Chapter[] = [
  {
    id: 'fox-lantern',
    era: '卷一',
    title: '狐灯借面',
    subtitle: '点画找异',
    prompt: '点击灯影，找出那一盏不属于人间的灯，再以朱砂录下它。',
    narrative: [
      '长安初秋，西市夜市如昼。灯影摇曳之间，有人形，有兽面，有一盏既不属于人间，也不属于这街灯。',
      '题签、步痕、风向与尾影，皆可能是借面之狐留下的证据。校异官不可只凭直觉落判。',
    ],
    clues: ['空白灯题', '逆向步痕', '无风自摇', '狐尾灯影'],
    sceneLabel: '夜市灯海',
    sceneHint: '先查四异，再定真伪。',
    verdict: '见灯而不逐，知妖而不躁，此卷可记“借面不惧”。',
    seal: '狐灯印',
    sceneImage: '/images/chapters/chapter1.png',
    ambientAudio: '/audio/chapter1.mp3',
  },
  {
    id: 'mirror',
    era: '卷二',
    title: '古镜照魂',
    subtitle: '拖镜照影',
    prompt: '拖动古镜照向人、门、榻、案四处，书案里的残字会替死者说话。',
    narrative: [
      '宣室深处，一面古镜静悬于案。据说照镜之人，可照见往事，亦可照见被时光掩埋的真相。',
      '镜光停驻之处，隐有线索浮现。真正的凶辞，不在人脸，而在被人故意留下又故意涂抹的书案。 ',
    ],
    clues: ['人物影迟', '门后双身', '床榻无温', '书案残字'],
    sceneLabel: '镜下孤室',
    sceneHint: '镜过之处，真伪显形。',
    verdict: '照古镜而知伪，见旧死而破谎，此卷可录“照魂知伪”。',
    seal: '古镜印',
    sceneImage: '/images/chapters/chapter2.png',
    ambientAudio: '/audio/chapter2.mp3',
  },
  {
    id: 'river',
    era: '卷三',
    title: '奈河问渡',
    subtitle: '听声辨鬼',
    prompt: '将三段夜声拖入“人、鬼、物”判格，河上船夫自会评你是否可渡。',
    narrative: [
      '雾河漫起，孤舟待客，河上只有名字被轻声呼唤。能过河者，不在会说话的人之中，而在你敢不敢回头之时。',
      '声音是本卷唯一证词。你需听见其中的人气、鬼意与物性，而不是只听响动本身。',
    ],
    clues: ['三更叩声', '低语呼名', '活人咳声'],
    sceneLabel: '雾河孤舟',
    sceneHint: '点击令牌试听，再拖入判格。',
    verdict: '闻呼名而不回首，知鬼语最似人情，此卷可记“夜行无惧”。',
    seal: '奈河印',
    sceneImage: '/images/chapters/chapter3.png',
    ambientAudio: '/audio/chapter3.mp3',
  },
  {
    id: 'inn',
    era: '卷四',
    title: '夜驿三声',
    subtitle: '听声辨位',
    prompt: '把声音拖向前门、后廊、马厩或井台，错一处，整张驿图都会说谎。',
    narrative: [
      '夜雨如织，驿舍孤灯。前门叩响、后廊低语、井边回音与马厩铃动，在风雨之中互相借位。',
      '与卷三不同，这一卷审的不是“它是什么”，而是“它从哪里来”。',
    ],
    clues: ['前门叩响', '后廊低语', '马厩铃动'],
    sceneLabel: '驿雨迷局',
    sceneHint: '听声之后，把它放回地图里。',
    verdict: '能以耳定方，不为雨夜所惑，此卷可录“听位定魄”。',
    seal: '夜驿印',
    sceneImage: '/images/chapters/chapter4.png',
    ambientAudio: '/audio/chapter4.mp3',
  },
  {
    id: 'ending',
    era: '卷五',
    title: '入我书中',
    subtitle: '落名入卷',
    prompt: '收齐前四卷印章，选择你的身份与落款，终卷将据此成形。',
    narrative: [
      '四卷印章齐聚，空白卷轴自墨色中展开。你既校异闻，也将被异闻记录。',
      '同书共梦、改写因果、夜行无惧，并非奖赏，而是这卷书对你心性的归档。',
    ],
    clues: ['狐灯印', '古镜印', '奈河印', '夜驿印'],
    sceneLabel: '卷尾空轴',
    sceneHint: '落名之后，此卷与你同在。',
    verdict: '朱砂一落，自此你亦成卷中人。',
    seal: '终卷印',
    sceneImage: '/images/chapters/chapter5.png',
    ambientAudio: '/audio/chapter5.mp3',
  },
]

export const foxLanterns: FoxLantern[] = [
  {
    id: 'scribe',
    label: '甲',
    title: '灯一·抄书客',
    type: 'human',
    description: '灯下人影低头抄写，纸页翻动甚稳，像久在夜市谋生的人。',
    clueKey: '空白灯题',
    evidence: '灯面本应署店名，却空空如也，像刚借来的壳。',
    position: { left: '18%', top: '16%' },
  },
  {
    id: 'vendor',
    label: '乙',
    title: '灯二·酒肆前',
    type: 'human',
    description: '酒旗和人潮一并起落，火色顺着风走，没有多余的妖气。',
    evidence: '这盏灯只是热闹，不是破绽。',
    position: { left: '50%', top: '18%' },
  },
  {
    id: 'bridge',
    label: '丙',
    title: '灯三·桥口灯',
    type: 'human',
    description: '桥边光影半藏在屋檐下，脚印却像是往后拖回来的。',
    clueKey: '逆向步痕',
    evidence: '灯前步痕逆向，像有人被光往后牵。',
    position: { left: '76%', top: '28%' },
  },
  {
    id: 'silk',
    label: '丁',
    title: '灯四·绣伞旁',
    type: 'human',
    description: '周遭布伞未动，灯影先晃，影子比火先醒。',
    clueKey: '无风自摇',
    evidence: '真正晃的不是灯，是伏在影里的东西。',
    position: { left: '22%', top: '58%' },
  },
  {
    id: 'fox',
    label: '戊',
    title: '灯五·狐灯',
    type: 'fox',
    description: '提灯人走得最慢，尾影却先落地，像灯在牵着人走。',
    clueKey: '狐尾灯影',
    evidence: '狐尾不是从人身后伸出，而是从灯腹边缘拖曳出来。',
    position: { left: '56%', top: '56%' },
  },
  {
    id: 'traveler',
    label: '己',
    title: '灯六·行旅客',
    type: 'human',
    description: '旅人步伐急促，灯影短而实，像真要赶路的人。',
    evidence: '这盏灯只有疲惫，没有异气。',
    position: { left: '80%', top: '70%' },
  },
]

export const mirrorZones: MirrorZone[] = [
  {
    id: 'figure',
    label: '人',
    clueKey: '人物影迟',
    title: '人物影迟',
    description: '镜中人影比现实动作慢半拍，像魂还没完全跟上身躯。',
    evidence: '先动的是身，后动的是影。',
    position: { left: '12%', top: '26%', width: '22%', height: '30%' },
  },
  {
    id: 'door',
    label: '门',
    clueKey: '门后双身',
    title: '门后双身',
    description: '镜光划过门后，映出并不该同时存在的两道人影。',
    evidence: '门只开一次，影却站了两个人。',
    position: { left: '70%', top: '18%', width: '20%', height: '34%' },
  },
  {
    id: 'bed',
    label: '榻',
    clueKey: '床榻无温',
    title: '床榻无温',
    description: '榻褥平整，却没有任何温度，像人早已离去。',
    evidence: '床在，温不在，活气也不在。',
    position: { left: '14%', top: '66%', width: '28%', height: '18%' },
  },
  {
    id: 'desk',
    label: '案',
    clueKey: '书案残字',
    title: '书案残字',
    description: '镜面停住时，案上浮出一行残墨：此人三日前已死。',
    evidence: '真相不在人脸，在书案。',
    position: { left: '58%', top: '64%', width: '26%', height: '18%' },
  },
]

export const riverSounds: RiverSound[] = [
  {
    id: 'knock',
    title: '湿木三叩',
    description: '像舟板被指节轻击，空而短，带着贴河面的回声。',
    options: ['人', '鬼', '物'],
    correct: '物',
    clueKey: '三更叩声',
  },
  {
    id: 'whisper',
    title: '低语呼名',
    description: '有人贴着耳后念你的名字，尾音轻得像雾。',
    options: ['人', '鬼', '物'],
    correct: '鬼',
    clueKey: '低语呼名',
  },
  {
    id: 'cough',
    title: '忍咳一声',
    description: '像活人压住喉间热意的一声咳，还带着气息。',
    options: ['人', '鬼', '物'],
    correct: '人',
    clueKey: '活人咳声',
  },
]

export const innVoices: InnVoice[] = [
  {
    id: 'front',
    title: '叩门声',
    description: '雨里两下木响，像门环撞在湿木板上。',
    options: ['前门', '后廊', '马厩', '井台'],
    correct: '前门',
    clueKey: '前门叩响',
  },
  {
    id: 'corridor',
    title: '贴墙低语',
    description: '一串轻语贴着廊下走，像从窗纸外擦过去。',
    options: ['前门', '后廊', '马厩', '井台'],
    correct: '后廊',
    clueKey: '后廊低语',
  },
  {
    id: 'stable',
    title: '缰铃一颤',
    description: '细金属声夹在喘息里，更像牲口抖缰绳时的瞬响。',
    options: ['前门', '后廊', '马厩', '井台'],
    correct: '马厩',
    clueKey: '马厩铃动',
  },
]

export const identities: EndingIdentity[] = [
  {
    id: 'dream',
    title: '同书共梦者',
    description: '你与卷中人共栖一梦，故事从此不再分卷内卷外。',
  },
  {
    id: 'rewrite',
    title: '改写因果者',
    description: '你愿替旧案续命，在残句之间挪动结局。',
  },
  {
    id: 'night',
    title: '夜行无惧者',
    description: '你见诡而不退，任由灯影、雾河和夜驿轮流试你。',
  },
]
