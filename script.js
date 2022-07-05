import fs from 'fs'
import { exec } from 'child_process'

var totalCommits = 100

function appendFileSync(filename, data) {
  fs.appendFileSync(filename, data);
}

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function init() {
  var intv = setInterval(() => {
    for (let i = totalCommits; i >= totalCommits - 10; i--) {
      appendFileSync('./test', `${i}\n`)
      /**
       * git commit action
       */
    }
    totalCommits -= 10

    if (!totalCommits) {
      clearInterval(intv)
      console.log('over')
    }
  }, 5000)
}

sh('sh push.sh').then((e) => console.log(e)).catch((e) => { console.log(e) })