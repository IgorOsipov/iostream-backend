import { type SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { Body, Heading, Link, Preview, Section, Tailwind, Text } from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

interface PasswordRecoveryTemplateProps {
  domain: string;
  token: string;
  metadata: SessionMetadata
}

export function PasswordRecoveryTemplate({
  domain,
  token,
  metadata
}: PasswordRecoveryTemplateProps) {
  const resetLink = `${domain}/account/recovery/${token}`;

  return (
    <Html>
      <Heading />
      <Preview>Password Recovery</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
            <Section className="text-center mb-8">
                <Heading className="text-3xl text-black font-bold">Password Recovery</Heading>
                <Text className="text-base text-black">You are receiving this email because you (or someone else) has requested a password reset for your account.</Text>
                <Link href={resetLink} className="inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] px-5 py-2">Reset Password</Link>
            </Section>
            <Section className="bg-gray-100 rounded-lg p-6 mb-6">
                <Heading className="text-xl text-[#18B9AE] font-semiblod">Request Details</Heading>
                 <ul className="list-disc list-inside mt-2 text-black">
                    <li>Location: {metadata.location.country}</li>
                    <li>OS: {metadata.device.os}</li>
                    <li>Browser: {metadata.device.browser}</li>
                    <li>IP Address: {metadata.ip}</li>
                 </ul>
                 <Text className="text-gray-600 mt-2">If you did not request a password reset, you can safely ignore this email.</Text>
            </Section>
            <Section className="text-center mt-8">
                <Text className="text-gray-600">If you have any questions, please contact us at <Link href="mailto:help@iostream.com" className="text-[#18B9AE]">help@iostream.com</Link>.</Text>
            </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
