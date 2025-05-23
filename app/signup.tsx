import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  StatusBar,
  Platform,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStyles } from "../theme"; // Import the custom theme hook
import { supabase } from "../lib/supabaseClient";
import * as Font from "expo-font";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Signup() {
  const router = useRouter();
  const styles = useThemeStyles(); // Get dynamic styles based on the theme

  const loadFonts = async () => {
      await Font.loadAsync({
      "Century-Gothic": require("../assets/fonts/centurygothic.ttf"),
      "Century-Gothic-Bold": require("../assets/fonts/centurygothic_bold.ttf"),
      });
    };
  
    useEffect(() => {
        loadFonts();
    }, []);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSignup = async () => {
    try {
        console.log("Signup process started");
        console.log("Form values - Name:", name, "Email:", email);

        if (!email || !password || !name) {
            Alert.alert("Validation Error", "Please fill in all required fields including your full name.");
            console.log("Validation error: Missing required fields");
            return;
        }

        setLoading(true);
        
        console.log("Calling Supabase signUp...");
        let signUpResponse;
        try {
            signUpResponse = await supabase.auth.signUp({ email, password });
        } catch (supabaseError) {
            console.error("Supabase signUp threw an error:", supabaseError);
            throw new Error("Unexpected error during sign-up");
        }

        console.log("Signup Response:", signUpResponse);

        if (!signUpResponse || typeof signUpResponse !== "object") {
            throw new Error("Unexpected response format from Supabase.");
        }

        const { data, error } = signUpResponse;

        if (error) {
            console.error("Supabase signUp error:", error);
            Alert.alert("Signup Error", error.message || "An error occurred.");
            return;
        }

        if (!data?.user) {
            throw new Error("User data is missing from the response.");
        }

        const userId = data.user.id;
        console.log("User created with ID:", userId);
        
        // Just update the name field on the existing record
        console.log("Updating user name to:", name.trim());

        // Update the existing record with the name
        const { error: updateError } = await supabase
            .from("users")
            .update({ name: name.trim() })
            .eq('id', userId);

        console.log("Update Response:", updateError);

        if (updateError) {
            console.error("Supabase update error:", updateError);
            throw new Error(updateError.message);
        }

        console.log("User name successfully updated");

        Alert.alert("Success", "Account created successfully! Please check your email to confirm your account.");
        router.replace("/login");

    } catch (err: any) {
        console.error("Signup Error (outer catch):", err);
        Alert.alert("Signup Error", err.message || "An unexpected error occurred.");
    } finally {
        console.log("Signup process finished");
        setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar
        barStyle={styles.isDarkMode ? "light-content" : "light-content"}
        backgroundColor="transparent"
        translucent
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        extraScrollHeight={20} // Adds extra space between the input and the keyboard
        keyboardShouldPersistTaps="handled" // Allows dismissing the keyboard by tapping outside
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../assets/images/alumo-logo.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
          <TextInput
              ref={nameInputRef}
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={styles.placeholder.color}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={styles.placeholder.color}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={styles.placeholder.color}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
            />

            {/* Signup Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => router.push("/login")}
              >
                Log In
              </Text>
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}