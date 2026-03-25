package com.smsreceiverapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;
import org.json.JSONException;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String API_HOST = "http://10.0.2.2:8080";
    private static final String TAG = "SMS_MONITOR_LOG";

    public SmsReceiverModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "SmsReceiver";
    }

    // JS로 이벤트를 보내 화면에 알림을 띄우는 메서드 (수정됨)
    public static void sendSmsToJs(String sender, String message) {
        if (reactContext == null) {
            Log.e(TAG, "reactContext is null, cannot emit event to JS");
            return;
        }
        
        WritableMap params = Arguments.createMap();
        params.putString("sender", sender);
        params.putString("message", message);

        // RCTDeviceEventEmitter를 사용하여 이벤트 전송
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("SmsReceived", params);
    }

    // 서버로 전송하는 메서드 (Context 포함된 호출부 대응)
    public static void sendSmsToServer(Context context, String sender, String message) {
        doSend(sender, message);
    }

    private static void doSend(String sender, String message) {
        if (reactContext == null) {
            Log.e(TAG, "ReactContext is null. Cannot send SMS to server.");
            return;
        }

        SharedPreferences prefs = reactContext.getSharedPreferences("SmsAppPrefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);

        Log.d(TAG, "================ SMS 전송 시작 ================");
        Log.d(TAG, "[1] 수신된 SMS 정보 - 발신자: " + sender + ", 내용: " + message);

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build();

        final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");

        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("sender", sender);
            jsonObject.put("message", message);
        } catch (JSONException e) {
            Log.e(TAG, "JSON 생성 에러", e);
            return;
        }

        String jsonBody = jsonObject.toString();
        Log.d(TAG, "[2] 전송 Payload (JSON): " + jsonBody);

        RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);
        Request.Builder requestBuilder = new Request.Builder()
                .url(API_HOST + "/api/transactions/sms")
                .post(body);

        if (token != null) {
            Log.d(TAG, "[3] 전송 Header (Token): Bearer " + token);
            requestBuilder.addHeader("Authorization", "Bearer " + token);
        } else {
            Log.w(TAG, "[3] 전송 Header: 토큰 없음");
        }

        final Request request = requestBuilder.build();

        new Thread(() -> {
            try {
                try (Response response = client.newCall(request).execute()) {
                    String responseBody = response.body() != null ? response.body().string() : "null";
                    Log.d(TAG, "---------------- 서버 응답 ----------------");
                    Log.d(TAG, "Status Code: " + response.code());
                    Log.d(TAG, "Response Body: " + responseBody);
                    if (response.isSuccessful()) {
                        Log.i(TAG, "결과: 전송 성공 ✅");
                    } else {
                        Log.e(TAG, "결과: 전송 실패 ❌ (에러 코드: " + response.code() + ")");
                    }
                    Log.d(TAG, "==========================================");
                }
            } catch (IOException e) {
                Log.e(TAG, "네트워크 오류 발생", e);
            }
        }).start();
    }
}
