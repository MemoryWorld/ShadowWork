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
  pointsEarned?: number;
  totalPoints?: number;
  offerQualified?: boolean;
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

  // Build message blocks
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🎯 ${data.offerQualified ? '🌟' : ''} New Challenge Completion`,
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
          text: `*Difficulty:*\n${data.difficulty}/100`,
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
  ];

  // Add points section if available
  if (data.pointsEarned !== undefined && data.totalPoints !== undefined) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Points Earned:*\n+${data.pointsEarned} pts`,
        },
        {
          type: 'mrkdwn',
          text: `*Total Points:*\n${data.totalPoints} pts`,
        },
      ],
    });
  }

  // Add offer qualification alert if applicable
  if (data.offerQualified) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🔥🔥 *AUTOMATIC OFFER QUALIFIED* (Points > 300)\n_This candidate has demonstrated consistent high performance!_',
      },
    });
  }

  blocks.push(
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
    }
  );

  // Privacy-Safe Payload - NO PR IDs, NO Repo Names, NO Company Names
  const message = {
    text: `Candidate ${candidateHash} completed a ${difficultyLabel} complexity challenge${data.offerQualified ? ' - OFFER QUALIFIED' : ''}`,
    blocks,
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

