import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  Sparkles, 
  MessageCircle, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Building2
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ThemeToggle } from './theme-toggle';

interface LandingPageProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (userData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    businessName: string; 
  }) => void;
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp(formData);
    } else {
      onLogin(formData.email, formData.password);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 text-cyan-400" />,
      title: "AI-Powered Assistant",
      description: "Get instant help with emails, scheduling, and business tasks through intelligent automation."
    },
    {
      icon: <Zap className="w-6 h-6 text-teal-400" />,
      title: "Smart Integrations", 
      description: "Connect your existing tools and let AI handle the repetitive work across all platforms."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: "Business Insights",
      description: "Discover optimization opportunities and track your efficiency gains with detailed analytics."
    },
    {
      icon: <Clock className="w-6 h-6 text-teal-400" />,
      title: "Time Savings",
      description: "Reduce admin burden by up to 80% with automated workflows and intelligent task prioritization."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      business: "Johnson Electrical",
      quote: "Intelligent Admin saved me 10 hours per week. The AI assistant handles my emails and scheduling perfectly.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJ1c2luZXNzJTIwb3duZXJ8ZW58MXx8fHwxNzU3Mzc4MzQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Mike Rodriguez", 
      business: "Rodriguez Plumbing",
      quote: "The lead follow-up automation increased my conversion rate by 40%. Best investment I've made.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBidXNpbmVzcyUyMG93bmVyfGVufDF8fHx8MTc1NzM3ODM0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl text-slate-900 dark:text-white">Intelligent Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => setIsSignUp(false)}>
                Sign In
              </Button>
              <Button 
                onClick={() => setIsSignUp(true)}
                className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Side - Hero & Features */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            {/* Hero Section */}
            <div className="mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white mb-6 leading-tight">
                Reduce Admin Burden with 
                <span className="bg-gradient-to-r from-cyan-500 to-teal-600 bg-clip-text text-transparent"> AI Intelligence</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Built specifically for small trade businesses. Let AI handle emails, scheduling, follow-ups, 
                and business insights while you focus on what matters most.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg"
                  onClick={() => setIsSignUp(true)}
                  className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-8"
                >
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Enterprise security</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-8">
              <h3 className="text-slate-900 dark:text-white mb-6">Trusted by Trade Professionals</h3>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <ImageWithFallback 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2 italic">"{testimonial.quote}"</p>
                    <div className="text-sm">
                      <span className="text-slate-900 dark:text-white">{testimonial.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">{testimonial.business}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center">
                {isSignUp ? 'Get Started' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp 
                  ? 'Create your account to start reducing admin burden'
                  : 'Sign in to your Intelligent Admin account'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            className="pl-9"
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            required={isSignUp}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Smith"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Smith Renovations"
                          className="pl-9"
                          value={formData.businessName}
                          onChange={(e) => updateFormData('businessName', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@smithrenovations.com"
                      className="pl-9"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">Or</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full">
                  Continue with Google
                </Button>

                <div className="text-center text-sm">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-cyan-600 hover:text-cyan-700"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="text-cyan-600 hover:text-cyan-700"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>

                {isSignUp && (
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}