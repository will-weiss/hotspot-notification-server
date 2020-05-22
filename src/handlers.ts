import { IRouterContext, IMiddleware } from 'koa-router'


export async function createSession() {

}

export async function delSession() {

}

export async function getHealthAuthorityInfo(ctx: IRouterContext) {
  return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
}

export async function putHealthAuthorityInfo() {

}

export async function getStaff() {

}

export async function postStaff() {

}

export async function putStaff() {

}

export async function delStaff() {

}

export async function getSettings() {

}

export async function putSetting() {

}

export async function createAuthcode() {

}

export async function postCase() {

}

export async function getCases() {

}

export async function delCase() {

}

export async function editPatientRecordInformation() {

}

export async function postLocationTrailPoints() {

}

export async function redactLocationTrailPoint() {

}

export async function getAllHotspots() {

}

export async function getPublichotspots() {

}

export async function getPrivateHotspots() {

}

export async function makeHotspotPublic() {

}
