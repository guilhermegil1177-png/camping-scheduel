import { useEffect, useCallback, useRef } from 'react';
import { useOfflineStorage } from './useOfflineStorage';
import { toast } from 'sonner';
import type { CampDay, Notification } from '@/types';


export const useNotificationManager = () => {
  const { getNotifications, updateNotification, saveNotifications } =
    useOfflineStorage();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationsSentRef = useRef<Set<string>>(new Set());

  // Pedir permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notificações não suportadas');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Agendar notificações para um dia
  const scheduleNotificationsForDay = useCallback(
    async (day: CampDay) => {
      const notifications: Notification[] = [];

      day.timeSlots.forEach((slot) => {
        // Parse da hora (HH:MM)
        const [hours, minutes] = slot.time.split(':').map(Number);
        const now = new Date();
        const slotDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes
        );

        // Se a hora já passou hoje, agendar para amanhã
        if (slotDate < now) {
          slotDate.setDate(slotDate.getDate() + 1);
        }

        // Notificação 10 minutos antes
        const notificationTime = new Date(slotDate.getTime() - 10 * 60 * 1000);

        const notification: Notification = {
          id: `${day.id}-${slot.id}`,
          dayId: day.id,
          timeSlotId: slot.id,
          title: `⏰ ${slot.time} - ${slot.title}`,
          body: slot.description,
          scheduledTime: notificationTime.getTime(),
          sent: false,
          createdAt: Date.now(),
        };

        notifications.push(notification);
      });

      await saveNotifications(notifications);
      return notifications;
    },
    [saveNotifications]
  );

  // Enviar notificação
  const sendNotification = useCallback(async (notification: Notification) => {
    try {
      // Verificar se já foi enviada nesta sessão
      if (notificationsSentRef.current.has(notification.id)) {
        return;
      }

      // Usar Notification API
      if (Notification.permission === 'granted') {
        const notificationOptions: NotificationOptions = {
          body: notification.body,
          icon: '/manus-storage/camp-logo_318861f1.png',
          badge: '/manus-storage/camp-logo_318861f1.png',
          tag: notification.id,
          requireInteraction: true,
        };
        // @ts-ignore - vibrate é suportado em alguns navegadores
        notificationOptions.vibrate = [200, 100, 200];
        new Notification(notification.title, notificationOptions);

        // Toast como fallback
        toast.success(notification.title, {
          description: notification.body,
          duration: 10000,
        });
      } else {
        // Apenas toast se notificações não estão permitidas
        toast.info(notification.title, {
          description: notification.body,
          duration: 10000,
        });
      }

      // Marcar como enviada
      notificationsSentRef.current.add(notification.id);
      notification.sent = true;
      await updateNotification(notification);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }, [updateNotification]);

  // Verificar e enviar notificações pendentes
  const checkAndSendNotifications = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      const now = Date.now();

      for (const notification of notifications) {
        // Se é hora de enviar e ainda não foi enviada
        if (notification.scheduledTime <= now && !notification.sent) {
          await sendNotification(notification);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }, [getNotifications, sendNotification]);

  // Configurar verificação periódica
  useEffect(() => {
    // Pedir permissão ao montar
    requestNotificationPermission();

    // Verificar imediatamente
    checkAndSendNotifications();

    // Verificar a cada minuto
    intervalRef.current = setInterval(() => {
      checkAndSendNotifications();
    }, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAndSendNotifications, requestNotificationPermission]);

  return {
    scheduleNotificationsForDay,
    checkAndSendNotifications,
    requestNotificationPermission,
  };
};
