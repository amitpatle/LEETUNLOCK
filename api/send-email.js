export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  const recipient = process.env.CONTACT_EMAIL
  if (!apiKey || !from || !recipient) return response.status(500).json({ error: 'Email service is not configured.' })

  const { type, name, email, message } = request.body || {}
  if (!message || typeof message !== 'string' || message.trim().length < 3) {
    return response.status(400).json({ error: 'Please provide a message.' })
  }
  if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return response.status(400).json({ error: 'Please provide a valid reply email.' })
  }

  const subject = `[LeetUnlock] ${typeof type === 'string' ? type : 'General message'}`
  const text = [
    `Name: ${typeof name === 'string' && name.trim() ? name.trim() : 'Not provided'}`,
    `Email: ${typeof email === 'string' && email.trim() ? email.trim() : 'Not provided'}`,
    '',
    message.trim()
  ].join('\n')

  let mailResponse
  try {
    mailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [recipient], reply_to: email || undefined, subject, text })
    })
  } catch (error) {
    console.error('Resend email request failed:', error)
    return response.status(502).json({ error: 'The email provider is unavailable.' })
  }

  if (!mailResponse.ok) {
    const details = await mailResponse.text()
    console.error('Resend email request failed:', details)
    return response.status(502).json({ error: 'The email provider rejected the message.' })
  }

  return response.status(200).json({ ok: true })
}
