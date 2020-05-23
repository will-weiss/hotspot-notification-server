import db from './db'


let permissions: {
  [role: string]: {
    method_regex: RegExp
    route_regex: RegExp
  }[]
}

let permissionsReadIntoMemory
let permissionsNotReadIntoMemory
const readingPermissionsIntoMemory = new Promise((resolve, reject) => {
  permissionsReadIntoMemory = resolve
  permissionsNotReadIntoMemory = reject
})




export async function setPermissions() {
  const permissionRows = await db('permissions').select('*')
  console.log(permissionRows)
}

if (process.env.NODE_ENV !== 'test') {
  
}

