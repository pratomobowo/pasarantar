/**
 * Test file for the notification system
 * This file can be used to verify that the toast notifications are working correctly
 */

import { useToast } from '../contexts/ToastContext';
import { NotificationHelpers } from './notificationUtils';

/**
 * Test function to verify all notification types
 * This can be called from any component that has access to the ToastContext
 */
export const testNotificationSystem = () => {
  const { success, error, warning, info } = useToast();
  
  // Test success notification
  const testSuccess = () => {
    const notification = NotificationHelpers.success('create', 'product');
    success(notification.title, notification.message);
  };
  
  // Test error notification
  const testError = () => {
    const notification = NotificationHelpers.error('create', 'product', 'Test error message');
    error(notification.title, notification.message);
  };
  
  // Test warning notification
  const testWarning = () => {
    const notification = NotificationHelpers.warning('required_field', 'Test warning message');
    warning(notification.title, notification.message);
  };
  
  // Test info notification
  const testInfo = () => {
    const notification = NotificationHelpers.info('loading', 'Test info message');
    info(notification.title, notification.message);
  };
  
  return {
    testSuccess,
    testError,
    testWarning,
    testInfo,
  };
};

/**
 * Component to test the notification system
 * This can be added to any admin page for testing purposes
 */
export const NotificationTestButton = () => {
  const { testSuccess, testError, testWarning, testInfo } = testNotificationSystem();
  
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      <button
        onClick={testSuccess}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Test Success
      </button>
      <button
        onClick={testError}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Test Error
      </button>
      <button
        onClick={testWarning}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Test Warning
      </button>
      <button
        onClick={testInfo}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Info
      </button>
    </div>
  );
};

/**
 * Instructions for testing the notification system:
 * 
 * 1. Add the NotificationTestButton component to any admin page
 * 2. Click each button to verify that the correct toast notification appears
 * 3. Check that the notifications auto-dismiss after 5 seconds
 * 4. Verify that you can manually dismiss the notifications by clicking the X button
 * 5. Test multiple notifications appearing at the same time
 * 6. Verify that the positioning is correct (top-right by default)
 * 
 * Example usage:
 * 
 * import { NotificationTestButton } from '../../utils/testNotificationSystem';
 * 
 * export default function SomeAdminPage() {
 *   return (
 *     <div>
 *       {/* Your page content */}
 *       <NotificationTestButton />
 *     </div>
 *   );
 * }
 */