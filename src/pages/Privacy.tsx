import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Users } from 'lucide-react'

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <p className="text-gray-500 mb-8">Last updated: January 24, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600" /> Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Crafts And Hands ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully. By using our services, you consent to the practices described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" /> Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through our payment providers)</li>
                  <li>Account credentials</li>
                  <li>Order history and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Usage data (pages visited, time spent on site)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" /> How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and account</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To improve our website and services</li>
              <li>To prevent fraud and ensure security</li>
              <li>To comply with legal obligations</li>
              <li>To connect buyers with artisan makers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" /> Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights (GDPR)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restriction:</strong> Request limited processing of your data</li>
              <li><strong>Right to Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience. You can manage your cookie preferences through your browser settings or our cookie consent banner. For more information, please see our Cookie Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements. Order data is retained for 7 years for tax and legal compliance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" /> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Crafts And Hands</strong><br />
                Email: privacy@craftsandhands.lt<br />
                Address: Vilnius, Lithuania
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
