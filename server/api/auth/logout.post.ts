export default defineEventHandler((event) => {
  deleteCookie(event, AUTH_COOKIE, { path: '/' })
  return { success: true }
})
