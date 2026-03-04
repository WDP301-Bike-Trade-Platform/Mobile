import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import RootNavigation from './src/navigation/RootNavigation';
import AppProvider from './src/provider/AppProvider';
import StorageProvider from './src/provider/StorageProvider';
import { store } from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      <AppProvider>
        <StorageProvider>
          <RootNavigation />
        </StorageProvider>
      </AppProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
