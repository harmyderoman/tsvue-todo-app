// Builds the app and force-pushes ./dist to the GitHub Pages repository.
//
//   npm run deploy
//
// Refuses to run with uncommitted changes (override: DEPLOY_ALLOW_DIRTY=1).
//
// Defaults publish to the gh-pages branch of this repository, served at
// https://harmyderoman.github.io/tsvue-todo-app/. Override with:
//   DEPLOY_REPO=https://github.com/<user>/<repo>.git DEPLOY_BRANCH=<branch> npm run deploy
import { execSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'

const repo =
  process.env.DEPLOY_REPO ??
  'https://github.com/harmyderoman/tsvue-todo-app.git'
const branch = process.env.DEPLOY_BRANCH ?? 'gh-pages'

const run = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit' })
const sha = execSync('git rev-parse --short HEAD').toString().trim()

// The deploy is labelled with the commit hash, so it has to match that commit.
const uncommitted = execSync('git status --porcelain').toString().trim()
if (uncommitted && !process.env.DEPLOY_ALLOW_DIRTY) {
  console.error(
    `Uncommitted changes:\n${uncommitted}\n\n` +
      'Commit or stash them first, or set DEPLOY_ALLOW_DIRTY=1 to deploy anyway.'
  )
  process.exit(1)
}

run('npm run type-check')
run('npm test')
run('npm run build')

if (!existsSync('dist/index.html')) {
  throw new Error('Build produced no dist/index.html, nothing to deploy.')
}

// Stop GitHub Pages from running the output through Jekyll.
writeFileSync('dist/.nojekyll', '')

rmSync('dist/.git', { recursive: true, force: true })
try {
  run('git init --quiet', 'dist')
  run('git add -A', 'dist')
  run(`git commit --quiet -m "deploy ${sha}"`, 'dist')
  run(`git push --force ${repo} HEAD:${branch}`, 'dist')
} finally {
  rmSync('dist/.git', { recursive: true, force: true })
}

console.log(`\nDeployed ${sha} to ${repo} (${branch}).`)
