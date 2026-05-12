package com.smsreceiverapp;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.util.Log;
import android.os.Bundle;

public class MyNotificationListener extends NotificationListenerService {
    private static final String TAG = "SMS_MONITOR_LOG";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        Notification notification = sbn.getNotification();
        Bundle extras = notification.extras;

        String title = extras.getString(Notification.EXTRA_TITLE);
        CharSequence textChar = extras.getCharSequence(Notification.EXTRA_TEXT);
        String text = (textChar != null) ? textChar.toString() : "";

        Log.d(TAG, "🔔 Notification captured: [" + packageName + "] " + title + " : " + text);

        // 특정 패키지(메시지 앱, 카드사 앱 등) 필터링 (필요 시)
        // 현재는 모든 알림에 대해 로그를 남기고 서버 전송을 시도합니다.
        if (text != null && !text.isEmpty()) {
            // 기존 SMS 전송 로직 재활용
            SmsReceiverModule.sendSmsToServer(this, title != null ? title : packageName, text);
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // 알림이 지워졌을 때의 동작 (필요 시)
    }
}
