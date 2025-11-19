import { Alert, Platform, ToastAndroid } from "react-native";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(title, message);
};

export const showSuccessMessage = (message: string, title = "تم") => {
  showMessage(title, message);
};

export const showErrorMessage = (message: string, title = "خطأ") => {
  showMessage(title, message);
};
