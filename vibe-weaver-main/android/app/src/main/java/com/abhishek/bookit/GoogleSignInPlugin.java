package com.abhishek.bookit;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GoogleSignIn")
public class GoogleSignInPlugin extends Plugin {

    @PluginMethod
    public void signIn(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        if (activity != null) {
            activity.startGoogleSignIn();
            call.resolve();
        } else {
            call.reject("Activity not found");
        }
    }
}
