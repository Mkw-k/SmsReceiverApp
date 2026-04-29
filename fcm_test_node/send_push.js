const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = '/Users/mkw111/Desktop/project/SmsMonitor/src/main/resources/smsmonitorweb-firebase.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const registrationToken = 'dB6lfTbjTiSpcLL68fPPD5:APA91bEcq_FqNkwVSRiIC-oJ2uvzgGanSnBSgl110kPEsfq3bZr3rsSGOYJJXTBnA7kRjIvBMYR4-QC-Rv-B-iWGp7BnDx3WOgC98-NdElX6Rhl70HXYeNI';

const message = {
  notification: {
    title: 'Gemini 최종 확인 알림',
    body: 'Node.js 스크립트를 통해 보낸 푸시입니다! 성공했다면 iOS로 넘어갑니다.'
  },
  token: registrationToken
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
    process.exit(1);
  });
