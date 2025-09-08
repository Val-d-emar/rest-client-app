import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';
// удалить пример
// Добавить
export const addUser = async (name: string) => {
  await addDoc(collection(db, 'users'), { name });
};

// Прочитать
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Обновить
export const updateUser = async (id: string, newName: string) => {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, { name: newName });
};

// Удалить
export const deleteUser = async (id: string) => {
  await deleteDoc(doc(db, 'users', id));
};
