/**
 * Slack Notification Utilities
 * 
 * Privacy-First: All notifications are anonymized
 */

export interface SlackNotificationData {
  userId: string;
  difficulty: number;
  category: string;
  techStack: string[];
  replayUrl: string;
}

export async function sendSlackNotification(data: SlackNotificationData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[Slack] Webhook URL not configured');
    return { success: false, error: 'Webhook not configured' };
  }

  // Create anonymized candidate hash
  const candidateHash = data.userId.substring(0, 8);

  // Determine difficulty label
  let difficultyLabel = 'Medium';
  if (data.difficulty >= 80) difficultyLabel = 'High';
  else if (data.difficulty < 50) difficultyLabel = 'Low';

  // Privacy-Safe Payload - NO PR IDs, NO Repo Names, NO Company Names
  const message = {
    text: `Candidate ${candidateHash} completed a ${difficultyLabel} complexity challenge`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Challenge Completion',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Candidate ${candidateHash}* solved a *${difficultyLabel} Complexity* problem`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Category:*\n${data.category}`,
          },
          {
            type: 'mrkdwn',
            text: `*Difficulty Score:*\n${data.difficulty}/100`,
          },
          {
            type: 'mrkdwn',
            text: `*Tech Stack:*\n${data.techStack.join(', ')}`,
          },
          {
            type: 'mrkdwn',
            text: `*Submitted:*\n<!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|Just now>`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '▶️ View Replay',
            },
            url: data.replayUrl,
            style: 'primary',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    console.log('[Slack] Notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[Slack] Notification failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

