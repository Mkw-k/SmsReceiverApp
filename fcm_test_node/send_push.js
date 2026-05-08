const admin = require('firebase-admin');
const serviceAccount = require('/Users/mkw111/Desktop/project/SmsMonitor/src/main/resources/smsmonitorweb-firebase.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const registrationToken = 'dB6lfTbjTiSpcLL68fPPD5:APA91bEcq_FqNkwVSRiIC-oJ2uvzgGanSnBSgl110kPEsfq3bZr3rsSGOYJJXTBnA7kRjIvBMYR4-QC-Rv-B-iWGp7BnDx3WOgC98-NdElX6Rhl70HXYeNI';

const message = {
  notification: {
    title: '🤖 Android 검증 성공!',
    body: '백엔드에서 발송한 안드로이드 푸시가 정상입니다.'
  },
  token: registrationToken
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
