"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginData = void 0;
exports.loginData = {
    baseUrl: 'https://localhost:3000/',
    username: 'admin',
    password: process.env.PW_TEST_PASSWORD || 'Sft@Cal',
    validPassword: process.env.PW_TEST_PASSWORD || 'Sft@Cal',
    validUsername: 'admin',
    invalidPassword: 'WrongPass123!',
    invalidUsername: 'dummyUser',
    caseUsernames: ['ADMIN', 'Admin', 'admin', 'AdMiN'],
    firstTimeUser: 'thiru',
    firstTimePassword: 'Thiru@4321',
};
//# sourceMappingURL=loginData.js.map