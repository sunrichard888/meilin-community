import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ 
  icon = "📭", 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="text-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
