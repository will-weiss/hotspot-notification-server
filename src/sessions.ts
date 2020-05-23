import { first } from 'lodash'
import { IRouterContext } from 'koa-router'
import * as uuid from 'node-uuid'
import db from './db'



const cookieKey = 'hotspot-notification-server:session'


// TODO: store these somewhere more permanent and expire them and all that
const sessions = new Map<string, number>()

const store = {
  async get(key: string): Promise<Maybe<number>> {
    return sessions.get(key)
  },
  async set(key: string, staff_member_id: number) {
    sessions.set(key, staff_member_id)
  },
  async destroy(key: string) {
    sessions.delete(key)
  }
}

export async function createSessionForStaffMember(ctx: IRouterContext, staff_member_id: number) {
  const sessionKey = uuid.v4()
  await store.set(sessionKey, staff_member_id)
  
  // TODO: Please some security person analyze this
  ctx.set('Set-Cookie', `${cookieKey}=${sessionKey}; Max-Age=86400000`)
}

export function extractSessionKeyFromCookie(cookie: Maybe<string>): Maybe<string> {
  if (!cookie) return
  const matchingCookie = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(cookieKey))
  if (!matchingCookie) return
  const [, sessionKey] = matchingCookie.split('=')
  return sessionKey
}

export async function getAssociatedStaffMember(sessionKey: string) {
  const staffMemberId = await store.get(sessionKey)
  return first(
    await db
      .from('staff')
      .select('staff.id', 'staff.username', 'roles.role')
      .join('roles', { 'staff.role_id': 'roles.id' })
      .where('staff.id', staffMemberId as any)
  )
}
