interface deleteContactResponse {
  success: boolean;
  contact: string;
  error: string | null;
  message: string | null;
}

import { env } from "../env";

export async function updateContactByEmail(email: string, metadata?: Record<string, unknown>) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.PLUNK_API_KEY}`
  }

  try {
    const options = {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email,
        subscribed: true, // todo: get marketing opt in boolean from database
        data: metadata?.data
      })
    };

    return await fetch('https://resend.2block.co/api/v1/contacts', options);
  } catch (error) {
    // Handle error
    console.error('Error updating contact: ', error);
    throw error;
  }
}

export async function deleteContactById(contactId: string) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.PLUNK_API_KEY}`
  }

  try {
    const options = {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        id: contactId
      })
    };

    const response = await fetch('https://resend.2block.co/api/v1/contacts', options);

    const data = await response.json() as deleteContactResponse;

    if (!data.success) {
      throw new Error(data.error ?? data.message ?? 'Failed to delete contact');
    }

    console.log(`📨 Contact deleted ID: ${contactId}`, {
      contactId: data.contact,
    });
  } catch (error) {
    // Handle error
    console.error('Error deleting contact: ', error);
    throw error;
  }
}