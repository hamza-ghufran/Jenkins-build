import 'dotenv/config'
import axios from 'axios';

const BASE_URL = process.env.BASE_URL
const USER_NAME = process.env.USER_NAME
const PASSWORD = process.env.PASSWORD

const api = {
  crumb: () => `${BASE_URL}/crumbIssuer/api/json`,
  genToken: (tokenName) => `${BASE_URL}/me/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken?newTokenName=${tokenName}`
}

async function getCrumb() {
  try {
    const url = api.crumb()
    const config = {
      auth: {
        username: USER_NAME,
        password: PASSWORD
      }
    }

    const resp = await axios.get(url, config)

    return resp
  }
  catch (e) {
    console.log(e);
  }
}
/**
 * 
 * @param {*} params 
 * @param {object} params.crumbIssuer 
 * @returns 
 */
async function generateToken(params) {
  const { crumbIssuer } = params

  const url = api.genToken('testToken');

  try {
    const res = await axios.post(url, {}, {
      auth: {
        username: USER_NAME,
        password: PASSWORD
      },
      headers: {
        /**
         * You now have to forward the session id 
         * (present in the cookie response that generated the crumb) every time you use that crumb. 
         */
        Cookie: crumbIssuer.headers['set-cookie'][0],
        [crumbIssuer.data.crumbRequestField]: crumbIssuer.data.crumb
      },
    });

    /**
     * headers: {
     *  Cookie: "JSESSIONID.xyz.node0; Path=/; Secure; HttpOnly",
     *  string-string: "string"
     * }
     */

    return res.data
  } catch (e) {
    console.log(e)
  }
};

async function init() {
  const crumbIssuer = await getCrumb()
  /**
   *  
   * 
   * headers: {
      'set-cookie': [
        'JSESSIONID.xyz.node0; Path=/; Secure; HttpOnly'
      ],
    },
   * data: {
      _class: 'hudson.security.csrf.DefaultCrumbIssuer',
      crumb: 'string',
      crumbRequestField: 'string-string'
    }
   */
  const token = await generateToken({ crumbIssuer })

  console.log(token)
}


init().catch((e) => console.error(e))