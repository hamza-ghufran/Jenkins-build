import fs from 'fs'
import { exec } from 'child_process'

var totalCommits = 80

async function appendFile(filename, data) {
  return new Promise((res, rej) => {
    fs.appendFile(filename, data, (err, data) => {
      if (err) {
        rej(err)
      }
      else res(data)
    });
  })
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
  var intv = setInterval(async () => {
    let res
    for (let i = totalCommits; i >= totalCommits - 10; i--) {
      res = await appendFile('./test', `${i}\n`)
    }
    console.log('appended', res)
    const result = await sh('sh push.sh')
    console.log('pushed', result)

    totalCommits -= 10
    if (!totalCommits) {
      clearInterval(intv)
      console.log('over')
    }
  }, 5000 * 2)
}

init()
// sh('sh push.sh').then((e) => console.log(e)).catch((e) => { console.log(e) })