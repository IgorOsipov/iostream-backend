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

interface AccountDeletionTemplateProps {
  domain: string;
}

export function AccountDeletionTemplate({
  domain
}: AccountDeletionTemplateProps) {
  const signUpLink = `${domain}/account/create`;
  return (
    <Html>
      <Heading />
      <Preview>Account has been deleted</Preview>
      <Tailwind>
        <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
          <Section className='text-center mb-8'>
            <Heading className='text-3xl text-black font-bold'>
              Your account has been deleted
            </Heading>
            <Text className='text-base text-black'>
              Your account has been completely deleted from our system. All data
              associated with your account has been removed.
            </Text>
          </Section>
          <Section className='bg-gray-100 rounded-lg p-6 mb-6 text-center'>
            <Text className='text-gray-600 mt-2'>
              You wont receive any more emails from us.
            </Text>
            <Text className='text-gray-600 mt-2'>
              If you want to get back to our platform, you can sign up by link
              below:
            </Text>
            <Link
              href={signUpLink}
              className='inline-flex justify-center items-center rounded-md mt-2 text-sm font-medium text-white bg-[#18B9AE] px-5 py-2'
            >
              Sign up at iostream.com
            </Link>
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
