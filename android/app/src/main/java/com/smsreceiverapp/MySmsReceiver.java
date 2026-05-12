package com.smsreceiverapp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class MySmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SMS_RECEIVER";

    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            try {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus == null) return;

                for (Object pdu : pdus) {
                    SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);
                    String sender = sms.getOriginatingAddress();
                    String message = sms.getMessageBody();
                    
                    Log.d(TAG, "📢 SMS 수신됨! 발신자: " + sender + ", 내용: " + message);

                    // 1. JS로 이벤트 전송 (앱이 열려있을 때 UI 업데이트용)
                    SmsReceiverModule.sendSmsToJs(sender, message);

                    // 2. 서버로 직접 전송 (백그라운드 안정성 확보)
                    // 앱이 죽어있어도 context를 통해 서버에 API 호출 및 로컬 로그 기록 수행
                    SmsReceiverModule.sendSmsToServer(context, sender, message);
                }
            } catch (Exception e) {
                Log.e(TAG, "Exception: " + e.getMessage());
            }
        }
    }
}
