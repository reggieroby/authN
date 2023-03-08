#!/usr/bin/env node

import fs, { watch } from "fs"
import { exec, spawn } from 'child_process';
import chokidar from 'chokidar';
import kill from 'tree-kill';
import path from "path";
import { Command, Option } from 'commander';

const ROOT_DIR = path.resolve(__dirname)
const CA_UTIL_PATH = path.resolve(path.join(ROOT_DIR, "node_modules/.bin/ca-fnc"))
const CLIENT_DIR = path.resolve(path.join(ROOT_DIR, "client"))
const SERVER_DIR = path.resolve(path.join(ROOT_DIR, "server"))
const FUNCTIONS_DIR = path.resolve(path.join(ROOT_DIR, "functions"))

const program = new Command();

; (async () => {
  program
    .name('authN')
    .description('CLI for authN.')
    .version('1.0.0');

  program.command('build')
    .description('Build things.')
    .addOption(
      new Option(
        '--component <string...>',
        'Specify which component to build.'
      )
        .default(['client', 'server', 'fn'])
        .makeOptionMandatory()
        .choices(['client', 'server', 'fn'])
    )
    .addOption(
      new Option(
        '--environment <string>',
        'Specify which environment variables to load.'
      )
        .default(['production'])
        .makeOptionMandatory()
        .choices(['development', 'production'])
    )
    .action(async ({ component, environment }) => {
      let buildClient = () => shellExec(`npm run build`, { cwd: CLIENT_DIR })
      let buildServer = () => shellExec(`npm run build:${environment === "production" ? 'prod' : 'dev'}`, { cwd: SERVER_DIR })
      let buildFn = () => shellExec(`node_modules/.bin/babel functions -d fn --presets=@babel/env`, { cwd: ROOT_DIR })

      let componentBuildMap = {
        client: buildClient,
        server: buildServer,
        fn: buildFn,
      }

      return Promise.all(component.map(comp => componentBuildMap[comp]()))
        .then(() => { console.log("Built.") })
        .catch(err => console.error("Failed to build.", err))
    });

  program.command('deploy')
    .description('Deploy things.')
    .action(async () => {
      let resetDist = () => shellExec(`rm -rf dist; mkdir -p dist/public`, { cwd: ROOT_DIR })
      let copyToDist = () => shellExec(`cp -R client/build/. dist/public/; cp -R server/build/. dist/`, { cwd: ROOT_DIR })

      return resetDist()
        .then(copyToDist)
        .then(() => { console.log("Deployed.") })
        .catch(err => console.error("Failed to Deploy.", err))
    });

  program.command('autoWatch')
    .description('Watch things and reload them.')
    .addOption(
      new Option(
        '--component <string...>',
        'Specify which component to auto build.'
      )
        .default(['client', 'server', 'fn'])
        .makeOptionMandatory()
        .choices(['client', 'server', 'fn'])
    )
    .addOption(
      new Option(
        '--environment <string>',
        'Specify which environment to load.'
      )
        .default(['development'])
        .makeOptionMandatory()
        .choices(['development', 'production'])
    )
    .action(async ({ component, environment }) => {
      new Promise(
        async (resolve, reject) => {
          let watchConfig = {
            client: {
              buildCMD: `npm run cli build -- --component client`,
              active: {},
              workingDirectory: CLIENT_DIR,
              ignored: [`${CLIENT_DIR}/build`]
            },
            server: {
              buildCMD: `npm run cli build -- --component server --environment ${environment}`,
              active: {},
              workingDirectory: SERVER_DIR,
              ignored: [`${SERVER_DIR}/build`]
            },
            fn: {
              buildCMD: `npm run cli build -- --component fn`,
              active: {},
              workingDirectory: FUNCTIONS_DIR,
              ignored: []
            },
          }
          component
            .filter(name => environment === 'production' || name !== 'client')
            .forEach((compName) => {
              let comp = watchConfig[compName]
              chokidar.watch(comp.workingDirectory, { ignored: ["**/node_modules", /(^|[\/\\])\../, ...comp.ignored] })
                .on('ready', () => console.log(`Watching:\n\t${comp.workingDirectory}`))
                .on('change', async (filePath) => {
                  Object.entries(comp.active)
                    .forEach(([k, v]) => v.abort())
                  let runHash = crypto.randomUUID()
                  let ac = new AbortController()
                  console.log(`Building ${compName}: ${runHash}.`)
                  let runner = shellExec(comp.buildCMD, { signal: ac.signal })
                  comp.active[runHash] = ac
                  await runner
                    .then(() => {
                      delete comp.active[runHash]
                      console.log(`Deploying ${compName}: ${runHash}.`)
                      return shellExec(`npm run cli deploy`)
                    })
                    .then(() => console.log(`Watching ${compName}.`))
                    .catch(() => console.log(`${comp.workingDirectory} (${runHash}) has been canceled.\n\n`))
                })
            })
        })
        .then(() => { console.log("Built.") })
        .catch(err => console.error("Failed to build.", err))
    });

  program.command('start')
    .description('Build, Deploy, Autowatch.')
    .addOption(
      new Option(
        '--environment <string>',
        'Specify which environment to load.'
      )
        .default(['development'])
        .makeOptionMandatory()
        .choices(['development', 'production'])
    )
    .action(async ({ environment }) => {
      return shellExec(`npm run cli build -- --environment ${environment}`, { cwd: ROOT_DIR, verbose: true, stdio: 'inherit' })
        .then(() => shellExec(`npm run cli deploy`, { cwd: ROOT_DIR, verbose: true, stdio: 'inherit' }))
        .then(() => shellExec(`npm run cli autoWatch -- --environment ${environment}`, { cwd: ROOT_DIR, verbose: true, stdio: 'inherit' }))
        .then(() => { console.log("Environment ready to run Example.") })
        .catch(err => console.error("Failed to setup environment.", err))
    });
  program.parse();
})()






// FILE SYSTEM FUNCTIONS

async function shellSpawn(cmd, args = [], allOptions = {}) {
  let { verbose, ...options } = { verbose: false, ...allOptions }

  return new Promise((resolve, reject) => {
    let fn = spawn(cmd, args, options, (err, stdout, stderr) => {
      if (verbose) {
        console.log(stdout)
        console.error(stderr)
      }
      if (err) {
        console.log('about to reject')
        return reject(err)
      } else {
        console.log('about to resolve')
        return resolve(stdout)
      }
    });
  });
}

async function shellExec(cmd, allOptions = {}) {
  let { verbose, signal, ...options } = { verbose: false, ...allOptions }

  return new Promise(async (resolve, reject) => {
    let fn = exec(cmd, options, (err, stdout, stderr) => {
      if (verbose) {
        console.log(stdout)
        console.error(stderr)
      }
      if (err) {
        return reject(err)
      } else {
        return resolve(stdout)
      }
    });
    if (signal) {
      signal.onabort = () => {
        kill(fn.pid)
      }
    }
  });
}


async function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(err ? false : true)
    });
  });
}
async function readDir(dirPath, options = {}) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, options, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}
async function rmFile(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    fs.rm(filePath, options, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}
async function readFile(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}
async function writeFile(filePath, data, options = {}) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, options, (err) => {
      if (err) reject(err);
      resolve({ filePath, data });
    });
  });
}