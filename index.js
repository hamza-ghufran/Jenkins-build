import 'dotenv/config'

import axios from "axios"

const BASE_URL = process.env.BASE_URL
const USER_NAME = process.env.USER_NAME
const tokenValue = process.env.tokenValue

axios.defaults.baseURL = BASE_URL;

const endpoints = {
  getBuildStatus: ({ jobName, start, end }) => `/job/${jobName}/api/json?tree=allBuilds[number,status,timestamp,duration,id,result]{${start},${end}}`,
}

class Jenkins {
  constructor() {
    this.https = axios
    this.config = {
      auth: {
        username: USER_NAME,
        password: tokenValue
      }
    }
  }

  async getResource(params) {
    const { url } = params

    const resp = await this.https.get(url, this.config)
    return resp
  }

  async* __pagination(params) {
    const { api, args, options: { resourceKey } } = params;

    const limit = 100;
    let start = 0;
    let end = 100;

    while (true) {
      const records = await this.getResource({ url: api({ ...args, start, end }) });

      yield records;
      if (!records.data[resourceKey]?.length) return;

      start = end + 1;
      end += limit;
    }
  }

  async *getBuildStatus({ jobName, ...rest }) {
    const api = endpoints.getBuildStatus

    yield* this.__pagination({ api, args: { jobName }, options: { ...rest } })
  }
}

class JenkinsTool {
  constructor() {
    this.client = new Jenkins()
  }

  async getBuildStatus() {
    const resourceKey = 'allBuilds'
    const api = this.client.getBuildStatus({ jobName: 'galaxy', resourceKey })

    let records = [];
    let counter = 0

    for await (const record of api) {
      counter++
      records = records.concat(record.data[resourceKey]);
    }
    
    console.log(records)
  }
}

async function init() {
  const j = new JenkinsTool()

  await j.getBuildStatus()
}

init().catch((e) => console.error(e))





