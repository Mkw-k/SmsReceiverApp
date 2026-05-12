package com.smsreceiverapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;
import android.content.ComponentName;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;
import org.json.JSONException;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String API_HOST = "https://www.save-time.kro.kr/sms-monitor";
    private static final String TAG = "SMS_MONITOR_LOG";

    public SmsReceiverModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    private static void writeLogToFile(Context context, String logMessage) {
        if (context == null) return;
        try {
            File logFile = new File(context.getExternalFilesDir(null), "sms_app_logs.txt");
            if (!logFile.exists()) {
                logFile.createNewFile();
            }
            String timeStamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.KOREA).format(new Date());
            BufferedWriter writer = new BufferedWriter(new FileWriter(logFile, true));
            writer.append("[" + timeStamp + "] " + logMessage);
            writer.newLine();
            writer.close();
            Log.d(TAG, "Log written to: " + logFile.getAbsolutePath());
        } catch (IOException e) {
            Log.e(TAG, "Failed to write log to file", e);
        }
    }

    @Override
    public String getName() {
        return "SmsReceiver";
    }

    @ReactMethod
    public void saveToken(String token) {
        if (reactContext == null) return;
        SharedPreferences prefs = reactContext.getSharedPreferences("SmsAppPrefs", Context.MODE_PRIVATE);
        prefs.edit().putString("auth_token", token).apply();
        Log.d(TAG, "Token saved to SharedPreferences: " + token);
        writeLogToFile(reactContext, "Token updated");
    }

    @ReactMethod
    public void isNotificationListenerEnabled(Promise promise) {
        if (reactContext == null) {
            promise.resolve(false);
            return;
        }
        String pkgName = reactContext.getPackageName();
        final String flat = Settings.Secure.getString(reactContext.getContentResolver(), "enabled_notification_listeners");
        if (!TextUtils.isEmpty(flat)) {
            final String[] names = flat.split(":");
            for (int i = 0; i < names.length; i++) {
                final ComponentName cn = ComponentName.unflattenFromString(names[i]);
                if (cn != null) {
                    if (TextUtils.equals(pkgName, cn.getPackageName())) {
                        promise.resolve(true);
                        return;
                    }
                }
            }
        }
        promise.resolve(false);
    }

    @ReactMethod
    public void openNotificationListenerSettings() {
        if (reactContext == null) return;
        Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    public static void sendSmsToJs(String sender, String message) {
        if (reactContext == null) {
            Log.e(TAG, "reactContext is null, cannot emit event to JS");
            return;
        }
        
        WritableMap params = Arguments.createMap();
        params.putString("sender", sender);
        params.putString("message", message);

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("SmsReceived", params);
    }

    public static void sendSmsToServer(Context context, String sender, String message) {
        doSend(context, sender, message);
    }

    private static OkHttpClient getUnsafeOkHttpClient() {
        try {
            final TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
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

            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

            OkHttpClient.Builder builder = new OkHttpClient.Builder();
            builder.sslSocketFactory(sslSocketFactory, (X509TrustManager) trustAllCerts[0]);
            builder.hostnameVerifier(new HostnameVerifier() {
                @Override
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            });

            builder.connectTimeout(15, TimeUnit.SECONDS);
            builder.writeTimeout(15, TimeUnit.SECONDS);
            builder.readTimeout(15, TimeUnit.SECONDS);

            return builder.build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static void doSend(Context context, String sender, String message) {
        if (context == null) {
            Log.e(TAG, "Context is null. Cannot send SMS to server.");
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences("SmsAppPrefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);

        Log.d(TAG, "================ 알림/SMS 전송 시작 ================");
        writeLogToFile(context, "START: FROM " + sender + " | Content: " + message);

        OkHttpClient client = getUnsafeOkHttpClient();
        final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");

        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("sender", sender);
            jsonObject.put("message", message);
        } catch (JSONException e) {
            Log.e(TAG, "JSON 생성 에러", e);
            writeLogToFile(context, "ERROR: JSON creation failed");
            return;
        }

        String jsonBody = jsonObject.toString();
        RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);
        Request.Builder requestBuilder = new Request.Builder()
                .url(API_HOST + "/api/transactions/sms")
                .post(body);

        if (token != null) {
            requestBuilder.addHeader("Authorization", "Bearer " + token);
        }

        final Request request = requestBuilder.build();

        new Thread(() -> {
            try {
                try (Response response = client.newCall(request).execute()) {
                    String responseBody = response.body() != null ? response.body().string() : "null";
                    Log.d(TAG, "Server Response Status: " + response.code());
                    if (response.isSuccessful()) {
                        Log.i(TAG, "결과: 전송 성공 ✅");
                        writeLogToFile(context, "SUCCESS: Server responded " + response.code());
                    } else {
                        Log.e(TAG, "결과: 전송 실패 ❌ (" + response.code() + ")");
                        writeLogToFile(context, "FAILED: Server error " + response.code() + " | Body: " + responseBody);
                    }
                }
            } catch (IOException e) {
                Log.e(TAG, "네트워크 오류 발생", e);
                writeLogToFile(context, "NETWORK ERROR: " + e.getMessage());
            }
        }).start();
    }
}
