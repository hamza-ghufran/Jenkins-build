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
  getBuildStatus: ({ jobName }) => `/job/${jobName}/api/json?tree=builds[number,status,timestamp,id,result]`,
}

class Jenkins {
  constructor() {
    this.https = axios
    this.auth = tokenValue
  }

  async getResource(params) {
    const { url } = params

    const config = {
      auth: {
        username: USER_NAME,
        password: this.auth
      }
    }

    const resp = await axios.get(url, config)

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
}

async function test() {
  const jenkins = new Jenkins()

  try {
    const jobs = await jenkins.listJobs()
    const job = jobs.data.jobs[0]

    const buildStatus = await jenkins.getBuildStatus({ jobName: job.name })
    console.log(buildStatus.data)
  }
  catch (e) {
    throw e
  }
  // await writeToFile('listJobs', resp.data)
  // await writeToFile('getBuildStatus', resp.data)
}

test().catch((e) => console.log(e))





