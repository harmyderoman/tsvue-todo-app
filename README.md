# tsvue-todo-app

Notes with todo lists, built with Vue 3, TypeScript, Vuex and Vite.
Live at https://harmyderoman.github.io/tsvue-todo-app/.

## Project setup

```
npm install
```

## Scripts

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Starts the dev server with hot reload                |
| `npm run build`      | Builds for production into `dist/`                   |
| `npm run preview`    | Serves the production build locally                  |
| `npm test`           | Runs the unit tests once (Vitest)                    |
| `npm run test:watch` | Runs the unit tests in watch mode                    |
| `npm run type-check` | Type-checks the project with `vue-tsc`               |
| `npm run deploy`     | Tests, builds and publishes `dist/` to GitHub Pages  |

## Deployment

`npm run deploy` runs the tests, builds the app and force-pushes `dist/` to the
`gh-pages` branch of this repository. GitHub Pages must be set to serve that
branch: Settings → Pages → Source "Deploy from a branch" → `gh-pages` / root.

To publish somewhere else, set `DEPLOY_REPO` and `DEPLOY_BRANCH`:

```
DEPLOY_REPO=https://github.com/<user>/<repo>.git DEPLOY_BRANCH=<branch> npm run deploy
```

The build uses a relative base path and hash-based routing, so it works both at
the root of a domain and under a `/<repo>/` sub-path without extra config.
