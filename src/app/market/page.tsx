import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold mb-2">页面开发中</h1>
        <p className="text-muted-foreground">
          我们正在努力构建这个功能，敬请期待！
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              您访问的页面正在紧张开发中，稍后再来看看吧~
            </p>
            
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button className="w-full rounded-full">返回首页</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
