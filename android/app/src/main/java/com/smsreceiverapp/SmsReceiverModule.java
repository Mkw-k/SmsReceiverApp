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
import org.json.JSONObject; // ⭐ 이 import가 필요합니다 (안드로이드 기본 내장)
import org.json.JSONException;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private final String API_HOST = "http://192.168.0.4:8080";

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
        MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");

        // ✅ 수정된 부분: JSONObject를 사용하여 안전하게 JSON 생성
        JSONObject jsonObject = new JSONObject();
        try {
            // 서버 DTO의 필드명과 맞춰주세요 (예: content라면 "content"로)
            jsonObject.put("sender", sender);
            jsonObject.put("message", message); // 여기서 줄바꿈 문자를 자동으로 \n으로 바꿔줍니다!
        } catch (JSONException e) {
            Log.e("SMS_JSON", "JSON 생성 실패", e);
            return;
        }

        String jsonBody = jsonObject.toString();
        // Log.d("SMS_DEBUG", "전송할 JSON: " + jsonBody); // 디버깅용 로그

        RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

        Request request = new Request.Builder()
                .url(API_HOST + "/api/transactions/sms")
                .post(body)
                .build();

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    Log.d("SMS_POST", "성공: " + response.body().string());
                } else {
                    Log.e("SMS_POST", "실패: 코드=" + response.code() + ", 메시지=" + response.message());
                }
            } catch (Exception e) {
                Log.e("SMS_POST", "오류 발생", e);
            }
        }).start();
    }
}