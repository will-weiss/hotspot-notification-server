import * as assert from 'assert'
import db from './db'

type Permission = {
  method_test(method: string): boolean
  route_test(route: string): boolean
}

type Permissions = Map<string, Permission[]>

let permissions: Permissions


let permissionsReadIntoMemory = false

// 
const makeTest = (pattern: string): (s: string) => boolean => {
  if (pattern === '*') return s => true // new RegExp('^*$') isn't valid
  const regex = new RegExp('^' + pattern + '$')
  return s => regex.test(s)
}

export async function readPermissionsIntoMemory() {
  try {
    assert.equal(permissionsReadIntoMemory, false, 'Only read permissions into memory once')
    const { rows } = 
      await db.raw(`
        select roles.role
             , permissions.method_pattern
             , permissions.route_pattern
         from permissions
         join roles on permissions.role_id = roles.id
      `)
    
    permissions = rows.reduce((permissions: Permissions, row: any) => {
      const { role, method_pattern, route_pattern } = row

      const permission: Permission = {
        method_test: makeTest(method_pattern),
        route_test: makeTest(route_pattern),
      }
      
      if (!permissions.has(role)) {
        permissions.set(role, [permission])
      } else {
        const rolePermissions = permissions.get(role)!
        permissions.set(role, rolePermissions.concat([permission]))
      }

      return permissions
    }, new Map())
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export function checkPermissions(role: Maybe<string>, method: string, path: string): boolean {

  // session route doesn't have to 
  if (path.endsWith('/session')) return true

  if (!role) return false

  const rolePermissions = permissions.get(role)
  if (!rolePermissions) return false
  return rolePermissions.some(({ method_test, route_test }) => {
    return method_test(method) && route_test(path)
  })
}

if (process.env.NODE_ENV !== 'test') {
  readPermissionsIntoMemory()
}
