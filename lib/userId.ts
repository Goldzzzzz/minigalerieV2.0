import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuid } from "uuid";

const KEY = "minigalerie_user_id";

export async function getUserId() {
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = uuid();
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}
