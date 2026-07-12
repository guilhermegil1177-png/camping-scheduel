import { useEffect, useState, useCallback } from 'react';
import type { CampDay, Notification } from '@/types';

const DB_NAME = 'CampSchedulerDB';
const DB_VERSION = 1;
const DAYS_STORE = 'days';
const NOTIFICATIONS_STORE = 'notifications';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(DAYS_STORE)) {
        database.createObjectStore(DAYS_STORE, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
        database.createObjectStore(NOTIFICATIONS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const useOfflineStorage = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setIsReady(true))
      .catch((error) => {
        console.error('Erro ao inicializar IndexedDB:', error);
        setIsReady(true); // Continua mesmo com erro
      });
  }, []);

  const saveDays = useCallback(async (days: CampDay[]) => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(DAYS_STORE, 'readwrite');
      const store = transaction.objectStore(DAYS_STORE);

      // Limpar dados antigos
      store.clear();

      // Adicionar novos dados
      days.forEach((day) => {
        store.add(day);
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }, []);

  const getDays = useCallback(async (): Promise<CampDay[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(DAYS_STORE, 'readonly');
      const store = transaction.objectStore(DAYS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }, []);

  const saveDay = useCallback(async (day: CampDay) => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(DAYS_STORE, 'readwrite');
      const store = transaction.objectStore(DAYS_STORE);
      const request = store.put(day);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, []);

  const deleteDay = useCallback(async (dayId: string) => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(DAYS_STORE, 'readwrite');
      const store = transaction.objectStore(DAYS_STORE);
      const request = store.delete(dayId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, []);

  const saveNotifications = useCallback(async (notifications: Notification[]) => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(NOTIFICATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(NOTIFICATIONS_STORE);

      store.clear();

      notifications.forEach((notification) => {
        store.add(notification);
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }, []);

  const getNotifications = useCallback(async (): Promise<Notification[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(NOTIFICATIONS_STORE, 'readonly');
      const store = transaction.objectStore(NOTIFICATIONS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }, []);

  const updateNotification = useCallback(async (notification: Notification) => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(NOTIFICATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(NOTIFICATIONS_STORE);
      const request = store.put(notification);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, []);

  return {
    isReady,
    saveDays,
    getDays,
    saveDay,
    deleteDay,
    saveNotifications,
    getNotifications,
    updateNotification,
  };
};
