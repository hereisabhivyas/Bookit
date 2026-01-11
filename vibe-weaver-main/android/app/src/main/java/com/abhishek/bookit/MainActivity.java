package com.abhishek.bookit;

import android.content.Intent;
import android.os.Build;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;
import com.getcapacitor.Plugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import android.util.Log;

public class MainActivity extends BridgeActivity {
    private static final int RC_SIGN_IN = 9001;
    private GoogleSignInClient mGoogleSignInClient;
    private static final String TAG = "GoogleSignIn";
    private Bridge bridge;

    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bridge = this.getBridge();
        // Register the native GoogleSignIn plugin so JS can call it
        registerPlugin(GoogleSignInPlugin.class);
        initializeGoogleSignIn();
    }

    private void initializeGoogleSignIn() {
        // Configure Google Sign-In
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .requestIdToken(getResources().getString(R.string.default_web_client_id))
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                handleSignInSuccess(account);
            } catch (ApiException e) {
                Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
                handleSignInFailure(e);
            }
        }
    }

    private void handleSignInSuccess(GoogleSignInAccount account) {
        Log.d(TAG, "firebaseAuthWithGoogle:" + account.getId());
        String idToken = account.getIdToken();
        String email = account.getEmail();
        String displayName = account.getDisplayName();

        // Send this to your JavaScript via a bridge call
        String js = "window.handleGoogleSignInSuccess && window.handleGoogleSignInSuccess({" +
                "idToken: '" + (idToken != null ? idToken : "") + "', " +
                "email: '" + (email != null ? email : "") + "', " +
                "displayName: '" + (displayName != null ? displayName : "") + "'" +
                "})";
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.evaluateJavascript(js, null);
            }
        }
    }

    private void handleSignInFailure(Exception e) {
        Log.d(TAG, "signInFailed:" + e.getMessage());
        String js = "window.handleGoogleSignInFailure && window.handleGoogleSignInFailure({error: '" + e.getMessage() + "'})";
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.evaluateJavascript(js, null);
            }
        }
    }

    public void startGoogleSignIn() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }
}

