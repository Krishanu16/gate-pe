import { useState } from 'react';
import { useRegister } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ProfileSetup() {
  const [email, setEmail] = useState('');
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await registerMutation.mutateAsync(email);
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen grid-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-3 border-notebook-dark bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-5xl text-notebook-dark">Welcome!</CardTitle>
          <CardDescription className="font-handwritten text-xl text-notebook-dark">
            Please set up your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="font-handwritten text-xl text-notebook-dark">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="font-handwritten text-lg border-2 border-notebook-dark py-6"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full font-handwritten text-xl py-6 bg-notebook-dark hover:bg-notebook-medium text-white border-2 border-notebook-dark"
            >
              {registerMutation.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
