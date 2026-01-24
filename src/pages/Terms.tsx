import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, ShoppingBag, CreditCard, Truck, RotateCcw, Scale } from 'lucide-react'

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        </div>
        <p className="text-gray-500 mb-8">Last updated: January 24, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Crafts And Hands. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. About Our Platform</h2>
            <p className="text-gray-600 leading-relaxed">
              Crafts And Hands is an online marketplace connecting buyers with Lithuanian artisans and craftspeople. We facilitate transactions between buyers and independent makers but are not ourselves the sellers of the products listed on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" /> 3. Products and Orders
            </h2>
            <div className="space-y-4 text-gray-600">
              <p><strong>3.1 Product Descriptions:</strong> We strive to ensure product descriptions are accurate. However, as products are handmade, slight variations in color, size, and pattern are normal and expected.</p>
              <p><strong>3.2 Pricing:</strong> All prices are displayed in Euros (EUR) and include applicable taxes unless otherwise stated. Shipping costs are calculated at checkout based on your location.</p>
              <p><strong>3.3 Order Acceptance:</strong> Your order constitutes an offer to purchase. We reserve the right to refuse or cancel orders at our discretion, including due to stock availability or pricing errors.</p>
              <p><strong>3.4 Customization:</strong> Custom orders are made to your specifications and may be subject to different return policies as noted on the product page.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" /> 4. Payment
            </h2>
            <div className="space-y-4 text-gray-600">
              <p><strong>4.1 Payment Methods:</strong> We accept major credit cards and other payment methods as displayed at checkout. All payments are processed securely through our payment providers.</p>
              <p><strong>4.2 Payment Security:</strong> We do not store your full payment card details. All payment information is encrypted and processed in compliance with PCI DSS standards.</p>
              <p><strong>4.3 Currency:</strong> All transactions are processed in Euros (EUR).</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" /> 5. Shipping and Delivery
            </h2>
            <div className="space-y-4 text-gray-600">
              <p><strong>5.1 Shipping Times:</strong> Estimated delivery times vary by location and shipping method selected. These are estimates and not guarantees.</p>
              <p><strong>5.2 Shipping Costs:</strong> Shipping costs are calculated based on your delivery address and displayed at checkout. Free shipping may be available for orders above certain thresholds.</p>
              <p><strong>5.3 International Shipping:</strong> International orders may be subject to customs duties and taxes, which are the responsibility of the buyer.</p>
              <p><strong>5.4 Risk of Loss:</strong> Risk of loss passes to you upon delivery of items to the carrier.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" /> 6. Returns and Refunds
            </h2>
            <div className="space-y-4 text-gray-600">
              <p><strong>6.1 Return Policy:</strong> Standard items may be returned within 30 days of delivery if unused and in original condition. Custom or personalized items are generally not eligible for return.</p>
              <p><strong>6.2 Return Process:</strong> To initiate a return, request an RMA through your account. Items must be shipped back within 14 days of approval.</p>
              <p><strong>6.3 Refunds:</strong> Refunds are processed within 5-7 business days after we receive the returned item. Original shipping costs are non-refundable unless the return is due to our error.</p>
              <p><strong>6.4 Defective Items:</strong> If you receive a defective or damaged item, please contact us within 48 hours of delivery for a full refund or replacement.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. User Accounts</h2>
            <div className="space-y-4 text-gray-600">
              <p><strong>7.1 Account Creation:</strong> You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.</p>
              <p><strong>7.2 Account Accuracy:</strong> You agree to provide accurate and complete information when creating your account and to update it as needed.</p>
              <p><strong>7.3 Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on our platform, including text, graphics, logos, and images, is the property of Crafts And Hands or our makers and is protected by intellectual property laws. Product images and descriptions remain the property of the respective artisans.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, Crafts And Hands shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the product in question.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" /> 10. Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the Republic of Lithuania and the European Union. Any disputes shall be resolved in the courts of Vilnius, Lithuania, unless mandatory consumer protection laws of your country of residence provide otherwise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the new Terms. We will notify you of significant changes via email or through our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Crafts And Hands</strong><br />
                Email: legal@craftsandhands.lt<br />
                Address: Vilnius, Lithuania
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
