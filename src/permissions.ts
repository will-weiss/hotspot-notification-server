import db from './db'


let permissions: {
  [role: string]: {
    method_regex: RegExp
    route_regex: RegExp
  }[]
}


export async function setPermissions() {
  const permissionRows = await db('permissions').select('*')
  console.log(permissionRows)
}

if (process.env.NODE_ENV !== 'test') {

}

