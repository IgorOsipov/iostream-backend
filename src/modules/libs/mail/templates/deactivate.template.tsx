import {
  Body,
  Heading,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

import { type SessionMetadata } from '@/src/shared/types/session-metadata.types';

interface DeactivateTemplateProps {
  token: string;
  metadata: SessionMetadata;
}

export function DeactivateTemplate({
  token,
  metadata
}: DeactivateTemplateProps) {
  return (
    <Html>
      <Heading />
      <Preview>Account Deactivation</Preview>
      <Tailwind>
        <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
          <Section className='text-center mb-8'>
            <Heading className='text-3xl text-black font-bold'>
              Request to Deactivate Account
            </Heading>
            <Text className='text-base text-black'>
              We received a request to deactivate your account. If you did not
              make this request, please ignore this email.
            </Text>
          </Section>
          <Section className='bg-gray-100 rounded-lg p-6 mb-6 text-center'>
            <Heading className='text-2xl text-black font-semiblod'>
              Deactivation Code:
            </Heading>
            <Heading className='text-3xl text-black font-semiblod'>
              {token}
            </Heading>
            <Text className='text-black-600'>
              This code will expire in 5 minutes.
            </Text>
          </Section>
          <Section className='bg-gray-100 rounded-lg p-6 mb-6'>
            <Heading className='text-xl text-[#18B9AE] font-semiblod'>
              Request Details
            </Heading>
            <ul className='list-disc list-inside mt-2 text-black'>
              <li>Location: {metadata.location.country}</li>
              <li>OS: {metadata.device.os}</li>
              <li>Browser: {metadata.device.browser}</li>
              <li>IP Address: {metadata.ip}</li>
            </ul>
            <Text className='text-gray-600 mt-2'>
              If you did not request a password reset, you can safely ignore
              this email.
            </Text>
          </Section>
          <Section className='text-center mt-8'>
            <Text className='text-gray-600'>
              If you have any questions, please contact us at{' '}
              <Link href='mailto:help@iostream.com' className='text-[#18B9AE]'>
                help@iostream.com
              </Link>
              .
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
