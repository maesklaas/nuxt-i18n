const { has } = require('lodash')

/**
 * Generate localized route using Nuxt's generated routes and i18n config
 * @param  {Array}  baseRoutes  Nuxt's default routes based on pages/ directory
 * @param  {Array}  locales     Locales to use for route generation, should be
 *                              used when recursively generating children routes,
 *                              defaults to app's configured LOCALES
 * @return {Array}              Localized routes to be used in Nuxt config
 */
const generateRoutes = ({
  baseRoutes,
  locales,
  defaultLocale,
  routesOptions,
  ignorePaths = [],
  isChild = false }) => {
  // Abort routes generation if no routes or locales specified
  if (!baseRoutes || !locales) {
    return []
  }
  const newRoutes = []
  const localizedRoutes = []

  // Extract routes that should not be localized
  baseRoutes.forEach(route => {
    if (ignorePaths.indexOf(route.path) !== -1) {
      newRoutes.push(route)
    } else {
      localizedRoutes.push(route)
    }
  })

  localizedRoutes.forEach(baseRoute => {
    locales.forEach((locale) => {
      const { component } = baseRoute
      let { path, name, children, chunkName } = baseRoute
      if (children) {
        children = generateRoutes({
          baseRoutes: children,
          locales: [locale],
          defaultLocale,
          routesOptions,
          ignorePaths,
          isChild: true
        })
      }
      const { code } = locale
      if (has(routesOptions, `${chunkName}.${code}`)) {
        path = routesOptions[chunkName][code]
      }
      // Don't change path when current route is a child
      if (code !== defaultLocale && !isChild) {
        // Add leading / if needed
        if (path.match(/^\//) === null) {
          path = `/${path}`
        }
        // Prefix path with locale code if not default locale
        path = `/${code}${path}`
      }
      const route = { path, component }
      if (name) {
        name += `-${code}`
        route.name = name
      }
      if (children) {
        route.children = children
      }
      newRoutes.push(route)
    })
  })
  return newRoutes
}

module.exports = { generateRoutes }
