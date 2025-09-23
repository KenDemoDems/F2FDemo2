// Email Notification Service for FridgeToFork
// Supports multiple email providers: Gmail API, SendGrid, SMTP
import { getEnvVar } from './env';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: any;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email templates
const EMAIL_TEMPLATES = {
  'spoiling-reminder': {
    subject: '🍎 FridgeToFork - Ingredients Expiring Soon!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">🍎 FridgeToFork</h1>
          <p style="color: #6b7280; margin: 5px 0;">Smart Recipe Suggestions</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">⏰ Ingredients Expiring Soon!</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Hi there! We noticed you have some ingredients that are expiring soon. Don't let them go to waste!
          </p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Expiring Soon:</h3>
            <ul style="margin: 10px 0; color: #374151;">
              ${data.spoilingItems.map((item: any) => `
                <li style="margin: 5px 0;">
                  <strong>${item.name}</strong> - ${item.daysLeft} day${item.daysLeft === 1 ? '' : 's'} left
                </li>
              `).join('')}
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            <strong>💡 Pro tip:</strong> Use FridgeToFork to generate recipes with these ingredients and reduce food waste!
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://fridgetofork.com/recipes" 
               style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              🍳 Generate Recipes Now
            </a>
          </div>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>You're receiving this because you have notifications enabled in FridgeToFork.</p>
          <p>
            <a href="#" style="color: #059669;">Unsubscribe</a> | 
            <a href="#" style="color: #059669;">Update Preferences</a>
          </p>
        </div>
      </div>
    `
  },
  
  'recipe-suggestion': {
    subject: '👨‍🍳 New Recipe Suggestions from FridgeToFork',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">🍳 FridgeToFork</h1>
          <p style="color: #6b7280; margin: 5px 0;">Fresh Recipe Ideas</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #059669; margin-top: 0;">✨ New Recipes Based on Your Ingredients</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            We've found ${data.recipes.length} delicious recipes you can make with your current ingredients!
          </p>
          
          ${data.recipes.map((recipe: any) => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <h3 style="margin: 0 0 10px 0; color: #111827;">${recipe.name}</h3>
              <p style="color: #6b7280; margin: 5px 0;">
                🕒 ${recipe.time} | 🍽️ ${recipe.difficulty} | 🔥 ${recipe.calories} cal
              </p>
              <p style="color: #374151; font-size: 14px; margin: 10px 0;">
                ${recipe.nutritionBenefits}
              </p>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; margin: 10px 0;">
                <strong style="color: #059669;">Match: ${recipe.matchPercentage}%</strong>
                ${recipe.missingIngredients.length > 0 ? 
                  `<br><small style="color: #6b7280;">Missing: ${recipe.missingIngredients.join(', ')}</small>` : 
                  '<br><small style="color: #059669;">✅ You have all ingredients!</small>'
                }
              </div>
            </div>
          `).join('')}
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://fridgetofork.com/recipes" 
               style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              View All Recipes
            </a>
          </div>
        </div>
      </div>
    `
  },
  
  'welcome': {
    subject: '🎉 Welcome to FridgeToFork!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">🎉 Welcome to FridgeToFork!</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your AI-Powered Recipe Assistant</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #059669; margin-top: 0;">Hello ${data.name}! 👋</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Thanks for joining FridgeToFork! We're excited to help you transform your leftovers into delicious meals while reducing food waste.
          </p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0369a1;">🚀 Getting Started</h3>
            <ol style="color: #374151; margin: 10px 0;">
              <li>📸 Take a photo of your fridge contents</li>
              <li>🤖 Our AI will detect ingredients automatically</li>
              <li>👨‍🍳 Get personalized recipe suggestions</li>
              <li>🗓️ Plan your meals for the week</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://fridgetofork.com/upload" 
               style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              📸 Upload Your First Photo
            </a>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-size: 14px;">
            <strong>💚 Supporting SDG 12:</strong> Together, we're working towards responsible consumption and production by reducing food waste and optimizing ingredient usage.
          </p>
        </div>
      </div>
    `
  }
};

