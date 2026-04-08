/**
 * Entity Recognition (Named Entity Recognition)
 * Extract person names, locations, organizations from queries using kuromoji
 */

import kuromoji from 'kuromoji'
import path from 'path'

export enum EntityType {
  PERSON = 'person',
  LOCATION = 'location',
  ORGANIZATION = 'organization',
  PRODUCT = 'product',
  EVENT = 'event',
  DATE = 'date',
  TIME = 'time',
  MONEY = 'money',
  HASHTAG = 'hashtag',
  MENTION = 'mention',
  URL = 'url',
  EMAIL = 'email',
  PROPER_NOUN = 'proper_noun'
}

export interface Entity {
  text: string
  type: EntityType
  start: number
  end: number
  confidence: number
}

export interface EntityRecognitionResult {
  entities: Entity[]
  cleanedQuery: string
}

let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null
let tokenizerPromise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null

function getDicPath(): string {
  if (typeof window === 'undefined') {
    return path.join(process.cwd(), 'public', 'dict')
  }
  return '/dict'
}

function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizerInstance) return Promise.resolve(tokenizerInstance)
  if (tokenizerPromise) return tokenizerPromise
  tokenizerPromise = new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: getDicPath() }).build((err, tokenizer) => {
      if (err) { reject(err); return }
      tokenizerInstance = tokenizer
      resolve(tokenizer)
    })
  })
  return tokenizerPromise
}


function getEntityTypeFromPos(token: kuromoji.IpadicFeatures): EntityType | null {
  if (token.pos !== '\u540D\u8A5E') return null
  const detail1 = token.pos_detail_1
  const detail2 = token.pos_detail_2
  if (detail1 === '\u56FA\u6709\u540D\u8A5E') {
    switch (detail2) {
      case '\u4EBA\u540D': return EntityType.PERSON
      case '\u5730\u57DF': return EntityType.LOCATION
      case '\u7D44\u7E54': return EntityType.ORGANIZATION
      default: return EntityType.PROPER_NOUN
    }
  }
  return null
}

async function extractEntitiesWithKuromoji(text: string): Promise<Entity[]> {
  const entities: Entity[] = []
  try {
    const tokenizer = await getTokenizer()
    const tokens = tokenizer.tokenize(text)
    let currentPos = 0
    let currentEntity: { text: string; type: EntityType; start: number } | null = null
    for (const token of tokens) {
      const start = text.indexOf(token.surface_form, currentPos)
      const end = start + token.surface_form.length
      currentPos = end
      const entityType = getEntityTypeFromPos(token)
      if (entityType) {
        if (currentEntity && currentEntity.type === entityType && start === currentEntity.start + currentEntity.text.length) {
          currentEntity.text += token.surface_form
        } else {
          if (currentEntity) {
            entities.push({ text: currentEntity.text, type: currentEntity.type, start: currentEntity.start, end: currentEntity.start + currentEntity.text.length, confidence: 0.85 })
          }
          currentEntity = { text: token.surface_form, type: entityType, start }
        }
      } else {
        if (currentEntity) {
          entities.push({ text: currentEntity.text, type: currentEntity.type, start: currentEntity.start, end: currentEntity.start + currentEntity.text.length, confidence: 0.85 })
          currentEntity = null
        }
      }
    }
    if (currentEntity) {
      entities.push({ text: currentEntity.text, type: currentEntity.type, start: currentEntity.start, end: currentEntity.start + currentEntity.text.length, confidence: 0.85 })
    }
  } catch (error) {
    console.error('[EntityRecognition] kuromoji extraction failed:', error)
  }
  return entities
}


function extractMentions(text: string): Entity[] {
  const entities: Entity[] = []
  const regex = /@([\w]+)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    entities.push({ text: match[0], type: EntityType.MENTION, start: match.index, end: match.index + match[0].length, confidence: 1.0 })
  }
  return entities
}

function extractHashtags(text: string): Entity[] {
  const entities: Entity[] = []
  const regex = /#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    entities.push({ text: match[0], type: EntityType.HASHTAG, start: match.index, end: match.index + match[0].length, confidence: 1.0 })
  }
  return entities
}

function extractUrls(text: string): Entity[] {
  const entities: Entity[] = []
  const regex = /https?:\/\/[^\s]+/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    entities.push({ text: match[0], type: EntityType.URL, start: match.index, end: match.index + match[0].length, confidence: 1.0 })
  }
  return entities
}

function extractEmails(text: string): Entity[] {
  const entities: Entity[] = []
  const regex = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    entities.push({ text: match[0], type: EntityType.EMAIL, start: match.index, end: match.index + match[0].length, confidence: 1.0 })
  }
  return entities
}

