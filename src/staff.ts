import db from './db'
import * as passwords from './passwords'


export const staffWithRoles = () =>
  db
    .from('staff')
    .select('staff.id', 'staff.username', 'roles.role')
    .join('roles', { 'staff.role_id': 'roles.id' })

export async function insertStaff(username: string, password: string, role: string, contact_info?: any) {
  const hashed_password = await passwords.encrypt(password)

  const { rows } = await db.raw(`
        insert into staff (username, hashed_password, role_id)
        select ? as username,
               ? as hashed_password,
              id as role_id
         from roles
        where role = ?
    returning id
  `, [username, hashed_password, role])

  if (!rows || !rows.length) {
    throw { status: 400, message: `role (${role}) does not exist` }
  }

  return {
    ...rows[0],
    username,
    role,
  }
}

