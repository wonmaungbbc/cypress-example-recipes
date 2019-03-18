// a script that goes through each example folder
// and runs tests in each one
// Useful when one needs to test everything in this repo using a single command

/* eslint-disable no-console */
const globby = require('globby')
const bluebird = require('bluebird')
const tb = require('terminal-banner').terminalBanner
const execa = require('execa')
const pluralize = require('pluralize')
const { resolve, join } = require('path')

const getExamples = () => {
  return globby('examples/*', { onlyFiles: false, expandDirectories: false })
}

const printFolders = (folders) => {
  console.log(
    'Will be running tests in %s',
    pluralize('folder', folders.length, true)
  )
  folders.forEach((name) => console.log(' -', name))
}

const testExample = (folder) => {
  tb(`Testing ${folder}`)
  // runs the same script command in each folder
  // maybe if there is no script, should skip it?
  const filename = resolve(join(folder, 'package.json'))
  const { scripts } = require(filename)
  if (!scripts || !scripts['test:ci']) {
    console.log('file %s does not have script "test:ci"', filename)
    console.log('skipping...')
    return
  }
  return execa('npm', ['run', 'test:ci'], { stdio: 'inherit', cwd: folder })
}

const testExamples = (folders) => {
  return bluebird.mapSeries(folders, testExample)
}

const filterSomeFolders = (folders) => {
  // if you want to filter some folders by name for example
  return folders
}

bluebird
.try(getExamples)
.then((list) => list.sort())
// .then((list) => list.slice(0, 3))
.then(filterSomeFolders)
.tap(printFolders)
.then(testExamples)
.catch((e) => {
  console.error(e.message)
  process.exit(1)
})