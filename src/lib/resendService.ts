// Resend Email Service for Expiry Notifications
import { getEnvVar } from './env';

interface SpoilingItem {
  name: string;
  daysLeft: number;
}

/**
 * Send email notification for expiring ingredients using Resend API
 * @param userEmail - User's email address
 * @param spoilingItems - Array of ingredients that are expiring soon
 * @returns Result object with success status and optional error
 */
export const sendExpiryNotification = async (
  userEmail: string,
  spoilingItems: SpoilingItem[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Group items by urgency
    const critical = spoilingItems.filter(i => i.daysLeft <= 1);
    const urgent = spoilingItems.filter(i => i.daysLeft > 1 && i.daysLeft <= 3);
    const warning = spoilingItems.filter(i => i.daysLeft > 3 && i.daysLeft <= 7);
    
    // Determine subject urgency
    const subjectPrefix = critical.length > 0 ? '🚨 URGENT' : urgent.length > 0 ? '⚠️ Alert' : '⏰ Reminder';
    const itemCount = spoilingItems.length;
    
    const subject = `${subjectPrefix}: ${itemCount} Ingredient${itemCount > 1 ? 's' : ''} Expiring Soon!`;
    const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ingredient Expiry Alert</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f3f4f6; 
                padding: 20px;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .header h1 { 
                font-size: 28px; 
                margin-bottom: 10px; 
                font-weight: 700;
              }
              .header p { 
                font-size: 16px; 
                opacity: 0.95;
              }
              .content { 
                padding: 30px; 
              }
              .alert-section { 
                margin: 20px 0; 
                padding: 20px; 
                border-radius: 8px; 
              }
              .critical { 
                background: #fee2e2; 
                border-left: 4px solid #dc2626; 
              }
              .urgent { 
                background: #fef3c7; 
                border-left: 4px solid #f59e0b; 
              }
              .warning { 
                background: #fef9c3; 
                border-left: 4px solid #eab308; 
              }
              .alert-section h2 { 
                font-size: 20px; 
                margin-bottom: 15px; 
                font-weight: 600;
              }
              .critical h2 { color: #dc2626; }
              .urgent h2 { color: #f59e0b; }
              .warning h2 { color: #eab308; }
              .item { 
                margin: 12px 0; 
                font-size: 16px; 
                display: flex; 
                align-items: center;
                padding: 8px 0;
              }
              .item strong { 
                color: #1f2937; 
                margin-right: 8px;
              }
              .item-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 8px;
              }
              .badge-critical { background: #dc2626; color: white; }
              .badge-urgent { background: #f59e0b; color: white; }
              .tips-section { 
                background: #ecfdf5; 
                border-left: 4px solid #10b981; 
                padding: 20px; 
                margin: 25px 0; 
                border-radius: 8px; 
              }
              .tips-section h3 { 
                color: #10b981; 
                font-size: 18px; 
                margin-bottom: 15px;
                font-weight: 600;
              }
              .tips-section ul { 
                margin: 10px 0; 
                padding-left: 20px; 
                color: #065f46;
              }
              .tips-section li { 
                margin: 8px 0; 
                line-height: 1.6;
              }
              .cta-container { 
                text-align: center; 
                margin: 30px 0; 
              }
              .cta { 
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                color: white; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                transition: transform 0.2s;
              }
              .cta:hover { 
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4);
              }
              .footer { 
                text-align: center; 
                color: #6b7280; 
                font-size: 13px; 
                padding: 25px; 
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
              }
              .footer p { 
                margin: 5px 0; 
                line-height: 1.6;
              }
              .divider {
                height: 1px;
                background: #e5e7eb;
                margin: 25px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍽️ Fridge2Fork Alert</h1>
                <p>Your ingredients need attention!</p>
              </div>
              
              <div class="content">
                ${critical.length > 0 ? `
                  <div class="alert-section critical">
                    <h2>🚨 CRITICAL - Expiring ${critical.length === 1 ? 'Today/Tomorrow' : 'Very Soon'}:</h2>
                    ${critical.map(item => `
                      <div class="item">
                        <strong>${item.name}</strong> 
                        <span>- ${item.daysLeft === 0 ? 'Expires TODAY' : item.daysLeft === 1 ? 'Expires TOMORROW' : `${item.daysLeft} days left`}</span>
                        <span class="item-badge badge-critical">${item.daysLeft === 0 ? 'USE NOW' : 'URGENT'}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${urgent.length > 0 ? `
                  <div class="alert-section urgent">
                    <h2>⚠️ URGENT - Expiring in 2-3 Days:</h2>
                    ${urgent.map(item => `
                      <div class="item">
                        <strong>${item.name}</strong> 
                        <span>- ${item.daysLeft} day${item.daysLeft > 1 ? 's' : ''} left</span>
                        <span class="item-badge badge-urgent">ACT SOON</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${warning.length > 0 && critical.length === 0 && urgent.length === 0 ? `
                  <div class="alert-section warning">
                    <h2>⏰ Warning - Expiring This Week:</h2>
                    ${warning.map(item => `
                      <div class="item">
                        <strong>${item.name}</strong> 
                        <span>- ${item.daysLeft} days left</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div class="tips-section">
                  <h3>💡 What You Can Do Right Now:</h3>
                  <ul>
                    <li><strong>Generate Recipes:</strong> Use Fridge2Fork to create delicious meals with these ingredients</li>
                    <li><strong>Move to Waste Bin:</strong> Get leftover recipe suggestions before they spoil</li>
                    <li><strong>Freeze for Later:</strong> Extend shelf life by freezing what you can't use immediately</li>
                    <li><strong>Share with Others:</strong> Donate to neighbors or food banks if you have excess</li>
                  </ul>
                </div>
                
                <div class="cta-container">
                  <a href="https://fridge2fork.vercel.app/inventory" class="cta">
                    View My Inventory →
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                  <p style="color: #166534; font-size: 14px; text-align: center; margin: 0;">
                    <strong>🌱 SDG 12 Impact:</strong> By acting on these alerts, you're helping reduce food waste and support responsible consumption!
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p><strong>Why am I receiving this?</strong></p>
                <p>You have ingredients in Fridge2Fork that are approaching their expiry date.</p>
                <p style="margin-top: 15px;">© 2025 Fridge2Fork - Reducing Food Waste, One Recipe at a Time</p>
                <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
                  This is an automated notification. Please do not reply to this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;
    
    // Check if we're in development (localhost) or production
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let response;
    
    if (isDevelopment) {
      // In development, call Resend API directly (serverless functions don't work with Vite dev server)
      const RESEND_API_KEY = getEnvVar('VITE_RESEND_API_KEY');
      
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Fridge2Fork <onboarding@resend.dev>',
          to: [userEmail],
          subject,
          html
        })
      });
    } else {
      // In production, use serverless function to bypass CORS
      response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: userEmail,
          subject,
          html
        })
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Resend API error:', response.status, errorText);
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Expiry notification sent successfully:', data);
    
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Failed to send expiry notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test function to verify Resend API configuration
 * @param testEmail - Email address to send test notification to
 */
export const sendTestNotification = async (testEmail: string): Promise<{ success: boolean; error?: string }> => {
  const testItems: SpoilingItem[] = [
    { name: 'Chicken Breast', daysLeft: 1 },
    { name: 'Lettuce', daysLeft: 2 },
    { name: 'Tomatoes', daysLeft: 5 }
  ];
  
  return sendExpiryNotification(testEmail, testItems);
};

export default {
  sendExpiryNotification,
  sendTestNotification
};
