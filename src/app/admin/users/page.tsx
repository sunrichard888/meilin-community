"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface User {
  id: string;
  nickname: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export default function UserManagementPage() {
  return (
    <ToastProvider>
      <UserManagement />
    </ToastProvider>
  );
}
