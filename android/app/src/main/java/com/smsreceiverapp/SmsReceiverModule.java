package com.smsreceiverapp;

import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public SmsReceiverModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "SmsReceiver";
    }

    // 예: JS로 이벤트 전송하는 메서드
    public static void sendSmsToJs(String sender, String message) {
        WritableMap map = Arguments.createMap();
        map.putString("sender", sender);
        map.putString("message", message);

        Log.d("SMS_RECEIVER", "here is sendSmsToJs >>> " + sender + " Msg is >>> " + message);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("SmsReceived", map);
    }

    public static void sendSmsToServer(String sender, String message) {
        OkHttpClient client = new OkHttpClient();

        MediaType JSON = MediaType.get("application/json; charset=utf-8");

        String json = "{"
                + "\"sender\":\"" + sender + "\","
                + "\"message\":\"" + message + "\""
                + "}";

        RequestBody body = RequestBody.create(json, JSON);

        Request request = new Request.Builder()
                .url("http://192.168.0.4:8080/api/sms") // 여기에 서버 주소 입력
                .post(body)
                .build();

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    Log.d("SMS_POST", "성공: " + response.body().string());
                } else {
                    Log.e("SMS_POST", "실패: " + response.code());
                }
            } catch (Exception e) {
                Log.e("SMS_POST", "오류 발생", e);
            }
        }).start(); // 네트워크 요청은 반드시 백그라운드에서 실행해야 함
    }
}