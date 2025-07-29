import { Logo } from '@/components/ui';
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className='bg-background border-t border-border py-8'>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Company Info */}
          <div>
            <div className='mb-4'>
              <Logo size='sm' />
            </div>
            <p className='text-sm text-gray-600 mb-4'>
              AI-powered administrative assistant designed specifically for Australian trade businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Quick Links</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='/help' className='text-gray-600 hover:text-blue-600'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='/privacy' className='text-gray-600 hover:text-blue-600'>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href='/terms' className='text-gray-600 hover:text-blue-600'>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href='/contact' className='text-gray-600 hover:text-blue-600'>
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Support</h3>
            <p className='text-sm text-gray-600 mb-2'>Need help getting started?</p>
            <p className='text-sm text-blue-600 font-medium'>support@intelligent-admin.com.au</p>
          </div>
        </div>

        <div className='border-t border-gray-200 mt-8 pt-6 text-center'>
          <p className='text-sm text-gray-500'>&copy; 2025 Intelligent Admin. Made for Australian trade businesses.</p>
        </div>
      </div>
    </footer>
  );
};
