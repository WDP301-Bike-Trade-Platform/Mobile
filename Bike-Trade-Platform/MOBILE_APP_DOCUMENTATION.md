# 📱 BIKE TRADE PLATFORM - MOBILE APP CODE REVIEW GUIDE

**Last Updated:** April 2026  
**Version:** 1.0  
**Framework:** React Native + Expo

---

## 📑 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Directory Structure](#directory-structure)
4. [Core Architecture](#core-architecture)
5. [Screens/Pages Detailed Breakdown](#screenspages-detailed-breakdown)
6. [Components Library](#components-library)
7. [Services & API Integration](#services--api-integration)
8. [State Management](#state-management)
9. [Navigation Flow](#navigation-flow)
10. [Key Features & Implementation](#key-features--implementation)
11. [Authentication System](#authentication-system)
12. [Real-time Features](#real-time-features)
13. [Data Flow Diagrams](#data-flow-diagrams)
14. [Error Handling](#error-handling)
15. [Performance Considerations](#performance-considerations)

---

## PROJECT OVERVIEW

### Purpose

**Bike Trade Platform** is a React Native mobile application that enables users to:

- **Buy:** Browse and purchase bikes from sellers
- **Sell:** List bikes for sale with detailed specifications
- **Chat:** Real-time messaging between buyers and sellers
- **Track Orders:** Monitor orders from purchase to delivery
- **Manage Shipments:** Support for buyer and seller shipment management
- **Inspect:** Request and manage bike inspection services

### User Roles

1. **Guest Users:** Can browse listings
2. **Buyers:** Purchase bikes, view orders, track shipments
3. **Sellers:** Create listings, manage orders, confirm shipments
4. **Inspectors:** Perform bike inspections and assessments

### Key Business Features

- **Order Management:** Complete order lifecycle (pending → confirmed → paid → shipped → delivered)
- **Payment Integration:** Multiple payment methods with order escrow
- **Shipment Tracking:** Real-time tracking and delivery status
- **Chat System:** Buyer-seller communication with image support
- **Wishlist/Favorites:** Save bikes for later purchase
- **Bidding/Offers:** Negotiation between buyers and sellers
- **Platform Fees & Deposits:** Configurable platform charges

---

## TECH STACK & DEPENDENCIES

### Core Framework

```
React Native 0.81.5        → Mobile UI framework
React 19.1.0               → Component library
Expo ~54.0.31              → Development & build platform
TypeScript                 → Code typing (tsconfig)
```

### State Management & Storage

```
@reduxjs/toolkit ^2.11.2   → Cart state management (complex operations)
React Context API          → Auth, Settings, Favorites (simpler states)
AsyncStorage ^2.1.2        → Local persistent storage (auth tokens, data cache)
```

### Navigation & Communication

```
React Navigation ~7.x      → Screen navigation & routing
react-native-safe-area-context → Safe area handling
socket.io-client ^4.8.3    → Real-time messaging (chat)
axios ^1.10.0              → HTTP requests with interceptors
```

### Cloud & Media

```
supabase ^2.93.2           → Image storage & database (managed mode)
expo-image-picker          → Camera & photo library access
react-native-svg           → SVG rendering
```

### UI & Icons

```
@expo/vector-icons         → Material Design icons
react-native-gesture-handler → Touch gesture support
react-native-pager-view    → Swipe navigation
react-native-tab-view      → Tabbed interfaces
```

---

## DIRECTORY STRUCTURE

```
src/
│
├── 📄 App.js
│   └─ Entry point with provider hierarchy setup
│
├── component/
│   ├─ HeaderBar.jsx           → Reusable header with back button
│   ├─ CartItemCard.jsx        → Cart item display with quantity controls
│   ├─ StatusBadge.jsx         → Status indicator badges
│   ├─ FilterButtons.jsx       → Horizontal filter buttons
│   ├─ OrderCard.jsx           → Order summary card
│   ├─ EmptyState.jsx          → Placeholder for empty states
│   └─ DropDown.jsx            → Reusable dropdown selector
│
├── hooks/
│   ├─ useCart.js             → Redux cart management hook
│   └─ useChatSocket.js       → Socket.io chat connection hook
│
├── lib/
│   ├─ axios.js               → HTTP client with interceptors
│   └─ supabase.js            → Supabase client for storage
│
├── navigation/
│   └─ RootNavigation.jsx      → Navigation structure & routing
│
├── provider/
│   ├─ AppProvider.jsx         → Authentication context
│   ├─ PlatformSettingsProvider.jsx → Platform config
│   └─ StorageProvider.jsx     → Favorites/wishlist context
│
├── screens/
│   ├─ Home.jsx               → Main listing browse screen
│   ├─ Detail.jsx             → Single listing detail view
│   ├─ Cart.jsx               → Shopping cart
│   ├─ Checkout.jsx           → Checkout & address selection
│   ├─ Login.jsx              → Authentication
│   ├─ Register.jsx           → New user registration
│   ├─ Profile.jsx            → User profile dashboard
│   ├─ EditProfile.jsx        → Profile editing
│   ├─ Chat.jsx               → Conversation list
│   ├─ Conversation.jsx       → Real-time messaging
│   ├─ CreateProduct.jsx      → Seller create/edit listing
│   ├─ MyPost.jsx             → Seller's listings management
│   ├─ MyOrders.jsx           → Buyer's order history
│   ├─ OrderDetail.jsx        → Single order detail
│   ├─ SellerOrders.jsx       → Seller's incoming orders
│   ├─ PaymentSuccess.jsx     → Payment confirmation
│   ├─ PaymentCancel.jsx      → Payment failed screen
│   ├─ BuyerShipments.jsx     → Buyer shipment tracking
│   ├─ SellerShipmentManagement.jsx → Seller shipment ops
│   ├─ ShipmentTracking.jsx   → Shipment status tracking
│   ├─ MyInspections.jsx      → User's inspections
│   ├─ Favorites.jsx          → Wishlist/saved bikes
│   ├─ Report.jsx             → Report suspicious listing
│   ├─ Notifications.jsx      → Activity notification center
│   ├─ ManageAddresses.jsx    → Saved addresses list
│   ├─ AddEditAddress.jsx     → Add/edit addresses
│   └─ inspector/
│       ├─ InspectorDashboard.jsx
│       ├─ InspectionDetail.jsx
│       └─ InspectorProfile.jsx
│
├── services/
│   ├─ api.auth.js            → Login, register, OTP verification
│   ├─ api.products.js        → Fetch & manage product listings
│   ├─ api.cart.js            → Cart operations
│   ├─ api.order.js           → Order creation & management
│   ├─ api.payment.js         → Payment processing
│   ├─ api.shipment.js        → Shipment tracking
│   ├─ api.chat.js            → Chat message history
│   ├─ api.user.js            → User profile operations
│   ├─ api.address.js         → Address CRUD
│   ├─ api.wishlist.js        → Wishlist/favorites
│   ├─ api.inspector.js       → Inspection requests
│   ├─ api.offers.js          → Offer negotiation
│   ├─ api.notifications.js   → Notification fetching
│   ├─ api.supabase.js        → Image upload to Supabase
│   ├─ authStorage.js         → Token persistence
│   └─ [other services...]
│
├── store/
│   ├─ index.js               → Redux store configuration
│   └─ slices/
│       └─ cartSlice.js       → Redux cart state, reducers, thunks
│
└── utils/
    ├─ formatters.js          → Price, date, number formatting
    ├─ dateUtils.js           → Time-ago formatting
    ├─ profileCheck.js        → Profile completeness validation
    └─ [other utilities...]
```

---

## CORE ARCHITECTURE

### 1. **Provider Hierarchy** (Dependency Injection Pattern)

```
┌─────────────────────────────────────────────────────┐
│ ReduxProvider                                        │
│ ┌───────────────────────────────────────────────────┤
│ │ AppProvider (Auth Context)                        │
│ │ ┌─────────────────────────────────────────────────┤
│ │ │ PlatformSettingsProvider (Settings Context)     │
│ │ │ ┌───────────────────────────────────────────────┤
│ │ │ │ StorageProvider (Favorites Context)           │
│ │ │ │ ┌─────────────────────────────────────────────┤
│ │ │ │ │ RootNavigation (All Screens)                │
│ │ │ │ │                                             │
│ │ │ │ │ • All components have access to all contexts│
│ │ │ │ │ • Clean separation of concerns              │
│ │ │ │ │ • Single source of truth per domain         │
│ │ │ │ └─────────────────────────────────────────────┤
│ │ │ └───────────────────────────────────────────────┤
│ │ └─────────────────────────────────────────────────┤
│ └───────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────┘
```

### 2. **State Management Architecture**

**Where Each State Type Lives:**

| State Type       | Location                       | Use Case                                                     |
| ---------------- | ------------------------------ | ------------------------------------------------------------ |
| **Redux**        | `store/cartSlice.js`           | Complex cart operations, multiple thunks, optimistic updates |
| **Context**      | `AppProvider.jsx`              | Auth status, current user, logout action                     |
| **Context**      | `PlatformSettingsProvider.jsx` | Platform fees, deposits rates, config values                 |
| **Context**      | `StorageProvider.jsx`          | Wishlist items (simpler, single operations)                  |
| **AsyncStorage** | Device storage                 | Persistence layer (tokens, user ID, favorites array)         |
| **Socket.io**    | Real-time channel              | Chat messages, typing indicators                             |

### 3. **API Layer Design**

All API calls go through services that:

- Use centralized axios instance with auth interceptors
- Handle error responses with user alerts
- Return structured data or throw standardized errors
- Support cancel tokens for request cleanup
- Auto-refresh expired tokens (401 handling)

**Request/Response Flow:**

```
Component → Hook (useCart, etc.)
    ↓
Redux Thunk / Context Method
    ↓
Service Layer (api.*.js)
    ↓
Axios Instance
    ↓
Interceptor: Add Auth Token
    ↓
Backend API
    ↓
Response Interceptor: Handle 401/Refresh Token
    ↓
Component Updates State
```

---

## SCREENS/PAGES DETAILED BREAKDOWN

### **SHOPPING & BROWSING**

#### 1. **Home Screen** (`Home.jsx`)

```javascript
// Purpose: Main entry point - product browsing & discovery

Components:
- HeaderBar with search & notifications
- Category filter buttons (horizontal scroll)
- FlatList of bike listings with images
- Add to favorites toggle on each item
- Pull-to-refresh capability
- Loading indicator during fetch

State Management:
- Redux cart (global)
- AppContext for auth/user info
- Local state for filter, search, loading

API Calls:
- getProducts(limit, offset, category, search)  // Main listings
- getCategories()                                // Filter options
- fetchNotifications()                           // Notification count
- addToCart / addToWishlist (optional)          // Direct purchase

User Flows:
1. Guest User → Can browse listings (no chat)
2. Authenticated → Full features
3. Pull-to-refresh → Reloads listings
4. Tap listing → Navigate to Detail screen
5. Tap heart → Add to wishlist (StorageProvider)
```

#### 2. **Detail Screen** (`Detail.jsx`)

```javascript
// Purpose: Comprehensive listing details & purchase interaction

Components:
- Image carousel (swipe through bike photos)
- Listing title, price, description
- Bike specifications table
- Seller profile card with rating
- Condition badge (Approved/Pending/Rejected)
- Add to cart button
- Contact seller button (opens chat)
- Create offer button (negotiation)

State Management:
- Local state: loading, error, activeImageIndex
- Redux: Add to cart triggers redux action
- Context: Auth check for contact seller

API Calls:
- getProductById(productId)                     // Fetch full details
- createChat(sellerId, productId)               // Start conversation
- addToCart(productData)                        // Cart operation (Redux)

Key Features:
✓ Image carousel with pinch-to-zoom
✓ Product specifications dynamic rendering
✓ Real-time seller online status
✓ Recent reviews from other buyers
✓ Report suspicious listing option
```

#### 3. **Cart Screen** (`Cart.jsx`)

```javascript
// Purpose: View, modify, and manage shopping cart

Components:
- Header with cart count
- FlatList of CartItemCard components
- Each item shows: image, title, qty controls, price
- Total price calculation
- Checkout button
- Empty state when no items

State Management:
- Redux cart slice: items, total, itemCount, loading
- useCart hook provides all operations

Redux Actions:
- updateQuantity(cartItemId, newQty)
- removeFromCart(cartItemId)
- clearCart()

Key Features:
✓ Optimistic updates (immediate feedback)
✓ Persist cart on backend
✓ Item validation before checkout
✓ Quantity boundary checking (min 1, max stock)
✓ Swipe to remove item (gesture handler)
```

#### 4. **Checkout Screen** (`Checkout.jsx`)

```javascript
// Purpose: Final order creation with address & payment setup

Components:
- HeaderBar with back/title
- Address selector (dropdown/modal list)
- Add new address button
- Shipping method selector
- Order summary with itemized list
- Place order button

State Management:
- Local: selectedAddress, showAddressModal, loading
- Redux: cart items, totals
- Context: user, platformSettings

API Calls:
- getMyAddresses()                  // Fetch user addresses
- getDefaultAddress()               // Pre-select default
- createOrder(orderData)            // Create order in backend
- checkoutCart(...)                 // Convert cart to order

Order Data Sent:
{
  cartItems: [{cartItemId, quantity, price}],
  shippingAddressId: addressId,
  paymentMethod: "ESCROW", // or bank transfer
  totalAmount: number,
  notes: string
}

Response Includes:
- orderId
- orderCode
- paymentLink (for payment integration)
- escrowHoldTime
```

### **AUTHENTICATION**

#### 5. **Login Screen** (`Login.jsx`)

```javascript
Flow:
[Email Input] → [Password Input]
       ↓
[Validate inputs]
       ↓
[api.auth.login(email, pass)]
       ↓
[Response: { accessToken, refreshToken, user }]
       ↓
[AppProvider: Update context + save tokens]
       ↓
[Navigate to Home]

Error Handling:
- Invalid email → Alert + stay on screen
- Wrong password → Alert
- Network error → Retry option
- Account not verified → Redirect to OTP verification
```

#### 6. **Register Screen** (`Register.jsx`)

```javascript
Flow:
[Enter Details] → [api.auth.register(...)]
       ↓
[Backend sends OTP to email]
       ↓
[Navigate to OTP verification]
       ↓
[User enters OTP]
       ↓
[api.auth.verifyOTP(email, otp)]
       ↓
[Account created + Auto login]
       ↓
[Navigate to Home]

Form Fields:
- Email (validation: format check)
- Password (min 8 chars, requirements)
- Full Name
- Phone Number
- User Role (Buyer/Seller/Inspector)
```

### **USER PROFILE & SETTINGS**

#### 7. **Profile Screen** (`Profile.jsx`)

```javascript
Components:
- User avatar & name
- Stats cards: Orders, Sales, Ratings
- Profile completeness progress
- Menu items:
  ├─ Edit Profile
  ├─ Manage Addresses
  ├─ My Listings (if seller)
  ├─ My Orders (if buyer)
  ├─ Inspect Dashboard (if inspector)
  ├─ Settings
  └─ Logout

State:
- AppContext: user profile data
- Local: loading state during data fetch

Actions:
- Tap "Edit Profile" → EditProfile screen
- Tap "My Orders" → MyOrders with filter tabs
- Tap "My Listings" → MyPost (seller view)
- Tap "Logout" → Clear tokens + redirect to Login
```

#### 8. **Edit Profile Screen** (`EditProfile.jsx`)

```javascript
Editable Fields:
- Full name
- Phone number
- Avatar upload
- Bio/Description
- Bank account info
- National ID
- Bank name
- Account holder name

API Call:
updateUser({
  full_name,
  phone,
  avatar_url,
  bio,
  bank_account,
  national_id,
  bank_name,
  account_holder_name
})

Success Flow:
[Edit Form] → [Validate] → [api.updateUser()]
    → [Update AsyncStorage] → [Update context] → [Show success]
```

### **ORDERS & TRANSACTIONS**

#### 9. **MyOrders Screen** (`MyOrders.jsx`) - Buyer's View

```javascript
Features:
- Tab selector: ALL / PENDING / PAID / SHIPPED / DELIVERED
- FlatList of OrderCard components
- Pull-to-refresh
- Empty state messaging

OrderCard Shows:
- Order ID & Code
- Product image & name
- Total amount
- Status badge (colored)
- Order date
- Tap to navigate to OrderDetail

State:
- Local: activeTab, loading, refreshing
- Filter applied based on tab selection

API Calls:
getMyOrders(status?, limit, offset)  // Fetch with filter
```

#### 10. **OrderDetail Screen** (`OrderDetail.jsx`)

```javascript
Components:
- Header: Order ID, Order Code, Status
- Product Info Section:
  ├─ Product image
  ├─ Product name & specs
  ├─ Price breakdown (itemPrice, tax, fee, total)
  └─ Seller profile card

- Timeline Section (Order lifecycle):
  ├─ ✓ Order Created
  ├─ ✓ Payment Received (or ⏳ Pending Payment)
  ├─ ✓ Confirmed
  ├─ ✓ Shipped
  ├─ → Delivery in progress
  └─ ⏳ Delivered

- Shipment Section:
  ├─ Tracking number
  ├─ Carrier info
  └─ Estimated delivery date

- Action Buttons (conditional):
  ├─ [Confirm Receipt] if SHIPPED
  ├─ [Initiate Return] if within return window
  └─ [Contact Seller] → Chat

- Order Cancellation (if PENDING, within allowed time)

API Calls:
- getOrderById(orderId)              // Fetch order detail
- completeOrder(orderId)             // Mark as received
- cancelOrder(orderId)               // Cancel order
- getShipmentByOrder(orderId)        // Fetch tracking
```

#### 11. **SellerOrders Screen** (`SellerOrders.jsx`)

```javascript
// Same structure as MyOrders but for seller

Features:
- Tab: ALL / PENDING_PAYMENT / CONFIRMED / SHIPPED / DELIVERED
- Seller-specific actions:
  ├─ [Confirm Order] - Seller confirms receipt of payment
  ├─ [Ship Order] - Mark item as shipped, provide tracking
  ├─ [Complete Order] - After delivery confirmation
  └─ [Reject Order] - With reason if not yet shipped

Difference from Buyer:
- Different order status meanings
- Seller actions are more about fulfillment
- Can add shipping/tracking details
- Can set delivery tracking number
```

### **SELLER OPERATIONS**

#### 12. **CreateProduct Screen** (`CreateProduct.jsx`)

```javascript
Form Sections:
1. Title & Description
   ├─ Product name (required)
   ├─ Description (required)
   └─ Category select (dropdown)

2. Specifications
   ├─ Brand
   ├─ Model year
   ├─ Engine type
   ├─ Mileage
   │─ Frame size
   └─ Condition assessment

3. Pricing
   ├─ List price (required)
   ├─ Initial deposit (% or fixed)
   ├─ Remaining balance (auto-calculated)
   └─ Discount %

4. Photo Upload
   ├─ Upload 3-10 photos
   ├─ Set cover photo (first is default)
   ├─ Cropping & editing tools
   └─ Upload to Supabase storage

5. Shipping Info
   ├─ Shipping available (toggle)
   ├─ Shipping fee
   └─ Pickup available (checkbox)

Workflow:
[Fill Form] → [Upload Photos to Supabase]
    → [api.createProduct(formData + imageUrls)]
    → [Product in DRAFT status]
    → [Can publish/edit from MyPost]

API Call:
createProduct({
  title,
  description,
  category_id,
  brand,
  model,
  engine_type,
  mileage,
  frame_size,
  condition,
  price,
  deposit_amount,
  deposit_percentage,
  thumbnail_media_id,
  media_ids: [...]
})
```

#### 13. **MyPost Screen** (`MyPost.jsx`)

```javascript
Seller's Listing Management

Shows:
- FlatList of seller's listings
- Filter: ALL / DRAFT / PUBLISHED / SOLD
- Search by title

ListingCard Shows:
- Thumbnail image
- Title
- Price
- Status badge
- View count
- Initial deposit %
- Menu icon (three dots)

Actions (from menu):
- [Edit] → CreateProduct with pre-filled data
- [View Detail] → SellerListingDetail
- [Publish] → Make visible to buyers
- [Archive] → Hide from search
- [Mark as Sold] → Close listing
- [Delete] → Remove listing
- [View Analytics] → View count, inquiries

Local States Managed:
- Listing status filter
- Search query
- Loading/refreshing
- Edit modal visibility
```

#### 14. **SellerListingDetail Screen** (`SellerListingDetail.jsx`)

```javascript
// Seller's view of their own listing

Shows (same as buyer Detail but from seller perspective):
- All product info
- View statistics
- Inquiry count
- Average rating for similar products
- Edit button
- Publish/Archive toggle

Analytics Section:
- Total views
- Times favorited
- Inquiries received
- Average time to sell
- Price comparison with similar items

Actions:
[Edit] → Navigate to CreateProduct (edit mode)
[Publish/Archive] → Toggle listing visibility
[Delete] → Remove permanently
[View Inquiries] → Chat list with interested buyers
```

### **MESSAGING**

#### 15. **Chat Screen** (`Chat.jsx`)

```javascript
// Conversation list view

Components:
- HeaderBar with search
- FlatList of ChatPreview items
- Pull-to-refresh
- Empty state: "No conversations yet"

ChatPreview Card Shows:
- Other user's avatar
- User's name
- Last message preview (truncated)
- Unread count badge (if > 0)
- Timestamp of last message
- Online/offline indicator

Interaction:
- Tap card → Navigate to Conversation screen
- Long press → Options (pin, delete, block)
- Search → Filter by name or message content

API/Socket:
- Socket auto-subscribes to chat:* events
- api.getChat() → Fetch all conversations
- Real-time updates when new message arrives

State:
- Local: searchQuery, chats[], loading
- Socket listener: onNewMessage callback
```

#### 16. **Conversation Screen** (`Conversation.jsx`)

```javascript
// Real-time messaging interface

Components:
- Header: Other user name, avatar, online status
- FlatList of messages (inverted to show newest at bottom)
- Message bubbles: own (right, blue) vs other (left, gray)
- Typing indicator when other user types
- Input area: TextInput + Photo button + Send button

Message Structure:
{
  id: uuid,
  content: string (optional),
  image_url: string (optional - uploaded image),
  sender_id: uuid,
  created_at: timestamp,
  read_at: timestamp (or null if unread)
}

Socket Events:
- 'joinChat' → Subscribe to chat room
- 'sendMessage' → Send message to room
- 'messageReceived' → New message from other user
- 'typing' → Other user is typing
- 'stopTyping' → Other user stopped typing
- 'leaveChat' → Unsubscribe from room

Features:
✓ Real-time updates via Socket.io
✓ Image upload & sharing
✓ Typing indicators
✓ Message delivery status (optional)
✓ Read receipts (optional)
✓ Message history pagination

Workflow:
1. useChatSocket hook initializes socket connection
2. Component mounts → joinChat(chatId)
3. User types message → Input state updates
4. User taps send → socket.emit('sendMessage', {...})
5. Backend broadcasts to both users
6. Socket listener updates local messages array
7. FlatList re-renders with new message

Error Handling:
- Socket disconnection → Auto-retry with exponential backoff
- Message send fails → Show error and keep in input
- Image upload fails → Alert user to retry
```

### **SHIPMENT & DELIVERY**

#### 17. **BuyerShipments Screen** (`BuyerShipments.jsx`)

```javascript
// Buyer's view of shipments for their orders

Shows:
- List of shipments related to buyer's orders
- Filter: All / In Transit / Delivered / Delayed
- ShipmentCard with:
  ├─ Order ID
  ├─ Product image & name
  ├─ Tracking number
  ├─ Carrier (e.g., DHL, FedEx)
  ├─ Status badge
  ├─ Estimated delivery date
  └─ [Track] button

Tap to Detail:
→ ShipmentTracking screen for detailed tracking

API:
getBuyerShipments()  // Fetch all buyer shipments
```

#### 18. **SellerShipmentManagement Screen** (`SellerShipmentManagement.jsx`)

```javascript
// Seller manages shipments for their orders

Features:
- List of shipments from sold orders
- Actions available:
  ├─ [Edit Tracking Info] → Add/update tracking number
  ├─ [Mark as Picked Up] → Status update
  ├─ [Mark as In Transit] → Status update
  └─ [Mark as Delivered] → Status update

After order is confirmed paid:
1. Seller provides tracking info
2. Shipment created with PENDING status
3. Seller updates status to PICKED_UP
4. System updates to IN_TRANSIT
5. When delivered → Status changes
6. Buyer gets notification

API Calls:
- getSellerShipments()              // Fetch all
- updateShipmentStatus(shipmentId, newStatus)
- updateShipmentTracking(shipmentId, trackingNumber)
```

#### 19. **ShipmentTracking Screen** (`ShipmentTracking.jsx`)

```javascript
// Real-time shipment tracking details

Components:
- Order summary (product, price, address)
- Carrier info (logo, name, phone)
- Tracking number (copyable)
- Timeline (milestones):
  ├─ ✓ Order Confirmed (checkmark + date)
  ├─ ✓ Picked up (checkmark + date)
  ├─ → In Transit (active - progress indicator)
  ├─ ⏳ Out for Delivery (not yet reached)
  └─ ⏳ Delivered (not yet reached)

- Current Location Map (if available)
- Estimated Delivery
- Delivery Address

Carrier Integration:
- Could integrate with tracking APIs (DHL, FedEx, etc.)
- Fetch real-time status from carrier

API Polling:
- getShipmentById(shipmentId) with polling interval
- Updates order status when shipment status changes

User Actions:
- [Contact Carrier] → Open carrier support
- [Request Replacement] if delayed beyond estimate
- [Confirm Delivery] when arrived
```

### **INSPECTIONS**

#### 20. **MyInspections Screen** (`MyInspections.jsx`)

```javascript
// Buyer/Seller requests inspection, inspector manages queue

Features:
- List inspection requests (if initiated by user)
- Status: Pending / Scheduled / In Progress / Completed / Rejected
- InspectionCard shows:
  ├─ Bike image
  ├─ Bike model & specs
  ├─ Requested date
  ├─ Inspector name (if assigned)
  ├─ Status badge
  └─ [View Detail] / [Cancel] buttons

For Buyers:
- Request inspection before making offer
- Inspector checks bike condition
- Get inspection report before purchase

For Sellers:
- Get inspection as part of approval process
- Listing shows inspection badge if approved

API:
- getMyInspectionRequests(userId)
- createInspectionRequest(bikeId, preferredDate)
- cancelInspectionRequest(requestId)
- getInspectionDetail(inspectionId)
```

#### 21. **InspectorDashboard Screen** (`inspector/InspectorDashboard.jsx`)

```javascript
// Inspector's view of assigned inspection tasks

Components:
- List of inspection requests assigned to inspector
- Filter: Pending / Scheduled / Completed
- InspectionCard shows:
  ├─ Bike image
  ├─ Requested by (name, rating)
  ├─ Requested date
  ├─ Location details
  ├─ [Accept/Reject] buttons if pending
  └─ [View Detail] for detail processing

Actions:
- [Accept] → Mark as accepted, suggest schedule
- [Reject] → With reason
- [View Detail] → Go to InspectionDetail

API:
- getInspectorQueue()           // All assigned
- approveInspectionRequest(id)
- rejectInspectionRequest(id, reason)
```

#### 22. **InspectionDetail Screen** (`inspector/InspectionDetail.jsx`)

```javascript
// Inspector's detailed inspection workflow

Sections:
1. Bike Info
   - Image, model, specs, owner info

2. Inspection Checklist
   - Engine condition (dropdown)
   - Frame integrity (dropdown)
   - Brakes condition (dropdown)
   - Tires condition (dropdown)
   - Electrical system (dropdown)
   - [ ] Accident damage?
   - [ ] Odometer rollback suspected?
   - [ ] Water damage?

3. Photos
   - Upload inspection photos (engine bay, frame, etc.)
   - Add annotations

4. Final Report
   - [Approve] → Bike passes inspection
   - [Reject] → Bike fails inspection (with reason)
   - Overall condition score (1-5 stars)

API Call:
completeInspection({
  inspectionId,
  checklist: {...},
  photo_urls: [],
  approved: boolean,
  rejection_reason?: string,
  score: number
})
```

### **SPECIAL SCREENS**

#### 23. **Favorites Screen** (`Favorites.jsx`)

```javascript
// User's saved/wishlist items

Displays:
- All items added to favorites (from StorageProvider)
- Each item card shows similar to Home listings
- [Remove from Favorites] option
- [Add to Cart] directly
- [View Details] navigation

State:
- StorageProvider: storageData (favorites array)
- Local UI state: loading, grid/list toggle

Actions:
- Swipe to remove → removeStorageData(productId)
- Tap add cart → useCart.addProductToCart()
- Pull-to-refresh → Reload from storage

Empty State:
"No favorites yet! Explore listings and save your favorites."
```

#### 24. **Notifications Screen** (`Notifications.jsx`)

```javascript
// Activity & system notifications

Notification Types:
- Order status updates
- Message from sellers/buyers
- Inspection approved/rejected
- Payment confirmations
- Shipment tracking updates
- Offer received
- New follower

NotificationCard Shows:
- Icon (type-specific)
- Title & message
- Timestamp (formatted)
- Unread indicator (dot)
- Tap action (navigate to relevant screen)

API:
- fetchNotifications()           // Fetch list
- markNotificationRead(id)       // Mark single as read
- markAllNotificationsRead()     // Mark all as read

Features:
✓ Pull-to-refresh
✓ Swipe to delete
✓ Deep linking based on notification type
```

#### 25. **Report Screen** (`Report.jsx`)

```javascript
// Report suspicious/fraudulent listings

Form:
- Report reason selector (dropdown)
  ├─ Fake listing
  ├─ Scam
  ├─ Damaged items
  ├─ Prohibited items
  ├─ Offensive content
  └─ Other

- Description (TextInput, max 500 chars)
- Evidence upload (optional photos)
- Email for follow-up

API:
reportListing({
  listing_id,
  reason,
  description,
  evidence_urls: []
})

Success:
- Show alert "Report submitted"
- Thank user for helping keep platform safe
- Navigate back to listing
```

#### 26. **Payment Success/Cancel Screens** (`PaymentSuccess.jsx`, `PaymentCancel.jsx`)

```javascript
// Payment callback screens (from Stripe/PayPal integration)

PaymentSuccess Shows:
- ✓ Large checkmark icon
- Amount confirmed
- Order ID
- Confirmation message
- [View Order] button → OrderDetail

PaymentCancel Shows:
- ✗ Large X icon
- "Payment was not completed"
- [Try Again] button → Back to Checkout
- [View Cart] button → Cart screen
- [Contact Support] → Chat/support

Navigation:
- These are reached via deep links from payment provider
- Receive orderId & orderCode as params
- Update order status based on callback
```

---

## COMPONENTS LIBRARY

### **HeaderBar Component**

```javascript
// src/component/HeaderBar.jsx

Props:
- title (string): Screen title
- onBack (function): Back button callback
- rightIcon (string, optional): Icon name from @expo/vector-icons
- onRightPress (function, optional): Right icon callback
- tintColor (string, optional): Icon color

Usage Example:
<HeaderBar
  title="My Cart"
  onBack={() => navigation.goBack()}
  rightIcon="plus"
  onRightPress={() => navigateToProducts()}
/>

Features:
✓ Safe area aware
✓ Custom styling
✓ Right action icon optional
✓ Back button always present
```

### **CartItemCard Component**

```javascript
// src/component/CartItemCard.jsx

Props:
- item (object): Cart item with product, quantity, price
- onQuantityChange (function): (newQty) => {...}
- onRemove (function): () => {...}
- isOptimistic (boolean): Show loading state if true

Shows:
- Product image thumbnail
- Product name (1-2 lines)
- Seller name
- Price per unit × Quantity
- Quantity +/- buttons
- Remove button (X icon)

Features:
✓ Quantity boundary checking (min 1)
✓ Optimistic update styling (disabled appearance)
✓ Touch feedback on buttons
✓ Shows "Adding..." during loading
```

### **StatusBadge Component**

```javascript
// src/component/StatusBadge.jsx

Props:
- status (string): Order/shipment status string
- Color mapping (internal):
  ├─ PENDING → Yellow
  ├─ CONFIRMED → Blue
  ├─ SHIPPED → Purple
  ├─ DELIVERED → Green
  └─ CANCELLED → Red

Usage:
<StatusBadge status="SHIPPED" />
// Renders: [SHIPPED] with background color & text

Features:
✓ Automatic color selection based on status
✓ Consistent pill shape styling
✓ Readable text contrast
```

### **FilterButtons Component**

```javascript
// src/component/FilterButtons.jsx

Props:
- filters (array): [{id, label}, ...]
- selectedFilter (string): Current filter ID
- onFilterChange (function): (filterId) => {...}

Renders:
- Horizontal scrolling button row
- Selected button highlighted (blue background)
- Non-selected buttons have gray background
- Touch feedback on press

Example:
const filters = [
  {id: 'all', label: 'All'},
  {id: 'bikes', label: 'Bikes'},
  {id: 'parts', label: 'Parts'},
  {id: 'accessories', label: 'Accessories'}
]

<FilterButtons
  filters={filters}
  selectedFilter="bikes"
  onFilterChange={setFilter}
/>
```

### **DropDown Component**

```javascript
// src/component/DropDown.jsx

Props:
- data (array): [{id, label}, ...]
- onChange (function): (selected) => {...}
- placeholder (string): Default text
- value (string): Currently selected ID

Renders:
- Touchable that shows selected value or placeholder
- On press: Open picker (native picker)
- User selects: Call onChange with selection

Usage:
<DropDown
  data={categories}
  value={selectedCategory}
  onChange={setCategory}
  placeholder="Select category"
/>
```

### **OrderCard Component**

```javascript
// src/component/OrderCard.jsx

Props:
- order (object): Order data with items, total, status

Shows:
- First item's image (thumbnail)
- Order ID
- Item count (e.g., "2 items")
- Total amount
- Status badge
- Order date

Tap Action:
- Navigate to OrderDetail with orderId

Features:
✓ Compact card format
✓ Essential info visible
✓ Status clearly shown
```

### **EmptyState Component**

```javascript
// src/component/EmptyState.jsx

Props:
- title (string): Main message
- subtitle (string, optional): Secondary message

Shows:
- Large icon (shopping cart, heart, chat, etc.)
- Title text
- Subtitle text
- Optional action button (passed as children)

Example:
<EmptyState
  title="No orders yet"
  subtitle="Start browsing to make your first purchase"
>
  <Pressable onPress={() => nav.navigate('Home')}>
    <Text>Browse Products</Text>
  </Pressable>
</EmptyState>
```

---

## SERVICES & API INTEGRATION

### **Overview of API Services**

All services are located in `src/services/` and follow a consistent pattern:

```javascript
// Template Pattern:
import axios from "../lib/axios";

export const serviceName = {
  endpoint: async (params) => {
    try {
      const response = await axios.get("/api/endpoint", { params });
      return response.data; // Already unwrapped by interceptor
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong",
      );
      throw error; // Let calling code handle or retry
    }
  },
};
```

### **HTTP Client with Interceptors** (`lib/axios.js`)

```javascript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create instance
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API || "http://localhost:3000/api",
  timeout: 10000,
});

// Request Interceptor: Add Authorization
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip token for auth endpoints
    if (!config.url.includes("/auth/")) {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 & Refresh
let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    if (error.response?.status === 401 && !config.__isRetry) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .catch(() => {
            // Refresh failed - user needs to re-login
            // Dispatch logout action
            return Promise.reject(error);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      return refreshPromise.then(
        () => axiosInstance(config), // Retry original request
      );
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
```

**Key Features:**

- ✓ Auto-adds Bearer token to requests
- ✓ Auto-refreshes expired tokens (401)
- ✓ Prevents multiple simultaneous refresh calls
- ✓ Retries failed requests after token refresh
- ✓ Skips token for auth endpoints (login/register)

### **Key API Services**

#### **Authentication Service** (`api.auth.js`)

```javascript
// Function: login
login(email, password);
// Params: email (string), password (string)
// Returns: { accessToken, refreshToken, user: {...} }
// Error: Invalid credentials → 401 status

// Function: register
register(email, password, full_name, phone, userRole);
// Params: All required for new account
// Returns: { success: true, message: "OTP sent to email" }

// Function: verifyOTP
verifyOTP(email, otp);
// Params: email, OTP code (6 digits)
// Returns: { accessToken, refreshToken, user: {...} }

// Function: refreshToken
refreshToken();
// No params - uses refreshToken from storage
// Returns: { accessToken }
// Used automatically by axios interceptor

// Function: logout
logout();
// Clears device storage & context
```

#### **Products Service** (`api.products.js`)

```javascript
// Function: getProducts
getProducts((limit = 20), (offset = 0), (category = null), (search = ""));
// Returns: { data: [product, ...], total: number }
// Product: { id, title, price, image_url, seller, status, ... }

// Function: getProductById
getProductById(productId);
// Returns: Full product detail object with images, specs, seller info

// Function: getCategories
getCategories();
// Returns: [{ id, name, icon }, ...]

// Function: createProduct
createProduct(formData);
// Params: title, description, category_id, price, deposit, images, etc.
// Returns: { id, status: 'DRAFT', ... }

// Function: updateProduct
updateProduct(productId, updateData);
// Partially update product info
```

#### **Cart Service** (`api.cart.js`)

```javascript
// Function: getMyCart
getMyCart();
// Returns: { items: [...], total: number, itemCount: number }

// Function: addToCart
addToCart(productData);
// Params: { productId, quantity }
// Returns: { cartItemId, product, quantity, price }
// Error: Product out of stock, product not found, etc.

// Function: updateCartItem
updateCartItem(cartItemId, quantity);
// Returns: Updated item object

// Function: removeFromCart
removeFromCart(cartItemId);
// Returns: { success: true }

// Function: clearCart
clearCart();
// Empties entire cart

// Function: validateCart
validateCart();
// Checks all items still available, prices haven't changed
// Returns: { valid: boolean, errors: [...] }
```

#### **Order Service** (`api.order.js`)

```javascript
// Function: createOrder
createOrder(orderData);
// Params: {
//   listing_id,
//   shipping_address_id,
//   quantity,
//   total_amount,
//   notes
// }
// Returns: { orderId, orderCode, paymentLink, escrowHoldTime }

// Function: checkoutCart
checkoutCart(cartItems, shippingAddressId, paymentMethod);
// Converts cart to order(s) - multiple sellers = multiple orders
// Returns: [{ orderId, orderCode, paymentLink }, ...]

// Function: getMyOrders
getMyOrders((status = null), (limit = 10), (offset = 0));
// Returns: { data: [order, ...], total: number }

// Function: getSellerOrders
getSellerOrders((status = null)); // Seller's incoming orders
// Returns: [seller orders...]

// Function: getOrderById
getOrderById(orderId);
// Returns: Full order detail with timeline, shipment, etc.

// Function: cancelOrder
cancelOrder(orderId, reason);
// Cancels order if in eligible status
// Returns: { status: 'CANCELLED', cancellationReason, refund }
```

#### **Shipment Service** (`api.shipment.js`)

```javascript
// Function: getShipmentById
getShipmentById(shipmentId);
// Returns: {
//   id,
//   orderId,
//   status, // PENDING, PICKED_UP, IN_TRANSIT, DELIVERED
//   carrier,
//   trackingNumber,
//   estimatedDeliveryDate,
//   timeline: [...],
//   currentLocation: { lat, lng }
// }

// Function: getBuyerShipments
getBuyerShipments();
// Returns: All shipments for buyer's orders

// Function: getSellerShipments
getSellerShipments();
// Returns: All shipments for seller's orders

// Function: updateShipmentStatus
updateShipmentStatus(shipmentId, newStatus, notes);
// Seller updates tracking status

// Function: trackShipment (real-time polling)
trackShipment(trackingNumber, carrier);
// Fetches from carrier API if available
```

#### **Chat Service** (`api.chat.js`)

```javascript
// Function: getChat
getChat();
// Returns: [{ id, otherId, otherName, lastMessage, unreadCount }, ...]

// Function: getChatMessages
getChatMessages(chatId, (limit = 50), (offset = 0));
// Returns: [{ id, senderId, content, imageUrl, timestamp }, ...]
// Messages ordered by oldest first

// Function: sendMessage (deprecated - use Socket.io instead)
sendMessage(chatId, content, imageUrl);
// Now handled by socket.emit('sendMessage', {...})

// Function: createChat
createChat(userId, productId);
// Initiates new conversation
// Returns: { chatId }
// Or existing { chatId } if already chatting
```

#### **User Service** (`api.user.js`)

```javascript
// Function: getUser
getUser(userId);
// Returns: Full user profile object

// Function: updateUser
updateUser(updateData);
// Params: Any user field (name, bio, bank_account, etc.)
// Returns: Updated user object
```

#### **Wishlist Service** (`api.wishlist.js`)

```javascript
// Function: getWishlist
getWishlist();
// Returns: [product, ...] - all favorited items

// Function: addToWishlist
addToWishlist(productId);
// Adds product to user's wishlist

// Function: removeFromWishlist
removeFromWishlist(productId);
// Removes from wishlist

// Function: addMultipleToWishlist
addMultipleToWishlist(productIds);
// Bulk add

// Function: removeMultipleFromWishlist
removeMultipleFromWishlist(productIds);
// Bulk remove
```

#### **Address Service** (`api.address.js`)

```javascript
// Function: getMyAddresses
getMyAddresses();
// Returns: [address, ...]

// Function: getDefaultAddress
getDefaultAddress();
// Returns: One address marked as default (or first if none marked)

// Function: createAddress
createAddress({
  street,
  city,
  district,
  postalCode,
  country, // Address
  fullName,
  phone, // Contact info
  isDefault, // Set as default
});
// Returns: Created address object with ID

// Function: updateAddress
updateAddress(addressId, updateData);
// Update specific address

// Function: setDefaultAddress
setDefaultAddress(addressId);
// Mark one address as default

// Function: deleteAddress
deleteAddress(addressId);
// Remove address (unless last address)
```

#### **Inspector Service** (`api.inspector.js`)

```javascript
// Function: getInspections
getInspections((status = null));
// Returns: Inspector's assigned inspections

// Function: createInspectionRequest
createInspectionRequest(productId, preferredDate);
// Buyer/Seller requests bike inspection
// Returns: { inspectionId, status: 'PENDING' }

// Function: cancelInspectionRequest
cancelInspectionRequest(inspectionId);
// Cancel if not yet in progress

// Function: approveInspectionRequest
approveInspectionRequest(inspectionId);
// Inspector marks inspection passed

// Function: rejectInspectionRequest
rejectInspectionRequest(inspectionId, reason);
// Inspector marks inspection failed
```

#### **Payment Service** (`api.payment.js`)

```javascript
// Function: createPaymentForOrder
createPaymentForOrder(orderId, amount);
// Creates Stripe/PayPal session
// Returns: {
//   paymentSessionId,
//   paymentLink,  // Redirect user to this
//   redirectUrl   // Callback after payment
// }

// Function: getPaymentInfo
getPaymentInfo(orderId);
// Returns: Payment status, receipt, etc.

// Function: cancelPayment
cancelPayment(paymentId);
// Cancels pending payment
```

#### **Supabase Service** (`api.supabase.js`)

```javascript
// Function: uploadMultipleImagesToSupabase
uploadMultipleImagesToSupabase(imageArray, (bucketName = "bike-images"));
// Params: imageArray = [{ uri, name, type }, ...]
// Returns: [{ url, name, size }, ...]
// Images stored in Supabase public bucket
```

---

## STATE MANAGEMENT

### **Redux Store for Cart**

**Why Redux for Cart?**

- Cart has complex operations (add, remove, update quantity)
- Multiple async thunks (fetch from server, validate, etc.)
- Optimistic updates with rollback
- Global state accessed from many components

**Redux Cart Structure:**

```javascript
// src/store/slices/cartSlice.js

const initialState = {
  items: [                    // Array of cart items
    {
      cartItemId: 'uuid',     // Backend ID
      productId: 'uuid',
      product: {              // Full product object
        id, title, price,
        images: [{url}],
        condition, brand, etc.
      },
      listing: { ... },       // Listing object
      seller: { ... },        // Seller object
      quantity: 2,
      price: 1500000,         // Price per unit
      isOptimistic: false     // True if temporary
    },
    // ... more items
  ],
  totalAmount: 3000000,       // Sum of (price × qty)
  itemCount: 2,               // Total items
  loading: false,             // Fetching or updating
  error: null                 // Error message if any
};

// Reducers (sync state changes)
export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Direct state mutations (Immer handles immutability)
    addItemOptimistic: (state, action) => {
      // Add temporary item with isOptimistic: true
    },
    removeOptimisticItem: (state, action) => {
      // Remove temp item by cartItemId
    },
    updateItemOptimistic: (state, action) => {
      // Update quantity of item
    },
    revertItemUpdate: (state, action) => {
      // Revert to original quantity
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle async thunks
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // ... more thunk handlers
  }
});

// Async Thunks (side effects - API calls)
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await api.cart.getMyCart();
      return {
        items: cart.items,
        totalAmount: cart.total
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (productData, { rejectWithValue, dispatch }) => {
    // First: Add optimistic item
    const tempId = shortid.generate();
    dispatch(addItemOptimistic({
      cartItemId: tempId,
      ...productData,
      isOptimistic: true
    }));

    try {
      // Second: Make API call
      const result = await api.cart.addToCart(productData);

      return {
        tempId,      // Replace this temp ID
        realItem: result  // With this real item
      };
    } catch (error) {
      // Remove optimistic item on error
      dispatch(removeOptimisticItem(tempId));
      return rejectWithValue(error.message);
    }
  }
);

// Similarly: updateCartItem, removeFromCart thunks
```

**Redux Hooks Usage:**

```javascript
import { useSelector, useDispatch } from "react-redux";
import { addToCart, updateQuantity } from "../store/slices/cartSlice";

function CartComponent() {
  const dispatch = useDispatch();
  const { items, totalAmount, loading } = useSelector((state) => state.cart);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product)); // Async action
  };

  const handleUpdateQty = (cartItemId, newQty) => {
    dispatch(updateCartItem({ cartItemId, quantity: newQty }));
  };

  return (
    <View>
      {items.map((item) => (
        <CartItemCard
          key={item.cartItemId}
          item={item}
          isOptimistic={item.isOptimistic}
          onQuantityChange={(qty) => handleUpdateQty(item.cartItemId, qty)}
        />
      ))}
      <Text>Total: {totalAmount}</Text>
    </View>
  );
}
```

### **Context API for Simpler States**

**AppProvider - Authentication Context**

```javascript
// src/provider/AppProvider.jsx

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState(null);

  // Check auth on app start
  useEffect(() => {
    checkAuthStatus();
    fetchPlatformSettings();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token && isTokenValid(token)) {
        const userData = await api.user.getUser();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear storage, token invalid/expired
        await logout();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userId");
  };

  const fetchPlatformSettings = async () => {
    try {
      const settings = await api.platform.getSettings();
      setPlatformSettings(settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        authLoading,
        platformSettings,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used inside AppProvider");
  return context;
};
```

**Usage in Components:**

```javascript
function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAppContext();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Welcome, {user.full_name}</Text>
      <Pressable onPress={logout}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}
```

**PlatformSettingsProvider - Platform Config**

```javascript
// Similar pattern for platform settings
// Provides: deposit_rate, platform_fee_rate, shipping_fee, etc.
// Auto-refreshes every 5 minutes (useEffect with interval)
```

**StorageProvider - Favorites**

```javascript
// src/provider/StorageProvider.jsx

export function StorageProvider({ children }) {
  const [storageData, setStorageData] = useState([]); // Favorites array

  // Load from AsyncStorage on init
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem("book_favorites");
      if (data) setStorageData(JSON.parse(data));
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  const saveFavorites = async (data) => {
    try {
      await AsyncStorage.setItem("book_favorites", JSON.stringify(data));
      setStorageData(data);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const addStorageData = (item) => {
    const updated = [...storageData, item];
    saveFavorites(updated);
  };

  const removeStorageData = (itemId) => {
    const updated = storageData.filter((item) => item.id !== itemId);
    saveFavorites(updated);
  };

  return (
    <StorageContext.Provider
      value={{ storageData, addStorageData, removeStorageData }}
    >
      {children}
    </StorageContext.Provider>
  );
}
```

---

## NAVIGATION FLOW

### **Navigation Structure**

The app uses **React Navigation** with conditional navigation based on authentication state:

```
RootNavigationContainer
│
├─ Modal Screens (Payment Success/Cancel) - Always accessible
│
├─ Conditional: !isAuthenticated
│  │
│  └─ AuthStack (ScreenOptions.headerShown = false)
│     ├─ Login
│     ├─ Register
│     └─ GuestTabs (limited navigation)
│        ├─ Home (browse only, no add to cart)
│        ├─ Favorites (empty - need to login)
│        └─ Profile (redirects to Login)
│
└─ Conditional: isAuthenticated
   │
   └─ MainApp (Native Stack)
      │
      └─ BottomTabs (Tab Navigator)
         │
         ├─ HomeStack (Stack Navigator)
         │  ├─ Home (initial)
         │  ├─ Detail (product listing)
         │  ├─ CreateProduct (seller create listing)
         │  ├─ Cart (view cart)
         │  ├─ Checkout (final step)
         │  ├─ AddToCartExample (demo)
         │  └─ Report (report listing)
         │
         ├─ FavoritesStack
         │  └─ Favorites (initial)
         │
         ├─ ChatStack
         │  ├─ Chat (initial - conversations)
         │  └─ Conversation (detail - messages)
         │
         └─ ProfileStack (Complex - many screens)
            ├─ Profile (initial)
            ├─ EditProfile
            ├─ ManageAddresses
            ├─ AddEditAddress
            ├─ MyPost (seller listings)
            ├─ SellerListingDetail
            ├─ MyOrders (buyer orders)
            ├─ OrderDetail
            ├─ SellerOrders (seller incoming)
            ├─ BuyerShipments
            ├─ SellerShipmentManagement
            ├─ ShipmentTracking
            ├─ ShipmentStatusUpdate
            ├─ MyInspections
            ├─ InspectorDashboard
            ├─ InspectionDetail
            └─ InspectorProfile (nested)
```

### **Deep Linking Configuration**

```javascript
// In RootNavigation.jsx

const linking = {
  prefixes: [
    "biketrade://", // Custom scheme
    "exp://", // Expo dev
    "https://biketrade.com", // Web
  ],
  config: {
    screens: {
      // Tab routes
      Home: "products",
      Detail: "products/:id",
      Cart: "cart",
      Checkout: "checkout",

      // Auth routes
      PaymentSuccess: "payment/success/:orderId/:orderCode",
      PaymentCancel: "payment/cancel/:orderId",

      // Order/Chat deep links
      OrderDetail: "orders/:orderId",
      Chat: "chat/:chatId",

      // Not handled (default match)
      "*": "*",
    },
  },
};

// Usage: Payment provider redirects to these URLs
// → Deep link parsed → Navigation to correct screen with params
```

### **Navigation Examples**

```javascript
import { useNavigation } from '@react-navigation/native';

function ProductCard({ product }) {
  const navigation = useNavigation();

  const handleViewDetail = () => {
    // Option 1: navigate
    navigation.navigate('Detail', { productId: product.id });

    // Option 2: deep link
    navigation.navigate('Home', {
      screen: 'Detail',
      params: { productId: product.id }
    });
  };

  const handleCheckout = () => {
    navigation.navigate('HomeStack', {
      screen: 'Checkout',
      params: { cartItems: [...] }
    });
  };

  return (
    <Pressable onPress={handleViewDetail}>
      <Image source={{ uri: product.image }} />
      <Text>{product.title}</Text>
    </Pressable>
  );
}
```

---

## KEY FEATURES & IMPLEMENTATION

### **1. OPTIMISTIC UPDATES FOR CART**

**Problem:** Cart operations feel slow when waiting for server response.

**Solution:** Optimistic UI updates - show change immediately, revert if error.

```javascript
// Flow:
User clicks "Add to Cart"
  ↓
[Immediately show item in cart with semi-transparent look]
  ↓
[Async: Make API call]
  ↓
[If Success: Replace optimistic with real item]
[If Error: Remove item, show error alert]

// Implementation in Redux:
const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (product, { dispatch, rejectWithValue }) => {
    // 1. Show optimistic item (dispatch sync action)
    const tempId = 'temp_' + Date.now();
    dispatch(cartSlice.actions.addItemOptimistic({
      cartItemId: tempId,
      ...product,
      isOptimistic: true
    }));

    try {
      // 2. Make API call
      const response = await api.cart.addToCart(product);

      // 3. Return both temp ID and real item
      return { tempId, realItem: response };
    } catch (error) {
      // 4. On error, payload will trigger rejected case
      // which removes the optimistic item
      return rejectWithValue(error.message);
    }
  }
);

// In reducer's extraReducers:
.addCase(addToCart.fulfilled, (state, action) => {
  const { tempId, realItem } = action.payload;

  // Find and replace optimistic item
  const index = state.items.findIndex(i => i.cartItemId === tempId);
  if (index >= 0) {
    state.items[index] = realItem;
  }
})
.addCase(addToCart.rejected, (state, action) => {
  // Remove optimistic item on error
  state.items = state.items.filter(i => !i.isOptimistic);
  state.error = action.payload;
  // Show alert to user
})
```

**UI Component:**

```javascript
<CartItemCard
  item={item}
  isOptimistic={item.isOptimistic} // Gray out if true
  onQuantityChange={handleQtyChange}
/>
```

### **2. REAL-TIME MESSAGING WITH SOCKET.IO**

**Socket.io Hook:**

```javascript
// src/hooks/useChatSocket.js

export function useChatSocket({
  onNewMessage,
  onUserTyping,
  onUserStopTyping,
  onConnected,
}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await AsyncStorage.getItem("accessToken");

      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Register listeners
      socketRef.current.on("connected", onConnected);
      socketRef.current.on("messageReceived", onNewMessage);
      socketRef.current.on("userTyping", onUserTyping);
      socketRef.current.on("userStopTyping", onUserStopTyping);
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    joinChat: (chatId) => {
      socketRef.current?.emit("joinChat", { chatId });
    },
    leaveChat: (chatId) => {
      socketRef.current?.emit("leaveChat", { chatId });
    },
    sendMessage: (message) => {
      socketRef.current?.emit("sendMessage", message);
    },
    sendTypingIndicator: (chatId) => {
      socketRef.current?.emit("typing", { chatId });
    },
  };
}

// Usage in Conversation screen:
function ConversationScreen({ route }) {
  const [messages, setMessages] = useState([]);
  const { chatId } = route.params;

  const { joinChat, sendMessage } = useChatSocket({
    onNewMessage: (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    },
    onConnected: () => {
      joinChat(chatId);
    },
  });

  const handleSendMessage = (text) => {
    sendMessage({
      chatId,
      content: text,
      imageUrl: null,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble msg={item} />}
      />
      <MessageInput onSend={handleSendMessage} />
    </View>
  );
}
```

### **3. AUTHENTICATION WITH AUTO TOKEN REFRESH**

**Token Storage:**

```javascript
// src/services/authStorage.js

export const authStorage = {
  saveToken: async (accessToken, refreshToken, userId) => {
    try {
      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
        ["userId", userId],
      ]);
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem("accessToken");
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userId"]);
    } catch (error) {
      console.error("Failed to remove tokens:", error);
    }
  },
};
```

**Login Flow:**

```javascript
function LoginScreen({ navigation }) {
  const { dispatch } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      const { accessToken, refreshToken, user } = response;

      // Save tokens
      await authStorage.saveToken(accessToken, refreshToken, user.id);

      // Update context - this triggers navigation to MainApp
      dispatch({
        type: "SET_AUTH",
        payload: { user, isAuthenticated: true },
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "MainApp" }],
      });
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable onPress={handleLogin} disabled={loading}>
        <Text>{loading ? "Logging in..." : "Login"}</Text>
      </Pressable>
    </View>
  );
}
```

**Auto Refresh:**

```javascript
// In axios interceptor (lib/axios.js)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const refreshToken = await authStorage.getRefreshToken();
        const response = await axios.post("/auth/refresh", {
          refreshToken,
        });

        const { accessToken } = response.data;
        await authStorage.saveToken(accessToken, refreshToken);

        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await authStorage.removeToken();
        // Dispatch logout action to Redux/Context
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

### **4. IMAGE UPLOADING TO SUPABASE**

```javascript
// src/services/api.supabase.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY,
);

export const uploadMultipleImagesToSupabase = async (
  imageArray,
  bucketName = "bike-images",
) => {
  const uploadedImages = [];

  for (const image of imageArray) {
    try {
      const filename = `${Date.now()}-${Math.random()}.jpg`;
      const filePath = `public/${filename}`;

      // Upload to Supabase bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, image);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      uploadedImages.push({
        url: publicUrl,
        filename,
        size: image.size || 0,
      });
    } catch (error) {
      console.error(`Failed to upload ${image.name}:`, error);
      throw error;
    }
  }

  return uploadedImages;
};

// Usage in CreateProduct screen:
const handleUploadImages = async (selectedImages) => {
  try {
    const uploadedUrls = await uploadMultipleImagesToSupabase(selectedImages);
    setProductImages(uploadedUrls);

    // Now use URLs in createProduct API call
    await api.products.createProduct({
      ...formData,
      media_ids: uploadedUrls.map((img) => img.url),
    });
  } catch (error) {
    Alert.alert("Upload Failed", error.message);
  }
};
```

---

## AUTHENTICATION SYSTEM

### **Complete Auth Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ APP STARTUP                                                  │
│                                                              │
│ 1. App.js mounted                                           │
│ 2. AppProvider checkAuthStatus()                            │
│ 3. Check AsyncStorage for accessToken                       │
│    ├─ Token exists & valid → isAuthenticated = true         │
│    │                          Navigate to MainApp            │
│    ├─ Token invalid/expired → isAuthenticated = false        │
│    │                          Navigate to AuthStack          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGIN FLOW                                                   │
│                                                              │
│ 1. User enters email & password                             │
│ 2. Tap "Login"                                              │
│ 3. api.auth.login(email, password)                          │
│ 4. Backend validates, returns tokens & user                 │
│ 5. authStorage.saveToken(access, refresh, userId)          │
│ 6. AppContext updated → isAuthenticated = true              │
│ 7. Navigation resets to MainApp                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AUTHENTICATED REQUEST                                       │
│                                                              │
│ 1. Component makes API call (e.g., getMyOrders())           │
│ 2. axios.get('/orders')                                     │
│ 3. Request interceptor:                                     │
│    - Get token from AsyncStorage                            │
│    - Add header: Authorization: Bearer {token}              │
│ 4. Request sent to backend                                  │
│ 5. Backend validates token → Success                        │
│ 6. Response returned                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TOKEN EXPIRY & REFRESH                                      │
│                                                              │
│ 1. User makes request                                       │
│ 2. Token expired on backend                                 │
│ 3. Backend returns 401 Unauthorized                         │
│ 4. Response interceptor catches 401                         │
│ 5. axios.post('/auth/refresh', { refreshToken })           │
│ 6. Backend validates refresh token                          │
│    ├─ Valid → Returns new accessToken                       │
│    │           asyncStorage updated                         │
│    │           Original request retried with new token      │
│    └─ Invalid → Refresh fails                               │
│        authStorage.removeToken()                            │
│        Dispatch logout action                               │
│        Navigate to Login                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGOUT FLOW                                                  │
│                                                              │
│ 1. User taps "Logout" button                                │
│ 2. AppContext.logout()                                      │
│ 3. isAuthenticated = false                                  │
│ 4. authStorage.removeToken() → Clear AsyncStorage           │
│ 5. Navigation resets to AuthStack                           │
└─────────────────────────────────────────────────────────────┘
```

### **User Roles & Permissions**

```javascript
// User roles determine what features are accessible

User Roles:
1. BUYER
   - Browse listings
   - Add to cart & checkout
   - Go through orders
   - Track shipments
   - Message sellers
   - View order history
   - Request inspections

2. SELLER
   - All BUYER features
   - Create & manage listings
   - View incoming orders
   - Confirm & ship orders
   - Manage shipments
   - View order statistics
   - Set bank account for payouts

3. INSPECTOR
   - View assigned inspection requests
   - Conduct bike inspections
   - Upload inspection photos
   - Approve/reject bikes
   - Get paid for inspections

4. ADMIN (not in mobile, typically backend)
   - Manage platform settings
   - Block/unblock users
   - View all transactions
   - Manage disputes

// Role-based UI rendering:
function ProfileScreen() {
  const { user } = useAppContext();

  return (
    <View>
      {user.role.includes('SELLER') && (
        <Pressable onPress={() => nav.navigate('MyPost')}>
          <Text>My Listings</Text>
        </Pressable>
      )}

      {user.role.includes('BUYER') && (
        <Pressable onPress={() => nav.navigate('MyOrders')}>
          <Text>My Orders</Text>
        </Pressable>
      )}

      {user.role.includes('INSPECTOR') && (
        <Pressable onPress={() => nav.navigate('InspectorDashboard')}>
          <Text>Inspection Queue</Text>
        </Pressable>
      )}
    </View>
  );
}
```

---

## REAL-TIME FEATURES

### **Socket.io Chat Architecture**

**Connection Management:**

```javascript
// Server-side (conceptual):
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  socket.on("joinChat", ({ chatId }) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on("sendMessage", async ({ chatId, content, imageUrl }) => {
    // Save to database
    const message = await saveMessage({
      chatId,
      senderId: userId,
      content,
      imageUrl,
      createdAt: new Date(),
    });

    // Broadcast to chat room
    io.to(`chat_${chatId}`).emit("messageReceived", message);
  });

  socket.on("typing", ({ chatId }) => {
    socket.to(`chat_${chatId}`).emit("userTyping", { userId });
  });

  socket.on("stopTyping", ({ chatId }) => {
    socket.to(`chat_${chatId}`).emit("userStopTyping", { userId });
  });

  socket.on("leaveChat", ({ chatId }) => {
    socket.leave(`chat_${chatId}`);
  });
});

// Client-side (React Native):
const socket = io(SOCKET_URL, {
  auth: { userId, token: accessToken },
  transports: ["websocket"],
});

// On mount
socket.emit("joinChat", { chatId: "123" });

// Send message
socket.emit("sendMessage", {
  chatId: "123",
  content: "Hello!",
  imageUrl: null,
});

// Listen for new messages
socket.on("messageReceived", (message) => {
  setMessages((prev) => [...prev, message]);
});
```

### **Typing Indicators**

```javascript
function ConversationScreen({ route }) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { chatId } = route.params;
  const { sendTypingIndicator } = useChatSocket({ ... });

  const handleInputChange = (text) => {
    setInputText(text);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(chatId);
    }

    // Reset timeout
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Optionally send stopTyping
    }, 1000);
  };

  return (
    <View>
      <TextInput
        value={inputText}
        onChangeText={handleInputChange}
        placeholder="Type a message..."
      />
    </View>
  );
}
```

### **Notification System (Push Notifications - Conceptual)**

```javascript
// Could integrate with Expo Push Notifications

import * as Notifications from "expo-notifications";

// Request permission
const { status } = await Notifications.requestPermissionsAsync();

// Handle incoming notifications
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      // Show notification UI
      setIncomingNotification(notification);
    },
  );

  return () => {
    Notifications.removeNotificationSubscription(subscription);
  };
}, []);

// Socket event trigger
socket.on("newNotification", (notificationData) => {
  // Show alert or badge
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
});
```

---

## DATA FLOW DIAGRAMS

### **Add to Cart Flow**

```
User Taps "Add to Cart"
        ↓
Component dispatches Redux action: addToCart(product)
        ↓
Redux Thunk:
  ├─ Dispatch addItemOptimistic() → CartItem appears immediately
  │  (with isOptimistic=true, semi-transparent)
  ├─ Parallel: Call api.addToCart(product)
  └─ If Success:
       └─ Dispatch fulfilled → Replace temp ID with real cartItemId
  └─ If Error:
       ├─ Dispatch rejected
       ├─ Remove optimistic item
       └─ Show Alert to user
        ↓
Component re-renders → Cart UI updates with new item count
```

### **Order Creation Flow**

```
User Taps "Checkout"
        ↓
Navigate to Checkout Screen
        ↓
User Selects Address
        ↓
User Taps "Place Order"
        ↓
api.order.checkoutCart(cartItems, shippingAddressId)
        ↓
Backend:
  ├─ Validate cart items still available
  ├─ Create Order record(s) - one per seller
  ├─ Set status = PENDING_PAYMENT
  ├─ Create Shipment record(s)
  └─ Return { orderId, orderCode, paymentLink }
        ↓
Frontend:
  ├─ Clear Redux cart
  ├─ Navigate to Payment Provider (Stripe/PayPal)
  └─ User completes payment
        ↓
Payment Provider:
  ├─ Process payment
  ├─ Redirect to /payment/success/:orderId/:orderCode
  └─ Or /payment/cancel/:orderId
        ↓
Deep Link parsed → Navigate to PaymentSuccess/Cancel screen
        ↓
Success screen shows confirmation
        ↓
User navigates to MyOrders → Can view new order
```

### **Chat Message Flow**

```
User Types Message
        ↓
App:
  ├─ Store in local state
  ├─ Render in message bubble
  └─ Still "pending" state
        ↓
User Taps Send
        ↓
socket.emit('sendMessage', {chatId, content, imageUrl})
        ↓
Socket.io transport (WebSocket/HTTP polling)
        ↓
Backend receives on 'sendMessage'
        ↓
Backend:
  ├─ Validate chatId, userId
  ├─ Save message to database
  ├─ Broadcast to chat room
  └─ io.to(chat_${chatId}).emit('messageReceived', {...})
        ↓
Both clients (sender & receiver) listen to 'messageReceived'
        ↓
Frontend:
  ├─ Add message to messages array
  ├─ Mark own message as sent
  ├─ Re-render FlatList
  └─ Scroll to bottom
        ↓
Message now visible to both users
```

---

## ERROR HANDLING

### **API Error Handling Strategy**

```javascript
// In axios interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message || "Something went wrong";

    // Different handling by status code
    switch (error.response?.status) {
      case 400:
        // Bad request - validation error
        Alert.alert("Invalid Input", errorMessage);
        break;
      case 401:
        // Unauthorized - auto refresh token handled
        break;
      case 403:
        // Forbidden - permission denied
        Alert.alert("Access Denied", errorMessage);
        break;
      case 404:
        // Not found
        Alert.alert("Not Found", "The requested item does not exist");
        break;
      case 409:
        // Conflict - e.g., item already exists
        Alert.alert("Already Exists", errorMessage);
        break;
      case 500:
        // Server error
        Alert.alert("Server Error", "Please try again later");
        break;
      default:
        // Network error or other
        if (!error.response) {
          Alert.alert("Network Error", "Check your internet connection");
        }
    }

    return Promise.reject(error);
  },
);

// In components:
const fetchOrders = async () => {
  try {
    setLoading(true);
    const orders = await api.order.getMyOrders();
    setOrdersList(orders);
  } catch (error) {
    // Error already shown by axios interceptor
    // Component can show fallback UI
    console.error("Fetch failed:", error);
  } finally {
    setLoading(false);
  }
};
```

### **Retry Logic for Failed Requests**

```javascript
// Retry utility function
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }
      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1)),
      );
    }
  }
};

// Usage:
const fetchOrders = () => {
  return retryRequest(
    () => api.order.getMyOrders(),
    3, // max retries
    500, // initial delay
  );
};
```

### **Error Boundaries (Conceptual)**

```javascript
// Wrap entire app with error boundary to catch crashes
<ErrorBoundary
  onError={(error) => {
    console.error("App crashed:", error);
    // Could send to error tracking service
  }}
>
  <AppProvider>
    <PlatformSettingsProvider>
      <StorageProvider>
        <RootNavigation />
      </StorageProvider>
    </PlatformSettingsProvider>
  </AppProvider>
</ErrorBoundary>
```

---

## PERFORMANCE CONSIDERATIONS

### **1. FlatList Optimization**

```javascript
// Bad: Lazy component definitions
const renderItem = ({ item }) => {
  const Component = () => <ItemCard item={item} />; // New fn every render
  return <Component />;
};

// Good: Memoized component
const ItemCard = memo(({ item }) => {
  return (
    <View>
      <Text>{item.title}</Text>
    </View>
  );
});

const renderItem = useCallback(({ item }) => {
  return <ItemCard item={item} />;
}, []);

// FlatList optimization props
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  maxToRenderPerBatch={10} // Render 10 at a time
  updateCellsBatchingPeriod={50} // Batch updates
  initialNumToRender={10} // Render first 10
  windowSize={10} // Keep 10 screens buffered
  onEndReachedThreshold={0.35} // Load more at 35% from bottom
  removeClippedSubviews={true} // Unmount off-screen
/>;
```

### **2. Image Optimization**

```javascript
// Bad: Full resolution images
<Image source={{ uri: product.image }} style={{ width: 100, height: 100 }} />

// Better: Resized thumbnail
<Image
  source={{ uri: `${product.image}?size=small` }}
  style={{ width: 100, height: 100 }}
  defaultSource={require('./placeholder.png')}
/>

// Best: Progressive loading
<Image
  source={{ uri: product.thumbnail }}
  style={{ width: 100, height: 100, backgroundColor: '#f0f0f0' }}
  onLoadStart={() => setLoading(true)}
  onLoadEnd={() => setLoading(false)}
/>
```

### **3. Redux Selector Memoization**

```javascript
// Bad: New objects on every render
const mapStateToProps = (state) => ({
  items: state.cart.items.map((item) => item.product),
  total: state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0),
});
// This creates new array & number EVERY render!

// Better: Use selectors with reselect
import { createSelector } from "reselect";

const selectCartItems = (state) => state.cart.items;

const selectProcessedItems = createSelector([selectCartItems], (items) =>
  items.map((item) => item.product),
);

const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0),
);

// Now returned objects are cached if items haven't changed
const { items, total } = useSelector((state) => ({
  items: selectProcessedItems(state),
  total: selectCartTotal(state),
}));
```

### **4. Lazy Loading Lists**

```javascript
// Pagination with FlatList
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);

const loadMoreItems = async () => {
  if (loading || !hasMoreData) return;

  setLoading(true);
  try {
    const newItems = await api.products.getProducts(
      limit: 20,
      offset: page * 20
    );
    setProducts(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
  } finally {
    setLoading(false);
  }
};

<FlatList
  data={products}
  onEndReached={loadMoreItems}
  onEndReachedThreshold={0.5}
  isLoading={loading}
/>
```

### **5. useCallback for Event Handlers**

```javascript
//Bad: New function every render
function ProductScreen() {
  const handleAddCart = (product) => {
    dispatch(addToCart(product));
  };

  return <ProductCard onAddCart={handleAddCart} />;
}
// ProductCard re-renders even if product hasn't changed

// Good: Memoized callback
function ProductScreen() {
  const handleAddCart = useCallback(
    (product) => {
      dispatch(addToCart(product));
    },
    [dispatch],
  );

  return <ProductCard onAddCart={handleAddCart} />;
}
// ProductCard props stable → can skip re-render with React.memo()
```

---

## Summary

This Bike Trade Platform mobile app is a **comprehensive React Native e-commerce solution** featuring:

✅ **User Management:** Auth, profiles, roles  
✅ **Commerce:** Listings, cart, checkout, orders  
✅ **Real-time:** Chat with Socket.io, notifications  
✅ **Logistics:** Shipment tracking, delivery  
✅ **Services:** Bike inspections, quality assurance  
✅ **State Management:** Redux (cart) + Context API (auth, settings)  
✅ **Performance:** Optimized FlatLists, image loading, memoization  
✅ **UX:** Deep linking, error handling, loading states

**Tech Stack:** React Native • Expo • Redux Toolkit • React Navigation • Socket.io • Supabase

---

**Document Version:** 1.0 - April 2026  
**For:** Academic Review  
**Prepared By:** Development Team
