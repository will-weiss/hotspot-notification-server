import bcrypt = require('bcrypt')
import * as settings from './settings'


export function encrypt(plaintext: string): Promise<string> {
  if (plaintext.length < settings.minimumPasswordLength) {
    return Promise.reject({
      status: 400,
      message: `Passwords must be at least ${settings.minimumPasswordLength} characters long`,
    })
  }

  return new Promise((resolve, reject) =>
    bcrypt.genSalt(10, (err: any, salt: any) => {
      if (err) return reject(err)

      return bcrypt.hash(plaintext, salt, (err: any, hashed: any) =>
        err ? reject(err) : resolve(hashed))
    }))
}

export function compare(plaintext: string, hashed: string): Promise<boolean> {
  return new Promise((resolve, reject) =>
    bcrypt.compare(plaintext, hashed, (err: any, isPasswordMatch: boolean) =>
      err ? reject(err) : resolve(isPasswordMatch)))
}