function extractMoney(text: string): Entity[] {
  const entities: Entity[] = []
  const yenRegex = /([0-9,]+)\u5186/g
  let match: RegExpExecArray | null
  while ((match = yenRegex.exec(text)) !== null) {
    entities.push({ text: match[0], type: EntityType.MONEY, start: match.index, end: match.index + match[0].length, confidence: 0.9 })
  }
  const dollarRegex = /\$([0-9,]+(?:\.[0-9]{2})?)/g
  while ((match = dollarRegex.exec(text)) !== null) {
    entities.push({ text: match[0], type: EntityType.MONEY, start: match.index, end: match.index + match[0].length, confidence: 0.9 })
  }
  return entities
}

function extractDates(text: string): Entity[] {
  const entities: Entity[] = []
  const patterns = [
    { regex: /(\d{4})\u5E74(\d{1,2})\u6708(\d{1,2})\u65E5/g, confidence: 1.0 },
    { regex: /(\d{1,2})\u6708(\d{1,2})\u65E5/g, confidence: 0.9 },
    { regex: /(\d{4})\/(\d{1,2})\/(\d{1,2})/g, confidence: 0.95 }
  ]
  for (const { regex, confidence } of patterns) {
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      entities.push({ text: match[0], type: EntityType.DATE, start: match.index, end: match.index + match[0].length, confidence })
    }
  }
  return entities
}

function extractTimes(text: string): Entity[] {
  const entities: Entity[] = []
  const regex = /(\d{1,2}):(\d{2})/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const hour = parseInt(match[1])
    const minute = parseInt(match[2])
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      entities.push({ text: match[0], type: EntityType.TIME, start: match.index, end: match.index + match[0].length, confidence: 0.8 })
    }
  }
  return entities
}


function removeDuplicateEntities(entities: Entity[]): Entity[] {
  const result: Entity[] = []
  const sorted = [...entities].sort((a, b) => b.confidence - a.confidence)
  for (const entity of sorted) {
    const overlaps = result.some(existing => 
      (entity.start >= existing.start && entity.start < existing.end) ||
      (entity.end > existing.start && entity.end <= existing.end) ||
      (entity.start <= existing.start && entity.end >= existing.end)
    )
    if (!overlaps) result.push(entity)
  }
  return result
}

export async function extractEntitiesAsync(text: string): Promise<EntityRecognitionResult> {
  const entities: Entity[] = []
  entities.push(...extractMentions(text))
  entities.push(...extractHashtags(text))
  entities.push(...extractUrls(text))
  entities.push(...extractEmails(text))
  entities.push(...extractMoney(text))
  entities.push(...extractDates(text))
  entities.push(...extractTimes(text))
  const kuromojiEntities = await extractEntitiesWithKuromoji(text)
  entities.push(...kuromojiEntities)
  const uniqueEntities = removeDuplicateEntities(entities)
  uniqueEntities.sort((a, b) => a.start - b.start)
  let cleanedQuery = text
  for (let i = uniqueEntities.length - 1; i >= 0; i--) {
    const entity = uniqueEntities[i]
    cleanedQuery = cleanedQuery.substring(0, entity.start) + cleanedQuery.substring(entity.end)
  }
  cleanedQuery = cleanedQuery.trim()
  return { entities: uniqueEntities, cleanedQuery: cleanedQuery || text }
}

export function extractEntities(text: string): EntityRecognitionResult {
  const entities: Entity[] = []
  entities.push(...extractMentions(text))
  entities.push(...extractHashtags(text))
  entities.push(...extractUrls(text))
  entities.push(...extractEmails(text))
  entities.push(...extractMoney(text))
  entities.push(...extractDates(text))
  entities.push(...extractTimes(text))
  const uniqueEntities = removeDuplicateEntities(entities)
  uniqueEntities.sort((a, b) => a.start - b.start)
  let cleanedQuery = text
  for (let i = uniqueEntities.length - 1; i >= 0; i--) {
    const entity = uniqueEntities[i]
    cleanedQuery = cleanedQuery.substring(0, entity.start) + cleanedQuery.substring(entity.end)
  }
  cleanedQuery = cleanedQuery.trim()
  return { entities: uniqueEntities, cleanedQuery: cleanedQuery || text }
}

export function formatEntityType(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    [EntityType.PERSON]: '\u4EBA\u540D',
    [EntityType.LOCATION]: '\u5730\u540D',
    [EntityType.ORGANIZATION]: '\u7D44\u7E54\u540D',
    [EntityType.PRODUCT]: '\u5546\u54C1\u540D',
    [EntityType.EVENT]: '\u30A4\u30D9\u30F3\u30C8\u540D',
    [EntityType.DATE]: '\u65E5\u4ED8',
    [EntityType.TIME]: '\u6642\u523B',
    [EntityType.MONEY]: '\u91D1\u984D',
    [EntityType.HASHTAG]: '\u30CF\u30C3\u30B7\u30E5\u30BF\u30B0',
    [EntityType.MENTION]: '\u30E1\u30F3\u30B7\u30E7\u30F3',
    [EntityType.URL]: 'URL',
    [EntityType.EMAIL]: '\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9',
    [EntityType.PROPER_NOUN]: '\u56FA\u6709\u540D\u8A5E'
  }
  return labels[type] || '\u4E0D\u660E'
}
