export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration API not supported or disabled', e);
    }
  }
};

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  heavy: () => vibrate(40),
  success: () => vibrate([10, 30, 20]),
  warning: () => vibrate([20, 40, 20]),
  error: () => vibrate([50, 50, 50, 50, 50]),
  micStart: () => vibrate(15),
  micStop: () => vibrate([15, 30, 15]),
};
