'use client';

export default function TermsPage() {
  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 italic"><em>Last updated: June 2026</em></p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using this website, you agree to be bound by these Terms of Service. 
              If you do not agree with any part of these terms, you may not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">2. Property Listings</h2>
            <p className="text-gray-600 leading-relaxed">
              Property listings on our platform are provided for informational purposes. While we strive for accuracy, 
              we do not guarantee that all information is complete or current. Prices and availability are subject to 
              change without notice. All properties are subject to prior sale or withdrawal.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. 
              You agree to notify us immediately of any unauthorized use of your account. 
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">4. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, 
              is our property and is protected by Kenyan and international copyright laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              We shall not be liable for any indirect, incidental, or consequential damages 
              arising from your use of our website or services. We provide our platform &quot;as is&quot; 
              without any warranties, express or implied.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">6. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by the laws of the Republic of Kenya. Any disputes shall be 
              resolved through arbitration in Nairobi, Kenya.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-3">7. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting to this page. Your continued use of the website constitutes acceptance of modified terms.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
