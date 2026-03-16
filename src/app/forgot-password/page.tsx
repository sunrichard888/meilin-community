import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white font-bold text-2xl shadow-lg">
            美
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          美邻网
        </h1>
      </div>

      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-center">忘记密码</CardTitle>
          <CardDescription className="text-center">
            功能开发中，敬请期待
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              如需重置密码，请联系社区管理员
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button className="w-full rounded-full" variant="default">
                返回登录
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button className="w-full rounded-full" variant="outline">
                注册新账号
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>客服邮箱：support@meilin.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
