import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Home from "../screens/Home";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Detail from "../screens/Detail";
import Favorites from "../screens/Favorites";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Profile from "../screens/Profile";
import EditProfile from "../screens/EditProfile";
import ManageAddresses from "../screens/ManageAddresses";
import AddEditAddress from "../screens/AddEditAddress";
import Chat from "../screens/Chat";
import Conversation from "../screens/Conversation";
import MyOrders from "../screens/MyOrders";
import OrderDetail from "../screens/OrderDetail";
import Checkout from "../screens/Checkout";
import SellerOrders from "../screens/SellerOrders";
import Cart from '../screens/Cart';
import CreateProduct from "../screens/CreateProduct";
import PaymentSuccess from "../screens/PaymentSuccess";
import PaymentCancel from "../screens/PaymentCancel";
import MyPost from "../screens/MyPost";
import SellerListingDetail from "../screens/SellerListingDetail";
import Notifications from "../screens/Notifications";
import AddToCartExample from "../screens/AddToCartExample";
import Report from "../screens/Report";
import MyInspections from "../screens/MyInspections";
import InspectorDashboard from "../screens/inspector/InspectorDashboard";
import InspectionDetail from "../screens/inspector/InspectionDetail";
import ShipmentTracking from "../screens/ShipmentTracking";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../provider/AppProvider";
import { View, Pressable, ActivityIndicator } from "react-native";
import * as Linking from 'expo-linking';

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

// Deep linking configuration cho Expo Go
const linking = {
  prefixes: [
    'biketrade://',
    'exp://192.168.2.4:8081/--/',
    'exp://10.87.46.68:8081/--/', 
    'exp://192.168.2.6:8081/--/',
    'exp://192.168.100.150:8081/--/',// Thay IP của bạn
    Linking.createURL('/'),
  ],
  config: {
    screens: {
      MainApp: {
        screens: {
          Home: 'home',
          Favorites: 'favorites',
          Chat: 'chat',
          Profile: 'profile',
        }
      },
      PaymentSuccess: {
        path: 'payment/success',
        parse: {
          orderId: (orderId) => orderId,
          orderCode: (orderCode) => orderCode,
        }
      },
      PaymentCancel: {
        path: 'payment/cancel',
        parse: {
          orderId: (orderId) => orderId,
        }
      },
      Detail: 'detail/:listingId',
      OrderDetail: 'order/:orderId',
      Checkout: 'checkout',
      Cart: 'cart',
    }
  }
};

// Guest Bottom Tabs (Home only, with login prompts on other tabs)
const GuestTabs = () => {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "LoginTab") iconName = "login";

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#359EFF",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 64,
          paddingBottom: 8,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tabs.Screen name="Home" component={Home} options={{ title: "Home", headerShown: true }} />
      <Tabs.Screen
        name="LoginTab"
        component={Login}
        options={{ title: "Login" }}
      />
    </Tabs.Navigator>
  );
};

// Main User Tabs (logged in)
const MainTabs = () => {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Cart") {
            iconName = "cart";
          } else if (route.name === "Chat") {
            iconName = "chat";
          } else if (route.name === "Profile") {
            iconName = "account";
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
              style={{ fontVariationSettings: focused ? "'FILL' 1" : "'FILL' 0" }}
            />
          );
        },
        tabBarActiveTintColor: "#359EFF",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 64,
          paddingBottom: 8,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="Cart"
        component={Cart}
        options={{ title: "Cart", headerShown: false }}
      />
      <Tabs.Screen
        name="Chat"
        component={Chat}
        options={{ title: "Messages" }}
      />
      <Tabs.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profile" }}
      />
    </Tabs.Navigator>
  );
};

// Inspector Tabs (role_id === 2)
const InspectorTabs = () => {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "InspectorDashboard") iconName = "clipboard-check-outline";
          else if (route.name === "InspectorProfile") iconName = "account";
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#359EFF",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 64,
          paddingBottom: 8,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="InspectorDashboard"
        component={InspectorDashboard}
        options={{ title: "Inspection" }}
      />
      <Tabs.Screen
        name="InspectorProfile"
        component={InspectorProfile}
        options={{ title: "Profile" }}
      />
    </Tabs.Navigator>
  );
};

const RootNavigation = () => {
  const { isAuthenticated, authLoading, user } = useAppContext();

  const isInspector = isAuthenticated && user?.role_id === 2;

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#359EFF" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Guest
          <>
            <Stack.Screen name="GuestMain" component={GuestTabs} />
            <Stack.Screen name="Detail" component={Detail} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : isInspector ? (
          // Inspector (role_id === 2)
          <>
            <Stack.Screen name="InspectorApp" component={InspectorTabs} />
            <Stack.Screen name="InspectionDetail" component={InspectionDetail} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Notifications" component={Notifications} />
          </>
        ) : (
          // User (role_id === 1)
          <>
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen name="Detail" component={Detail} />
            <Stack.Screen name="CreateProduct" component={CreateProduct} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="ManageAddresses" component={ManageAddresses} />
            <Stack.Screen name="AddEditAddress" component={AddEditAddress} />
            <Stack.Screen name="ChatDetail" component={Chat} />
            <Stack.Screen name="Conversation" component={Conversation} />
            <Stack.Screen name="MyOrders" component={MyOrders} />
            <Stack.Screen name="OrderDetail" component={OrderDetail} />
            <Stack.Screen name="Checkout" component={Checkout} />
            <Stack.Screen name="Favorites" component={Favorites} />
            <Stack.Screen name="SellerOrders" component={SellerOrders} />
            <Stack.Screen name="MyPost" component={MyPost} />
            <Stack.Screen name="SellerListingDetail" component={SellerListingDetail} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="AddToCartExample" component={AddToCartExample} />
            <Stack.Screen name="Report" component={Report} />
            <Stack.Screen name="MyInspections" component={MyInspections} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
            <Stack.Screen name="PaymentCancel" component={PaymentCancel} />
            <Stack.Screen name="ShipmentTracking" component={ShipmentTracking} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
