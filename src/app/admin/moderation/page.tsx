"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface Report {
  id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  post?: {
    id: string;
    content: string;
  };
  reporter?: {
    nickname: string;
  };
  reported_user?: {
    nickname: string;
  };
}

export default function ModerationPage() {
  return (
    <ToastProvider>
      <ModerationInner />
    </ToastProvider>
  );
}
