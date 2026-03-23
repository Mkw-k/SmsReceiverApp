package com.smsreceiverapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONObject;
import org.json.JSONException;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String API_HOST = "https://www.save-time.kro.kr/sms-monitor";
    private static final String PREFS_NAME = "SmsAppPrefs";
    private static final String KEY_TOKEN = "auth_token";

    public SmsReceiverModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "SmsReceiver";
    }

    // JS에서 로그인 성공 시 호출하여 토큰을 저장
    @ReactMethod
    public void saveToken(String token) {
        if (getReactApplicationContext() != null) {
            SharedPreferences prefs = getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_TOKEN, token).apply();
            Log.d("SMS_AUTH", "Token saved successfully");
        }
    }

    public static void sendSmsToJs(String sender, String message) {
        if (reactContext == null) {
            Log.w("SMS_RECEIVER", "reactContext is null, skipping JS event");
            return;
        }

        try {
            WritableMap map = Arguments.createMap();
            map.putString("sender", sender);
            map.putString("message", message);
            Log.d("SMS_RECEIVER", "Sending SMS to JS: " + sender);
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("SmsReceived", map);
        } catch (Exception e) {
            Log.e("SMS_RECEIVER", "Failed to send SMS to JS", e);
        }
    }

    public static void sendSmsToServer(Context context, String sender, String message) {
        Log.d("SMS_POST", "Starting server post for: " + sender);
        
        // SharedPreferences에서 토큰 읽기
        String token = null;
        if (context != null) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            token = prefs.getString(KEY_TOKEN, null);
        }

        OkHttpClient client;
        try {
            final javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[]{
                new javax.net.ssl.X509TrustManager() {
                    @Override
                    public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
                    @Override
                    public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
                    @Override
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return new java.security.cert.X509Certificate[]{};
                    }
                }
            };
            final javax.net.ssl.SSLContext sslContext = javax.net.ssl.SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            client = new OkHttpClient.Builder()
                .sslSocketFactory(sslContext.getSocketFactory(), (javax.net.ssl.X509TrustManager) trustAllCerts[0])
                .hostnameVerifier((hostname, session) -> true)
                .build();
        } catch (Exception e) {
            Log.e("SMS_POST", "Failed to create unsafe client", e);
            client = new OkHttpClient();
        }

        final OkHttpClient finalClient = client;
        final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");

        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("sender", sender);
            jsonObject.put("message", message);
        } catch (JSONException e) {
            Log.e("SMS_JSON", "JSON 생성 실패", e);
            return;
        }

        final String jsonBody = jsonObject.toString();
        RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

        Request.Builder requestBuilder = new Request.Builder()
                .url(API_HOST + "/api/transactions/sms")
                .post(body);

        // 헤더에 토큰 추가
        if (token != null) {
            Log.d("SMS_POST", "Adding Authorization header");
            requestBuilder.addHeader("Authorization", "Bearer " + token);
        } else {
            Log.w("SMS_POST", "No token found! Server might reject this request.");
        }

        final Request request = requestBuilder.build();

        new Thread(() -> {
            try {
                Log.d("SMS_POST", "Executing call to: " + API_HOST + "/api/transactions/sms");
                try (Response response = finalClient.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        Log.d("SMS_POST", "Server Success: " + (response.body() != null ? response.body().string() : "empty"));
                    } else {
                        Log.e("SMS_POST", "Server Failed: Code=" + response.code() + ", Msg=" + response.message());
                    }
                }
            } catch (Exception e) {
                Log.e("SMS_POST", "Server Connection Error", e);
            }
        }).start();
    }
}
