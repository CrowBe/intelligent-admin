import { Button, Card, CardContent, Logo } from '@/components/ui';
import { useAppAuth } from '@/contexts/KindeAuthContext';
import React from 'react';

export const LandingPage: React.FC = () => {
  const { login } = useAppAuth();

  const features = [
    {
      icon: '🤖',
      title: 'AI Email Intelligence',
      description:
        'Automatically prioritize and categorize your emails with AI-powered analysis tailored for trade businesses.',
    },
    {
      icon: '📊',
      title: 'Morning Digest',
      description: 'Start each day with a personalized summary of urgent emails and actionable insights.',
    },
    {
      icon: '🔗',
      title: 'Gmail Integration',
      description: 'Seamlessly connect with your existing Gmail account - no need to change email providers.',
    },
    {
      icon: '🇦🇺',
      title: 'Built for Aussie Tradies',
      description: 'Designed specifically for Australian trade businesses with industry-specific features.',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted'>
      {/* Hero Section */}
      <div className='container mx-auto px-4 py-16 lg:py-24'>
        <div className='text-center max-w-4xl mx-auto'>
          <div className='flex justify-center mb-8'>
            <Logo size='xl' showText={false} />
          </div>

          <h1 className='text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance'>
            Your AI-Powered
            <span className='text-primary'> Administrative Assistant</span>
          </h1>

          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance'>
            Streamline your trade business operations with intelligent email management, automated prioritization, and
            AI-driven insights - designed specifically for Australian small businesses.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' onClick={() => login()} className='text-lg px-8 py-4'>
              Get Started Free 🚀
            </Button>
            <Button
              variant='outline'
              size='lg'
              className='text-lg px-8 py-4'
              onClick={e => {
                e.currentTarget.ownerDocument.getElementById('features')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              Learn More
            </Button>
          </div>

          <p className='text-sm text-muted-foreground mt-4'>
            ✅ No credit card required • ✅ Setup in under 2 minutes • ✅ Australian owned & operated
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section id='features' className='py-16 bg-background'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>
              Built for Australian Trade Businesses
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Stop drowning in emails and start focusing on what matters most - growing your business and serving your
              customers.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => (
              <Card key={index} className='text-center h-full'>
                <CardContent className='pt-6'>
                  <div className='text-4xl mb-4'>{feature.icon}</div>
                  <h3 className='text-lg font-semibold text-foreground mb-3'>{feature.title}</h3>
                  <p className='text-muted-foreground text-sm'>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-16 bg-muted/20'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>How It Works</h2>
            <p className='text-lg text-muted-foreground'>Get up and running in minutes</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            {[
              {
                step: '1',
                title: 'Connect Your Gmail',
                description: 'Securely link your existing Gmail account with our OAuth integration.',
              },
              {
                step: '2',
                title: 'AI Analyzes Your Emails',
                description:
                  'Our AI instantly categorizes and prioritizes your emails based on trade business patterns.',
              },
              {
                step: '3',
                title: 'Get Your Daily Digest',
                description: 'Receive personalized insights and action items to stay on top of your business.',
              },
            ].map((item, index) => (
              <div key={index} className='text-center'>
                <div className='w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4'>
                  {item.step}
                </div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>{item.title}</h3>
                <p className='text-muted-foreground'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-primary text-primary-foreground'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl lg:text-4xl font-bold mb-4'>Ready to Transform Your Business Operations?</h2>
          <p className='text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto'>
            Join hundreds of Australian trade businesses already using Intelligent Admin to streamline their operations.
          </p>
          <Button size='lg' variant='secondary' onClick={() => login()} className='text-lg px-8 py-4'>
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};
