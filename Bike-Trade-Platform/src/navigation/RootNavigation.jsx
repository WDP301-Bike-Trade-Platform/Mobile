import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Home from "../screens/Home";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Detail from "../screens/Detail";
import Favorites from "../screens/Favorites";
import Login from "../screens/Login";
import Register from "../screens/Register";
import OTPVerification from "../screens/OTPVerification";
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
import CartCheckout from "../screens/CartCheckout";
import Cart from '../screens/Cart';
import CreateProduct from "../screens/CreateProduct";
import PaymentSuccess from "../screens/PaymentSuccess";
import PaymentCancel from "../screens/PaymentCancel";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../provider/AppProvider";
import { View, Pressable, ActivityIndicator } from "react-native";

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

const BottomTabs = ({ isAuthenticated }) => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Favorites") {
              iconName = "heart";
            } else if (route.name === "Chat") {
              iconName = "chat";
            } else if (route.name === "Profile") {
              iconName = "account";
            } else if (route.name === "Login") {
              iconName = "login";
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={color}
                style={{ fontVariationSettings: focused ? "'FILL' 1" : "'FILL' 0" }}
              />
            );
          },
          tabBarActiveTintColor: "#389cfa",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            height: 64,
            paddingBottom: 8,
            position: "relative",
          },
          headerShown: false,
        })}
      >
        <Tabs.Screen
          name="Home"
          component={Home}
          options={{ title: "Home", headerShown: true }}
        />
        {isAuthenticated && (
          <Tabs.Screen
            name="Favorites"
            component={Favorites}
            options={{ title: "Wishlist" }}
          />
        )}
        {/* Create Product button (placeholder - no screen here) */}
        {isAuthenticated && (
          <Tabs.Screen
            name="CreatePlaceholder"
            options={{
              title: "Create",
              tabBarButton: ({ navigation: navProp }) => (
                <Pressable
                  onPress={() => navigation.navigate("CreateProduct")}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: "#359EFF",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={28} color="#fff" />
                  </View>
                </Pressable>
              ),
            }}
          >
            {() => null}
          </Tabs.Screen>
        )}
        {isAuthenticated && (
          <Tabs.Screen
            name="Chat"
            component={Chat}
            options={{ title: "Messages" }}
          />
        )}
        {isAuthenticated && (
          <Tabs.Screen
            name="Profile"
            component={Profile}
            options={{ title: "Profile" }}
          />
        )}
        {!isAuthenticated && (
          <Tabs.Screen
            name="Login"
            component={Login}
            options={{ title: "Login" }}
          />
        )}
      </Tabs.Navigator>
    </View>
  );
};

const RootNavigation = () => {
  const { isAuthenticated, authLoading } = useAppContext();

  // Cấu hình Deep Linking cho PayOS
  const linking = {
    prefixes: ['biketrade://'],
    config: {
      screens: {
        MainApp: {
          screens: {
            Home: 'home',
            Favorites: 'favorites',
            Chat: 'chat',
            Profile: 'profile',
          },
        },
        PaymentSuccess: 'payment/success',
        PaymentCancel: 'payment/cancel',
        OrderDetail: 'order/:orderId',
        Detail: 'listing/:listingId',
      },
    },
  };

  if (authLoading) {
    return (
      <NavigationContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#359EFF" />
        </View>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="MainApp"
          children={() => <BottomTabs isAuthenticated={isAuthenticated} />}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerification}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateProduct"
          component={CreateProduct}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageAddresses"
          component={ManageAddresses}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddEditAddress"
          component={AddEditAddress}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ChatDetail"
          component={Chat}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Conversation"
          component={Conversation}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MyOrders"
          component={MyOrders}
          options={{
            headerShown: false,
          }}
        />        
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetail}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Checkout"
          component={Checkout}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SellerOrders"
          component={SellerOrders}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CartCheckout"
          component={CartCheckout}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Cart"
          component={Cart}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccess}
          options={{
            headerShown: false,
            title: "Thanh toán thành công",
          }}
        />
        <Stack.Screen
          name="PaymentCancel"
          component={PaymentCancel}
          options={{
            headerShown: false,
            title: "Thanh toán bị hủy",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
