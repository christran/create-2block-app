"use server";

import { env } from "@/env";

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

    const response = await fetch('https://resend.2block.co/api/v1/contacts', options);
  } catch (error) {
    // Handle error
    console.error('Error updating contact: ', error);
    throw error;
  }
}