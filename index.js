import 'dotenv/config'

import fs from 'fs'
import axios from "axios"

const BASE_URL = process.env.BASE_URL
const USER_NAME = process.env.USER_NAME
const tokenValue = process.env.tokenValue

axios.defaults.baseURL = BASE_URL;

async function writeToFile(filename, data) {
  await fs.writeFile(filename, data);
}

const api = {
  listJobs: () => '/api/json',
  getBuildStatus: ({ jobName }) => `/job/${jobName}/api/json?tree=builds[number,status,timestamp,duration,id,result]`,
  singleWfRun: ({ jobName }) => `/job/${jobName}/8/wfapi/describe`,
  readJob: ({ jobName }) => `/job/${jobName}/config.xml`
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

  async listJobs() {
    const url = api.listJobs()

    const result = await this.getResource({ url })
    return result
  }

  async getBuildStatus() {
    const url = api.getBuildStatus(...arguments)

    const result = await this.getResource({ url })
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

async function test() {
  const jenkins = new Jenkins()

  const isWorkflow = 'org.jenkinsci.plugins.workflow.job.WorkflowJob'

  try {
    const jobs = await jenkins.listJobs()
    const job = jobs.data.jobs.filter((jb) => jb._class === isWorkflow)[0]
    // const job = jobs.data.jobs[0]

    const readJob = await jenkins.readJob({ jobName: job.name })
    console.log(readJob.data)
  }
  catch (e) {
    throw e
  }
  // await writeToFile('listJobs', resp.data)
  // await writeToFile('getBuildStatus', resp.data)
}

test().catch((e) => console.log(e))





