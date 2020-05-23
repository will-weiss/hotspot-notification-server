import { first } from 'lodash'
import { IRouterContext } from 'koa-router'
import * as uuid from 'node-uuid'
import db from './db'


type StaffMemberOutgoingPayload = {
  id: string
  username: string
  role: string
}


const cookieKey = 'hotspot-notification-server:session'


// TODO: store these somewhere more permanent and expire them and all that
const sessions = new Map<string, number>()

const store = {
  async get(key: string): Promise<Maybe<number>> {
    return sessions.get(key)
  },
  async set(key: string, staff_member_id: number): Promise<void> {
    sessions.set(key, staff_member_id) // tslint:disable-line:no-expression-statement
  },
  async destroy(key: string): Promise<void> {
    sessions.delete(key) // tslint:disable-line:no-expression-statement
  }
}

export async function createSessionForStaffMember(ctx: IRouterContext, staff_member_id: number): Promise<void> {
  const sessionKey = uuid.v4()
  return (
    await store.set(sessionKey, staff_member_id),
    ctx.set('Set-Cookie', `${cookieKey}=${sessionKey}; Max-Age=86400000`) // TODO: Please some security person analyze this
  )
}

function extractSessionKeyFromCookie(cookie: Maybe<string>): Maybe<string> {
  if (!cookie) return
  const matchingCookie = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(cookieKey))
  if (!matchingCookie) return
  const [, sessionKey] = matchingCookie.split('=')
  return sessionKey
}

async function getAssociatedStaffMemberFromSessionKey(sessionKey: string): Promise<Maybe<StaffMemberOutgoingPayload>> {
  const staffMemberId = await store.get(sessionKey)
  return staffMemberId && first(
    await db
      .from('staff')
      .select('staff.id', 'staff.username', 'roles.role')
      .join('roles', { 'staff.role_id': 'roles.id' })
      .where('staff.id', staffMemberId as any)
  )
}

export async function getAssociatedStaffMemberFromCookie(cookie: Maybe<string>): Promise<Maybe<StaffMemberOutgoingPayload>> {
  const sessionKey = extractSessionKeyFromCookie(cookie)
  if (sessionKey) return getAssociatedStaffMemberFromSessionKey(sessionKey)
}

export async function removeSessionOfCookie(cookie: Maybe<string>): Promise<void> {
  const sessionKey = extractSessionKeyFromCookie(cookie)
  if (sessionKey) return store.destroy(sessionKey)
}

