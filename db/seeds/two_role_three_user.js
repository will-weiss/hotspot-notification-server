const { first } = require('lodash')
const passwords = require('../../compiled-server/passwords')


exports.seed = async db => {
  await db.raw(`
    delete from location_trail_points;
    delete from cases;
    delete from permissions;
    delete from staff;
    delete from roles;
  `)

  const admin_role_id = first(await db('roles').insert({ role: 'admin' }).returning('id'))
  const contact_tracer_role_id = first(await db('roles').insert({ role: 'contact_tracer' }).returning('id'))

  // Admins can do it all
  await db('permissions').insert({ role_id: admin_role_id, method_pattern: '*', route_pattern: '*' })

  // Contact tracers can only generate auth codes and interact with cases
  await db('permissions').insert({ role_id: contact_tracer_role_id, method_pattern: 'POST', route_pattern: '/api/v1/authcode/create' })
  await db('permissions').insert({ role_id: contact_tracer_role_id, method_pattern: '*', route_pattern: '/api/v1/cases*' })

  // Add a contact tracer with an encrypted password
  await db('staff').insert([
    {
      username: 'admin',
      hashed_password: await passwords.encrypt('pw_admin'),
      role_id: admin_role_id
    },
    {
      username: 'contact_tracer_1',
      hashed_password: await passwords.encrypt('pw_contact_tracer_1'),
      role_id: contact_tracer_role_id
    },
    {
      username: 'contact_tracer_2',
      hashed_password: await passwords.encrypt('pw_contact_tracer_2'),
      role_id: contact_tracer_role_id
    },
  ])
};
