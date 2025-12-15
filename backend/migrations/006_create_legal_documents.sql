-- ============================================
-- LEGAL DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Insert default Privacy Policy
INSERT INTO legal_documents (id, slug, title, content, created_at, updated_at) VALUES (
    'ld_privacypolicy001',
    'privacy-policy',
    'Privacy Policy',
    '<h2>Privacy Policy</h2>
<p>Last updated: ' || NOW()::TEXT || '</p>

<h3>1. Information We Collect</h3>
<p>We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, delivery address, and payment information.</p>

<h3>2. How We Use Your Information</h3>
<p>We use the information we collect to:</p>
<ul>
  <li>Process and fulfill your orders</li>
  <li>Communicate with you about your orders and account</li>
  <li>Send you promotional communications (if you opt in)</li>
  <li>Improve our services and customer experience</li>
  <li>Prevent fraud and enhance security</li>
</ul>

<h3>3. Information Sharing</h3>
<p>We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business, but only to the extent necessary for them to perform their services.</p>

<h3>4. Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h3>5. Your Rights</h3>
<p>You have the right to access, correct, or delete your personal information. You can manage your account settings or contact us to exercise these rights.</p>

<h3>6. Cookies</h3>
<p>We use cookies and similar technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>

<h3>7. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at hello@kake.ie</p>',
    NOW()::TEXT,
    NOW()::TEXT
) ON CONFLICT(slug) DO NOTHING;

-- Insert default Terms & Conditions
INSERT INTO legal_documents (id, slug, title, content, created_at, updated_at) VALUES (
    'ld_termsandconditions001',
    'terms-and-conditions',
    'Terms & Conditions',
    '<h2>Terms & Conditions</h2>
<p>Last updated: ' || NOW()::TEXT || '</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing and using the Kake website and services, you accept and agree to be bound by these Terms and Conditions.</p>

<h3>2. Use of Service</h3>
<p>You must be at least 18 years old to place an order. You agree to provide accurate, current, and complete information during the registration and ordering process.</p>

<h3>3. Orders and Payment</h3>
<p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Payment must be made at the time of ordering.</p>

<h3>4. Delivery and Collection</h3>
<p>Delivery times are estimates and not guaranteed. Collection orders must be picked up within the specified timeframe. We are not responsible for delays caused by factors beyond our control.</p>

<h3>5. Cancellations and Refunds</h3>
<p>Orders can be cancelled within a limited time after placement. Please contact us as soon as possible. Refunds will be processed according to our refund policy.</p>

<h3>6. Product Information</h3>
<p>We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions, images, or other content on our website are accurate, complete, or error-free.</p>

<h3>7. Allergies and Dietary Requirements</h3>
<p>Please inform us of any allergies or dietary requirements when placing your order. While we take care to accommodate requests, we cannot guarantee that our products are free from allergens.</p>

<h3>8. Intellectual Property</h3>
<p>All content on our website, including text, graphics, logos, and images, is the property of Kake and protected by copyright laws.</p>

<h3>9. Limitation of Liability</h3>
<p>To the fullest extent permitted by law, Kake shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of our services.</p>

<h3>10. Changes to Terms</h3>
<p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>

<h3>11. Contact Information</h3>
<p>For questions about these Terms & Conditions, please contact us at hello@kake.ie</p>',
    NOW()::TEXT,
    NOW()::TEXT
) ON CONFLICT(slug) DO NOTHING;
