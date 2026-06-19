'use client';

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 italic"><em>Last updated: June 2026</em></p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information you provide directly, including your name, email address, phone number, 
              and property preferences. We also automatically collect certain technical information when you visit our website, 
              such as IP address, browser type, and pages viewed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-600">
              <li>Provide, maintain, and improve our real estate services</li>
              <li>Send you property alerts and marketing communications (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Comply with legal obligations and prevent fraud</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">3. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal information to third parties. We may share your data with trusted partners 
              (such as HubSpot for CRM) who help us operate our business, subject to strict confidentiality agreements.
              We may also disclose information when required by law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure data storage, 
              and regular security audits to protect your personal information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">5. Your Rights (GDPR Compliance)</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-600">
              <li>Access your personal data held by us</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies for website functionality and analytics cookies to improve performance. 
              You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">7. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related inquiries, contact us at privacy@tobillionhomes.co.ke or 
              visit our office at Westlands Business Park, Nairobi, Kenya.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
