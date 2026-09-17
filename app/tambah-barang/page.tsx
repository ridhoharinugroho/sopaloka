"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../src/components/layout/AppShell";
import { ListingForm } from "../../src/features/listing-management/components/ListingForm";
import { AuthModal } from "../../src/features/auth/AuthModal";
import { getCurrentUser, isUserLoggedIn } from "../../src/services/authService";

export default function TambahBarangPage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoggedIn()) {
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleAuthClose = () => {
    setIsAuthModalOpen(false);
    if (!isUserLoggedIn()) {
      router.push("/");
    }
  };

  return (
    <AppShell activeTab="home">
      <div className="max-w-2xl mx-auto py-4 px-3 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-slate-100">
          <ListingForm
            onClose={() => router.push("/")}
            currentUser={getCurrentUser() as any}
          />
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthClose}
      />
    </AppShell>
  );
}
