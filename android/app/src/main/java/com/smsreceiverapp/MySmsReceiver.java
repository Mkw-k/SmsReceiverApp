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
                    Log.d("SMS_RECEIVER", "From: " + sender + " Msg: " + message);

                    // 🔽 여기 수정!
                    // "입금"이라는 단어가 포함된 메시지만 처리
                    if (message != null && (message.contains("NH카드") || message.contains("KB국민카드") || message.contains("Hyundai") || message.contains("현대카드"))) {
                        SmsReceiverModule.sendSmsToJs(sender, message);
                        SmsReceiverModule.sendSmsToServer(context, sender, message);
                    }

                }
            } catch (Exception e) {
                Log.e("SMS_RECEIVER", "Exception: " + e.getMessage());
            }
        }
    }
}