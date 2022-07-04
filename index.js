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
  // getBuildStatus: ({ jobName }) => `/job/${jobName}/api/json?tree=builds[number,status,timestamp,duration,id,result]`,
  getBuildStatus: ({ jobName }) => `/job/${jobName}/api/json?depth=4&pretty=true`,
  singleWfRun: ({ jobName, jobId }) => `/job/${jobName}/${jobId}/wfapi/describe`,
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

    const jobConfig = await jenkins.readJob({ jobName: job.name })
    const singleWfRun = await jenkins.singleWfRun({ jobName: job.name, jobId: 7 })
    const getBuildStatus = await jenkins.getBuildStatus({ jobName: job.name })
    // console.log(JSON.stringify(jobs.data))
    // console.log(JSON.stringify(job))
    // console.log(JSON.stringify(jobConfig.data))
    console.log((getBuildStatus.data))
    // console.log(JSON.stringify(singleWfRun.data))
  }
  catch (e) {
    throw e
  }
}

test().catch((e) => console.log(e))





