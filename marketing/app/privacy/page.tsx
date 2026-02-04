import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'BBQCopilot Privacy Policy — Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: 'https://bbqcopilot.com/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-container px-6 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ash-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-char-400 mb-12">
          Effective Date: February 4, 2026
        </p>

        <div className="space-y-10 text-char-300 leading-relaxed text-base md:text-lg">
          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              1. Introduction
            </h2>
            <p>
              BBQCopilot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the BBQCopilot
              application and website (collectively, the &quot;Service&quot;). This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              Service.
            </p>
            <p className="mt-3">
              By using BBQCopilot, you agree to the collection and use of information in accordance
              with this policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              2. Information We Collect
            </h2>

            <h3 className="font-display text-xl font-medium text-ash-white mt-6 mb-3">
              2.1 Account Information
            </h3>
            <p>
              When you create an account, we collect your email address and basic profile information.
              If you sign in with Google OAuth, we receive your name, email address, and profile
              picture from Google. We do not receive or store your Google password.
            </p>

            <h3 className="font-display text-xl font-medium text-ash-white mt-6 mb-3">
              2.2 Equipment &amp; Recipe Data
            </h3>
            <p>
              We collect information you provide about your grills, smokers, and accessories
              (brand, model, type) as well as your recipe preferences, cook history, ratings,
              notes, and photos you upload.
            </p>

            <h3 className="font-display text-xl font-medium text-ash-white mt-6 mb-3">
              2.3 Usage Data
            </h3>
            <p>
              We automatically collect certain information when you use the Service, including
              pages visited, features used, device type, browser type, and general location
              (country/region level). This data is collected through PostHog, our analytics
              platform.
            </p>

            <h3 className="font-display text-xl font-medium text-ash-white mt-6 mb-3">
              2.4 Cookies &amp; Local Storage
            </h3>
            <p>
              We use cookies and browser local storage to maintain your authentication session,
              remember your preferences, and collect anonymous analytics data. You can disable
              cookies in your browser settings, though this may affect the functionality of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-ash-white">Authentication:</strong> To create and manage your
                account using Supabase Auth, including Google OAuth sign-in.
              </li>
              <li>
                <strong className="text-ash-white">Recipe Generation:</strong> To generate
                personalized BBQ recipes using the Anthropic Claude API, based on your equipment
                profile, preferences, and cook requests.
              </li>
              <li>
                <strong className="text-ash-white">Service Improvement:</strong> To understand how
                users interact with BBQCopilot and improve the experience.
              </li>
              <li>
                <strong className="text-ash-white">Communication:</strong> To send service-related
                notifications, updates, and respond to your inquiries.
              </li>
              <li>
                <strong className="text-ash-white">Usage Limits:</strong> To track recipe generation
                usage and enforce plan limits.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              4. Third-Party Services
            </h2>
            <p className="mb-4">
              We use the following third-party services to operate BBQCopilot. Each has its own
              privacy policy governing how they handle your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-ash-white">Supabase</strong> — Database hosting,
                authentication, and backend services.
              </li>
              <li>
                <strong className="text-ash-white">Google OAuth</strong> — Optional sign-in method.
                We only receive basic profile information (name, email, profile picture) and do not
                access any other Google account data.
              </li>
              <li>
                <strong className="text-ash-white">Anthropic (Claude API)</strong> — AI-powered
                recipe generation. Your equipment profile and cook requests are sent to generate
                personalized recipes. Anthropic does not use this data to train their models.
              </li>
              <li>
                <strong className="text-ash-white">PostHog</strong> — Privacy-friendly product
                analytics to understand how the Service is used.
              </li>
              <li>
                <strong className="text-ash-white">Vercel</strong> — Website hosting and delivery.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              5. Data Sharing &amp; Selling
            </h2>
            <p>
              <strong className="text-ash-white">We do not sell your personal information.</strong>{' '}
              We do not share your data with third parties for their marketing purposes. We only
              share data with the third-party service providers listed above, solely to operate
              and improve the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              6. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your data, including
              encrypted connections (HTTPS/TLS), secure authentication via Supabase, and
              row-level security on our database. However, no method of electronic transmission
              or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              7. Data Retention
            </h2>
            <p>
              We retain your account and recipe data for as long as your account is active. If you
              delete your account, we will delete your personal data within 30 days, except where
              we are required to retain it for legal or operational reasons.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              8. Your Rights
            </h2>
            <p className="mb-4">
              Depending on your location, you may have the following rights regarding your personal
              data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-ash-white">Access:</strong> Request a copy of the personal
                data we hold about you.
              </li>
              <li>
                <strong className="text-ash-white">Correction:</strong> Request that we correct
                inaccurate or incomplete data.
              </li>
              <li>
                <strong className="text-ash-white">Deletion:</strong> Request that we delete your
                personal data and account.
              </li>
              <li>
                <strong className="text-ash-white">Portability:</strong> Request a copy of your data
                in a portable format.
              </li>
              <li>
                <strong className="text-ash-white">Opt-Out:</strong> Opt out of analytics tracking
                by disabling cookies or contacting us directly.
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a
                href="mailto:travis.shields@gmail.com"
                className="text-ember-500 hover:text-ember-400 underline transition-colors"
              >
                travis.shields@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p>
              BBQCopilot is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children. If you believe we have collected data from
              a child, please contact us and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the updated policy on this page and updating the effective date. Your
              continued use of the Service after changes are posted constitutes acceptance of the
              revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-ash-white mb-4">
              11. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices,
              please contact us at:
            </p>
            <p className="mt-3">
              <a
                href="mailto:travis.shields@gmail.com"
                className="text-ember-500 hover:text-ember-400 underline transition-colors"
              >
                travis.shields@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
