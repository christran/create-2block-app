import { Button, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home" }} />
      <View className="h-full w-full p-4">
        <Text className="pb-2 text-center text-7xl font-extrabold text-foreground">
          <Text className="text-primary">✌️BLOCK</Text>
        </Text>

        <View className="py-2">
          <Text className="font-medium text-primary text-center">
            The quick brown fox jumped over the lazy dog
          </Text>
        </View>

        <View className="py-24 items-center">
          <TouchableOpacity 
            className="bg-black px-24 py-3 rounded-md"
            accessibilityLabel="Click here to connect"
            activeOpacity={0.7}
          >
            <Text className="text-secondary font-bold">Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
