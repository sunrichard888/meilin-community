"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { AnnouncementEditor } from "@/components/AnnouncementEditor";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  author?: {
    nickname: string;
  };
}

export default function AnnouncementManagementPage() {
  return (
    <ToastProvider>
      <AnnouncementManagement />
    </ToastProvider>
  );
}