// Gmail API Integration
const sendWithGmail = async (emailData: EmailData): Promise<EmailResponse> => {
  try {
    // TODO: Implement Gmail API integration
    // This requires OAuth 2.0 setup and proper credentials
    console.log('📧 Gmail API - Email would be sent:', emailData);
    
    // Mock success response for development
    return {
      success: true,
      messageId: `gmail_${Date.now()}`,
      error: undefined
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Gmail API Error: ${error.message}`
    };
  }
};

// SendGrid Integration
const sendWithSendGrid = async (emailData: EmailData): Promise<EmailResponse> => {
  try {
    const apiKey = getEnvVar('VITE_SENDGRID_API_KEY');
    const fromEmail = getEnvVar('VITE_EMAIL_FROM_ADDRESS', 'noreply@fridgetofork.com');
    
    if (!apiKey || apiKey === 'demo-email-key') {
      console.log('📧 Email service not configured, simulating email delivery');
      throw new Error('SendGrid API key not configured');
    }
    
    const template = EMAIL_TEMPLATES[emailData.template as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      throw new Error(`Email template '${emailData.template}' not found`);
    }
    
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: emailData.to }],
          subject: emailData.subject || template.subject
        }
      ],
      from: { email: fromEmail, name: 'FridgeToFork' },
      content: [
        {
          type: 'text/html',
          value: template.html(emailData.data)
        }
      ]
    };
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
    
    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('X-Message-Id') || `sendgrid_${Date.now()}`
      };
    } else {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${response.status} ${error}`);
    }
    
  } catch (error: any) {
    console.error('❌ SendGrid Error:', error);
    return {
      success: false,
      error: `SendGrid Error: ${error.message}`
    };
  }
};

// SMTP Integration (Nodemailer)
const sendWithSMTP = async (emailData: EmailData): Promise<EmailResponse> => {
  try {
    // TODO: Implement Nodemailer SMTP integration
    // This would require server-side implementation
    console.log('📧 SMTP - Email would be sent:', emailData);
    
    // Mock success response for development
    return {
      success: true,
      messageId: `smtp_${Date.now()}`
    };
  } catch (error: any) {
    return {
      success: false,
      error: `SMTP Error: ${error.message}`
    };
  }
};

// Main email sending function
export const sendEmail = async (emailData: EmailData): Promise<EmailResponse> => {
  const provider = getEnvVar('VITE_EMAIL_PROVIDER', 'sendgrid');
  
  console.log(`📧 Sending email via ${provider}:`, {
    to: emailData.to,
    template: emailData.template,
    subject: emailData.subject
  });
  
  try {
    switch (provider.toLowerCase()) {
      case 'gmail':
        return await sendWithGmail(emailData);
      case 'sendgrid':
        return await sendWithSendGrid(emailData);
      case 'smtp':
        return await sendWithSMTP(emailData);
      default:
        return await sendWithSendGrid(emailData); // Default fallback
    }
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Convenience functions for specific email types
export const sendSpoilingReminder = async (
  userEmail: string, 
  spoilingItems: Array<{ name: string; daysLeft: number }>
): Promise<EmailResponse> => {
  return sendEmail({
    to: userEmail,
    subject: '',
    template: 'spoiling-reminder',
    data: { spoilingItems }
  });
};

export const sendRecipeSuggestions = async (
  userEmail: string,
  recipes: any[],
  ingredients: string[]
): Promise<EmailResponse> => {
  // Add missing ingredients analysis for each recipe
  const recipesWithAnalysis = recipes.map(recipe => ({
    ...recipe,
    matchPercentage: Math.round((recipe.ingredients?.length || 0) / (recipe.ingredients?.length || 1) * 100),
    missingIngredients: recipe.ingredients?.filter((ing: string) => 
      !ingredients.some(available => available.toLowerCase().includes(ing.toLowerCase()))
    ) || []
  }));

  return sendEmail({
    to: userEmail,
    subject: '',
    template: 'recipe-suggestion',
    data: { recipes: recipesWithAnalysis }
  });
};

export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<EmailResponse> => {
  return sendEmail({
    to: userEmail,
    subject: '',
    template: 'welcome',
    data: { name: userName }
  });
};

// Batch email sending for multiple users
export const sendBatchEmails = async (
  emails: EmailData[]
): Promise<EmailResponse[]> => {
  console.log(`📧 Sending batch of ${emails.length} emails`);
  
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );
  
  return results.map(result => 
    result.status === 'fulfilled' 
      ? result.value 
      : { success: false, error: result.reason.message }
  );
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Email scheduling (for future implementation)
export const scheduleEmail = async (
  emailData: EmailData,
  sendAt: Date
): Promise<{ scheduled: boolean; scheduleId?: string; error?: string }> => {
  try {
    // TODO: Implement email scheduling logic
    // This could use a job queue system like Bull/Redis
    console.log('📅 Email scheduled for:', sendAt, emailData);
    
    return {
      scheduled: true,
      scheduleId: `schedule_${Date.now()}`
    };
  } catch (error: any) {
    return {
      scheduled: false,
      error: error.message
    };
  }
};

export default sendEmail;