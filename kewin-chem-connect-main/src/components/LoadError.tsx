import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/contact';

/** Shown when the API can't be reached: offer retry plus a direct way to reach us. */
export default function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="max-w-md mx-auto text-center py-12 space-y-4">
      <p className="text-lg font-medium text-foreground">We couldn't load this right now.</p>
      <p className="text-muted-foreground">Please try again, or contact us directly and we'll send you the product list and prices.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <Button variant="outline" asChild>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
        </Button>
      </div>
    </div>
  );
}
