import fpPromise from '@fingerprintjs/fingerprintjs';

/**
 * Benzersiz donanım/tarayıcı parmak izi oluşturur.
 * Bu sayede localStorage manipüle edilse bile cihaz aynı kalır.
 */
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    const fp = await fpPromise.load();
    const result = await fp.get();
    
    // Ziyaretçi kimliği (benzersiz hash)
    return result.visitorId;
  } catch (error) {
    console.error('Parmak izi alınamadı:', error);
    // Hata durumunda fallback olarak rastgele ama kalıcı bir ID üret
    let fallbackId = localStorage.getItem('pdks_fallback_device_id');
    if (!fallbackId) {
      fallbackId = 'fallback-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pdks_fallback_device_id', fallbackId);
    }
    return fallbackId;
  }
};
