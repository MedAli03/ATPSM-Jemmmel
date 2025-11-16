import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "ATPSM - Mobile" }}
      />
    </Stack.Navigator>
  );
};

const HomeScreen = () => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text>Bienvenue sur l’app mobile ATPSM 👋</Text>
  </View>
);
