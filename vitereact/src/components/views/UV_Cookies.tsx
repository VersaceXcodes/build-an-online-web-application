import React from 'react';
import { Cookie } from 'lucide-react';

const UV_Cookies: React.FC = () => {
  return (
    <div className="min-h-screen gradient-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-cream shadow-caramel-lg rounded-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-kake-caramel-200">
            <div className="p-3 gradient-caramel rounded-xl">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-kake-chocolate-500">
              Cookie Policy
            </h1>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none
            prose-headings:font-serif prose-headings:text-kake-chocolate-500
            prose-p:font-sans prose-p:text-kake-chocolate-500/90 prose-p:leading-relaxed
            prose-a:text-kake-caramel-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-kake-chocolate-500 prose-strong:font-semibold
            prose-ul:font-sans prose-ul:text-kake-chocolate-500/90
            prose-ol:font-sans prose-ol:text-kake-chocolate-500/90
            prose-li:leading-relaxed">
            
            <p>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <h3>What Are Cookies?</h3>
            <p>
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our site.
            </p>

            <h3>How We Use Cookies</h3>
            <p>We use cookies for the following purposes:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including maintaining your login session and shopping cart.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences, such as your selected location.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website so we can improve it.</li>
              <li><strong>Marketing Cookies:</strong> Used to show you relevant advertisements if you have opted in to marketing communications.</li>
            </ul>

            <h3>Managing Cookies</h3>
            <p>
              You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are stored on your device</li>
              <li>Delete some or all cookies</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Accept all cookies</li>
              <li>Be notified when a cookie is set</li>
            </ul>
            <p>
              Please note that blocking or deleting cookies may affect your ability to use certain features 
              of our website, such as staying logged in or maintaining your shopping cart.
            </p>

            <h3>Third-Party Cookies</h3>
            <p>
              We may use third-party services such as Google Analytics, payment processors, and social media 
              platforms, which may set their own cookies on your device. We do not have control over these 
              cookies and recommend reviewing the privacy policies of these third parties.
            </p>

            <h3>Your Consent</h3>
            <p>
              By using our website, you consent to our use of essential cookies. For non-essential cookies, 
              we will ask for your explicit consent through our cookie banner when you first visit our site.
            </p>

            <h3>Updates to This Policy</h3>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page 
              with an updated revision date.
            </p>

            <h3>Contact Us</h3>
            <p>
              If you have any questions about our use of cookies, please contact us at hello@kake.ie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UV_Cookies;
