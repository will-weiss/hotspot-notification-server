import db from './db'

export const staffWithRoles = (opts: { include_ts?: boolean } = {}) =>
  db
    .from('staff')
    .select(...(['staff.id', 'staff.username', 'roles.role'].concat([])))
    .join('roles', { 'staff.role_id': 'roles.id' })