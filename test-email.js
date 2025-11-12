const emailService = require('./email.service');

// Test email configuration
const testEmail = async () => {
  console.log('🧪 Testing Email Service...');
  
  try {
    // Test 1: Check if email service loads
    console.log('✅ Email service loaded successfully');
    
    // Test 2: Test email templates
    console.log('📧 Testing email templates...');
    
    const testUserData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890'
    };
    
    // Test role application submitted template
    const submittedTemplate = emailService.emailTemplates.roleApplicationSubmitted(testUserData, 'vendor');
    console.log('✅ Role application submitted template generated');
    console.log('   Subject:', submittedTemplate.subject);
    
    // Test role application approved template
    const approvedTemplate = emailService.emailTemplates.roleApplicationApproved(testUserData, 'vendor');
    console.log('✅ Role application approved template generated');
    console.log('   Subject:', approvedTemplate.subject);
    
    // Test 3: Check environment variables
    console.log('🔧 Checking email configuration...');
    console.log('   EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set (using default: smtp.gmail.com)');
    console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set (using default: 587)');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'Not set (using default: your-email@gmail.com)');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'Not set (using default: your-app-password)');
    console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set (using default: https://bc-project-pbiz.vercel.app)');
    
    // Test 4: Test email sending (only if credentials are configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
        process.env.EMAIL_USER !== 'your-email@gmail.com' && 
        process.env.EMAIL_PASS !== 'your-app-password') {
      
      console.log('📤 Testing actual email sending...');
      console.log('   This will send a test email to:', process.env.EMAIL_USER);
      
      const result = await emailService.sendTestEmail(process.env.EMAIL_USER);
      
      if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', result.messageId);
      } else {
        console.log('❌ Test email failed:', result.error);
      }
    } else {
      console.log('⚠️  Email credentials not configured. Skipping actual email test.');
      console.log('   To test actual email sending, configure EMAIL_USER and EMAIL_PASS in your .env file');
    }
    
    console.log('\n🎉 Email service test completed!');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    console.error('   Stack trace:', error.stack);
  }
};

// Run the test
testEmail(); 