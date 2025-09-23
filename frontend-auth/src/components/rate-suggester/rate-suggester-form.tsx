'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { aiService, type SuggestParkingRateOutput } from '@/lib/services/ai-service';
import { Bot, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  entryTime: z.string().datetime({ message: 'Please enter a valid date and time.' }),
  durationHours: z.coerce.number().min(0.1, { message: 'Duration must be at least 0.1 hours.' }),
  historicalData: z.string().min(10, { message: 'Please provide some historical data.' }),
});

const defaultHistoricalData = `
- Monday 9 AM, 2 hours, $5.00
- Monday 2 PM, 1 hour, $2.50
- Tuesday 9 AM, 8 hours, $20.00
- Friday 6 PM, 3 hours, $10.00 (event surcharge)
- Saturday 1 PM, 4 hours, $10.00
`.trim();

export default function RateSuggesterForm() {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<SuggestParkingRateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryTime: new Date().toISOString().slice(0, 16),
      durationHours: 1,
      historicalData: defaultHistoricalData,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await aiService.suggestParkingRate({
        ...values,
        entryTime: new Date(values.entryTime).toISOString(),
      });
      setSuggestion(result);
      
      toast({
        title: 'AI Suggestion Generated',
        description: `Suggested rate: $${result.suggestedRate.toFixed(2)}`,
      });
    } catch (e: any) {
      const errorMessage = e.message || 'An error occurred while fetching the suggestion.';
      setError(errorMessage);
      console.error('Rate suggester error:', e);
      
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Rate Suggester
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="entryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When will the vehicle enter the parking lot?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking Duration (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Expected parking duration in hours (e.g., 2.5)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={6} 
                        placeholder="Provide some historical parking data..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide examples of past parking sessions to improve accuracy.
                      Format: Day Time, Duration, Cost (e.g., Monday 9 AM, 2 hours, $5.00)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                <Bot className="mr-2 h-4 w-4" />
                {isLoading ? 'Thinking...' : 'Get AI Suggestion'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {suggestion && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" /> 
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Suggested Rate</p>
              <p className="text-4xl font-bold text-primary">
                ${suggestion.suggestedRate.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                per hour
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Reasoning</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {suggestion.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}