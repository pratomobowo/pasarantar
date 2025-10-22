/**
 * Credential Management Utility
 * 
 * This utility provides functions to save and retrieve user credentials
 * using the browser's Credential Management API, which allows users to
 * save their passwords in the browser's password manager.
 */

export interface CredentialData {
  id: string;
  password: string;
  name?: string;
  iconURL?: string;
}

/**
 * Check if the Credential Management API is available in the browser
 */
export const isCredentialManagerAvailable = (): boolean => {
  return 'credentials' in navigator && 'PasswordCredential' in window;
};

/**
 * Save user credentials using the browser's Credential Management API
 * This will trigger the browser's password save dialog
 * 
 * @param email User's email/username
 * @param password User's password
 * @param name Optional display name for the credential
 * @returns Promise that resolves when the operation completes
 */
export const saveCredentials = async (
  email: string,
  password: string,
  name?: string
): Promise<boolean> => {
  if (!isCredentialManagerAvailable()) {
    console.warn('Credential Management API is not supported in this browser');
    return false;
  }

  try {
    // Create a new PasswordCredential object
    const credential = new PasswordCredential({
      id: email,
      password: password,
      name: name || email,
    } as CredentialData);

    // Store the credential
    await navigator.credentials.store(credential);
    console.log('Credentials saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving credentials:', error);
    return false;
  }
};

/**
 * Retrieve saved credentials using the browser's Credential Management API
 * This will trigger the browser's password selection dialog if multiple credentials exist
 * 
 * @returns Promise that resolves with the credential data or null
 */
export const getSavedCredentials = async (): Promise<CredentialData | null> => {
  if (!isCredentialManagerAvailable()) {
    console.warn('Credential Management API is not supported in this browser');
    return null;
  }

  try {
    // Retrieve stored credentials
    const credential = await navigator.credentials.get({
      password: true,
      mediations: 'optional' as CredentialMediationRequirement,
    });

    if (credential && credential.type === 'password') {
      const passwordCredential = credential as PasswordCredential;
      return {
        id: passwordCredential.id!,
        password: passwordCredential.password!,
        name: passwordCredential.name || undefined,
        iconURL: passwordCredential.iconURL || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
};

/**
 * Prevent the browser from showing the credential save dialog for this session
 * Useful when the user explicitly declines to save credentials
 */
export const preventCredentialSave = (): void => {
  if (!isCredentialManagerAvailable()) {
    return;
  }

  try {
    navigator.credentials.preventSilentAccess();
  } catch (error) {
    console.error('Error preventing credential save:', error);
  }
};

/**
 * A wrapper function that offers to save credentials after successful login
 * This includes a small delay to ensure the login process is complete
 * 
 * @param email User's email/username
 * @param password User's password
 * @param name Optional display name for the credential
 * @param delay Optional delay in milliseconds before showing the save dialog
 * @returns Promise that resolves with the result of the save operation
 */
export const offerToSaveCredentials = async (
  email: string,
  password: string,
  name?: string,
  delay: number = 500
): Promise<boolean> => {
  // Add a small delay to ensure the login process is complete
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return saveCredentials(email, password, name);
};