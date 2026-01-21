import { createStackNavigator } from "@react-navigation/stack";
import Home from "../screens/Home";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Detail from "../screens/Detail";
import Favorites from "../screens/Favorites";

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Favorites" component={Favorites} />
    </Tabs.Navigator>
  );
};

const RootNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={BottomTabs}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Detail" component={Detail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
