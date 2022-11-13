import 'dotenv/config'

import fs from 'fs'
import axios from "axios"

const BASE_URL = process.env.BASE_URL
const USER_NAME = process.env.USER_NAME
const tokenValue = process.env.tokenValue

axios.defaults.baseURL = BASE_URL;

function writeToFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data));
}

// GET Pipeline job run History.
// {jenkins_url}/job/TEST/wfapi/runs

const api = {
  listJobs: () => '/api/json',
  // getBuildStatus: ({ jobName }) => `/job/${jobName}/api/json?depth=4&pretty=true`,
  // getBuildStatus: ({ jobName }) => `/job/${jobName}/api/json?tree=actions[parameters[*],lastBuiltRevision[branch[*]],tags[*]],artifacts[fileName],changeSets[items[msg,comment,commitId,author[fullName],paths[*]]]`,
  getBuildStatus: ({ jobName, start, end }) => `/job/${jobName}/api/json?tree=allBuilds[number,status,timestamp,duration,id,result]{${start},${end}}`,
  singleWfRun: ({ jobName, jobId }) => `/job/${jobName}/${jobId}/wfapi/describe`,
  readJob: ({ jobName }) => `/job/${jobName}/config.xml`,
  lastBuiltRevision: () => `/job/${jobName}/lastBuild/api/xml?xpath=//lastBuiltRevision/SHA1`,
  xyz: ({ jobName, jobId }) => `job/${jobName}/${jobId}/api/json?pretty=true&tree=changeSet[items[comment,affectedPaths,commitId]]`
}

class Jenkins {
  constructor() {
    this.https = axios
    this.token = tokenValue
  }

  async getResource(params) {
    const { url } = params

    const config = {
      auth: {
        username: USER_NAME,
        password: this.token
      }
    }

    const resp = await this.https.get(url, config)

    return resp
  }

  async* __fetchAllRecords(params) {
    const { url, args, options: { resource } } = params;

    const limit = 100;
    let start = 0;
    let end = 100;

    while (true) {
      const records = await this.getResource({ url });
      yield records;
      if (!records[resource]?.length) return;

      start = end + 1;
      end += limit;
    }
  }

  async listJobs() {
    const url = api.listJobs()

    const result = await this.getResource({ url })
    return result
  }

  async getBuildStatus() {
    const url = api.getBuildStatus(...arguments)

    const result = await this.__fetchAllRecords({ url })
    return result
  }

  async singleWfRun() {
    const url = api.singleWfRun(...arguments)

    const result = await this.getResource({ url })
    return result
  }

  async readJob() {
    const url = api.readJob(...arguments)

    const result = await this.getResource({ url })
    return result
  }
}

class JenkinsTool {
  constructor() {
    this.client = new Jenkins()
  }

  async* __fetchAllRecords(params) {
    const { fn, args, options: { resource } } = params;

    const limit = 100;
    let start = 0;
    let end = 100;

    while (true) {
      const records = await fn.call(this.client, { ...args, start, end });
      yield records;
      if (!records[resource]?.length) return;

      start = end + 1;
      end += limit;
    }
  }

  async getBuildStatus() {
    const resource = 'allBuilds'
    const api = this.__fetchAllRecords({
      fn: this.client.getBuildStatus,
      args: { jobName: 'galaxy' },
      options: { resource }
    })

    let records = [];

    for await (let record of api) {
      // send to es

      console.log('A RECORD', record)
      records = records.concat(record.data[resource]);
    }

  }

  async listJobs() {
    const jobs = await this.client.listJobs()

    console.log(jobs.data.jobs)

  }
}

async function init() {
  const j = new JenkinsTool()

  await j.getBuildStatus()
}

init().catch((e) => console.error(e))

// ------
async function test() {
  const jenkins = new Jenkins()

  const isWorkflow = 'org.jenkinsci.plugins.workflow.job.WorkflowJob'

  try {
    const jobs = await jenkins.listJobs()
    const job = jobs.data.jobs.filter((jb) => jb._class === isWorkflow)[0]
    // const job = jobs.data.jobs[0]

    const jobConfig = await jenkins.readJob({ jobName: job.name })
    const singleWfRun = await jenkins.singleWfRun({ jobName: job.name, jobId: 7 })
    const getBuildStatus = await jenkins.getBuildStatus({ jobName: job.name })
    // const lastBuiltRevision = await jenkins.xyz({ jobName: job.name, jobId: 7 })
    // console.log(JSON.stringify(jobs.data))
    // console.log(JSON.stringify(job))
    // console.log(JSON.stringify(jobConfig.data))
    console.log((getBuildStatus.data))
    // console.log((lastBuiltRevision.data)s
    // console.log(JSON.stringify(singleWfRun.data))
  }
  catch (e) {
    throw e
  }
}

async function log() {
  console.log('test')
}

log()
// test().catch((e) => console.log(e))





