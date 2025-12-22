export const loginData = {
  baseUrl: 'https://swtest.craftsmanautomation.com:8090/pernord-test-web/',
 // baseUrl : 'https://localhost:3000/',
  //baseUrl: 'http://192.168.221.55:8016/',
  username: 'admin',
  password: process.env.PW_TEST_PASSWORD || 'sft@cal',
  validPassword: process.env.PW_TEST_PASSWORD || 'sft@cal',
  validUsername: 'admin',
  invalidPassword: 'WrongPass123!',
  invalidUsername: 'dummyUser',
  caseUsernames: ['ADMIN', 'Admin', 'admin', 'AdMiN'],
  firstTimeUser: 'thiru',
  firstTimePassword: 'Thiru@4321',


};
