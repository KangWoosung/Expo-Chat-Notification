# Expo-Chat-Notification-App

## Job Not Finished!

A **Telegram-like real-time chat application** built with Expo, Supabase, and Clerk. This project supports **push notifications** via FCM/APNs, user authentication via Clerk, and real-time chat messaging using Supabase Realtime.

## 🔧 Tech Stack

- **[Expo](https://expo.dev/)** – React Native framework for rapid cross-platform development
- **[Clerk](https://clerk.dev/)** – Authentication and user management
- **[Supabase](https://supabase.com/)** – Backend-as-a-Service for database, authentication (optional), and real-time sync
- **Supabase Realtime** – Live chat messaging
- **Supabase Edge Functions** – Notification handling logic
- **Expo Notifications** – Push notifications (via APNs for iOS, FCM for Android)
- **Tanstack Query** – Caching Queries

---

## ✨ Features

- 🔐 Secure user authentication (via Clerk)
- 💬 Real-time messaging inside chat rooms
- 🔔 Push notifications on new messages in joined rooms
- 📲 Works on both iOS and Android devices
- 🧠 Notification system powered by Supabase Edge Functions
- 📁 File upload and sharing capabilities
- 🎨 Dark/Light theme support
- 📱 Responsive design for all screen sizes

---

## 🖼️ Screenshots

> _Coming soon..._

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Expo-Chat-Notification-App.git
cd Expo-Chat-Notification-App
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add your configuration:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server

```bash
npx expo start
```

### 5. Run on device or simulator

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

---

## 📱 Features in Detail

### Authentication

- Social login (Google, Apple, etc.)
- Email/password authentication
- Secure session management

### Real-time Chat

- Instant message delivery
- Typing indicators
- Message status (sent, delivered, read)
- File attachments support

### Push Notifications

- Real-time push notifications for new messages
- Custom notification sounds
- Badge count management
- Background notification handling

### File Management

- Image and document upload
- File size and type validation
- Storage usage tracking
- Secure file sharing

---

## 🛠️ Development

### Project Structure

```
├── app/                    # Expo Router app directory
├── components/             # Reusable React components
├── contexts/              # React Context providers
├── db/                    # Database schemas and migrations
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
└── constants/             # App constants and configurations
```

### Key Technologies

- **Expo Router**: File-based routing
- **NativeWind**: Tailwind CSS for React Native
- **React Native Reanimated**: Smooth animations
- **Expo Image Picker**: File selection
- **Expo Document Picker**: Document selection

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.
