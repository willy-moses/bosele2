

/**
 * Create a notification when a new registration is submitted
 * Call this function after creating a registration
 */
export async function createRegistrationNotification(registrationId, registrationData) {
  try {

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          type: 'registration',
          registration_id: registrationId,
          contact_message_id: null,
          is_read: false,
          message: `New registration from ${registrationData.first_name || registrationData.firstName} ${registrationData.last_name || registrationData.lastName}`,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error creating registration notification:', error)
      throw error
    }

    console.log('✅ Registration notification created:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to create registration notification:', error)
    // Don't throw - we don't want to fail the registration if notification creation fails
    return null
  }
}

/**
 * Create a notification when a new contact message is submitted
 */
export async function createContactNotification(contactMessageId, contactData) {
  try {

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          type: 'contact',
          contact_message_id: contactMessageId,
          registration_id: null,
          is_read: false,
          message: `New contact message from ${contactData.name}`,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error creating contact notification:', error)
      throw error
    }

    console.log('✅ Contact notification created:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to create contact notification:', error)
    return null
  }
}

/**
 * Mark a registration as read and update its notification
 */
export async function markRegistrationAsRead(registrationId) {
  try {

    // Update the registration
    await supabase
      .from('registrations')
      .update({ is_read: true })
      .eq('id', registrationId)

    // Mark the notification as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('registration_id', registrationId)

    console.log('✅ Registration marked as read:', registrationId)
  } catch (error) {
    console.error('❌ Error marking registration as read:', error)
  }
}

/**
 * Mark a contact message as read and update its notification
 */
export async function markContactAsRead(contactMessageId) {
  try {

    // Update the contact message
    await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', contactMessageId)

    // Mark the notification as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('contact_message_id', contactMessageId)

    console.log('✅ Contact message marked as read:', contactMessageId)
  } catch (error) {
    console.error('❌ Error marking contact as read:', error)
  }
}