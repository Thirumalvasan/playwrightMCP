// export const loginData = {
//  // baseUrl: 'https://swtest.craftsmanautomation.com:8090/pernord-test-web/',
//  baseUrl : 'https://localhost:8016/',
//   //baseUrl: 'http://192.168.221.55:8016/',
//   username: 'admin',
//   password: process.env.PW_TEST_PASSWORD || 'Sft@Cal',
//   validPassword: process.env.PW_TEST_PASSWORD || 'Sft@Cal',
//   validUsername: 'admin',
//   invalidPassword: 'WrongPass123!',
//   invalidUsername: 'dummyUser',
//   caseUsernames: ['ADMIN', 'Admin', 'admin', 'AdMiN'],
//   firstTimeUser: 'thiru',
//   firstTimePassword: 'Thiru@4321',


// };


// testData/loginData.ts
import { getConfig, getCurrentProject } from '../utils/configLoader';

const currentProject = getCurrentProject();
const config = getConfig(currentProject);

export const loginData = {
  project: currentProject,
  baseUrl: config.baseURL,
  username: config.credentials.username,
  password: config.credentials.password,
  validPassword: config.credentials.password,
  validUsername: config.credentials.username,
  invalidPassword: 'WrongPass123!',
  invalidUsername: 'dummyUser',
  caseUsernames: ['ADMIN', 'Admin', 'admin', 'AdMiN'],
  firstTimeUser: config.credentials.firstTimeUser,
  firstTimePassword: config.credentials.firstTimePassword,
};