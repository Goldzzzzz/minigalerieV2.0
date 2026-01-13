import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'minigalerie_user_id';

export async function getUserId() {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);

    if (!userId) {
      userId = uuidv4();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  } catch (error) {
    console.error('Error generating user ID:', error);
    return null;
  }
}