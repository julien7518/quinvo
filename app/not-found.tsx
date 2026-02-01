import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-6xl font-bold">404</h1>
          </div>
          <CardTitle className="text-2xl">Page non trouvée</CardTitle>
          <CardDescription>
            La page que vous cherchez n'existe pas ou a été déplacée
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/">Aller au tableau de bord</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/home">
              <HomeIcon className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
