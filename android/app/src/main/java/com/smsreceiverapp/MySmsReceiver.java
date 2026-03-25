package com.smsreceiverapp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class MySmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle bundle = intent.getExtras();
        SmsMessage[] msgs = null;
        if (bundle != null) {
            try {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus == null) return;

                msgs = new SmsMessage[pdus.length];
                for (int i = 0; i < msgs.length; i++) {
                    msgs[i] = SmsMessage.createFromPdu((byte[]) pdus[i]);
                    String sender = msgs[i].getOriginatingAddress();
                    String message = msgs[i].getMessageBody();
                    
                    // 모든 SMS에 대해 무조건 로그 출력 (필터링 전)
                    Log.d("SMS_RECEIVER", "📢 SMS 수신됨! 발신자: " + sender + ", 내용: " + message);

                    // 테스트를 위해 일시적으로 필터링 조건 완화 (모든 문자 처리)
                    // if (message != null && (message.contains("NH카드") || message.contains("KB국민카드") || message.contains("Hyundai") || message.contains("현대카드"))) {
                        Log.d("SMS_RECEIVER", "✅ 필터 조건 통과 (또는 테스트 모드), JS로 이벤트 전송");
                        SmsReceiverModule.sendSmsToJs(sender, message);
                    // }
                }
            } catch (Exception e) {
                Log.e("SMS_RECEIVER", "Exception: " + e.getMessage());
            }
        }
    }
}