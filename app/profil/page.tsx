"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../src/components/layout/AppShell";
import { ProfileModal } from "../../src/features/profile/components/ProfileModal";
import { AuthModal } from "../../src/features/auth/AuthModal";
import { getCurrentUser, isUserLoggedIn } from "../../src/services/authService";

export default function ProfilPage() {
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
    <AppShell
      activeTab="profile"
      onProfileClick={() => {}}
      onTabChange={(tab) => {
        if (tab === "home" || tab === "favorites") {
          router.push("/");
        } else if (tab === "toko-saya") {
          router.push("/toko-saya");
        }
      }}
    >
      <div className="max-w-lg mx-auto py-2 sm:py-6 px-2 sm:px-4">
        <ProfileModal
          isOpen={true}
          isPage={true}
          onClose={() => router.push("/")}
          onLogoutSuccess={() => router.push("/")}
          className="shadow-none border-0 max-h-none my-0 rounded-none sm:rounded-3xl"
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthClose}
      />
    </AppShell>
  );
}
