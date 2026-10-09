"use client";
import { useEffect } from "react";
import { refreshSession } from "@/lib/api";
import { useAuth } from "@/lib/store";

/** Sahifa ochilganda httpOnly cookie orqali sessiyani tiklaydi. */
export default function AuthBootstrap() {
  useEffect(() => {
    refreshSession().finally(() => useAuth.getState().setReady());
  }, []);
  return null;
}
