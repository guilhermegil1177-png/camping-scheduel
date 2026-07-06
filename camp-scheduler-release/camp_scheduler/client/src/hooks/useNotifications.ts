import { useEffect, useCallback } from 'react';
import { useOfflineStorage } from './useOfflineStorage';
import type { CampDay, Notification } from '@/types';

export const useNotifications = () => {
  const { getNotifications, updateNotification, saveNotifications } =
    useOfflineStorage();

  // Agendar notificações para um dia
  const scheduleNotifications = useCallback(
    async (day: CampDay) => {
      const notifications: Notification[] = [];

      day.timeSlots.forEach((slot) => {
        // Parse da hora (HH:MM)
        const [hours, minutes] = slot.time.split(':').map(Number);
        const now = new Date();
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

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

  // Verificar e enviar notificações pendentes
  const checkAndSendNotifications = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notificações não suportadas neste navegador');
      return;
    }

    // Pedir permissão se necessário
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const notifications = await getNotifications();
    const now = Date.now();

    for (const notification of notifications) {
      // Se é hora de enviar e ainda não foi enviada
      if (notification.scheduledTime <= now && !notification.sent) {
        try {
          // Usar Service Worker se disponível
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              notification,
            });
          } else {
            // Fallback para Notification API direta
            new Notification(notification.title, {
              body: notification.body,
              icon: '/manus-storage/camp-logo_318861f1.png',
              badge: '/manus-storage/camp-logo_318861f1.png',
              tag: notification.id,
              requireInteraction: true,
            });
          }

          // Marcar como enviada
          notification.sent = true;
          await updateNotification(notification);
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);
        }
      }
    }
  }, [getNotifications, updateNotification]);

  // Configurar verificação periódica de notificações
  useEffect(() => {
    // Verificar a cada minuto
    const interval = setInterval(() => {
      checkAndSendNotifications();
    }, 60 * 1000);

    // Verificar imediatamente ao montar
    checkAndSendNotifications();

    return () => clearInterval(interval);
  }, [checkAndSendNotifications]);

  return {
    scheduleNotifications,
    checkAndSendNotifications,
  };
};
