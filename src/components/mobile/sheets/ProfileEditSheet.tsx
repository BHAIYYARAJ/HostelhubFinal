import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppSheet } from "@/components/mobile/AppSheet";
import { AppButton } from "@/components/mobile/MobileKit";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export function ProfileEditSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, ref_id")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url);
        setRefId((data as any).ref_id ?? null);
      }
      setLoading(false);
    })();
  }, [open, user]);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
    });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setAvatarUrl(url);
    setUploading(false);
    toast.success("Photo updated");
  };

  const save = async () => {
    if (!user) return;
    if (fullName.trim().length < 2) {
      toast.error("Enter your name");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUser({ ...user, name: fullName.trim() });
    toast.success("Profile updated");
    onOpenChange(false);
  };

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit profile"
      description="Update your name, phone and photo"
      footer={
        <AppButton onClick={save} disabled={saving || loading}>
          {saving ? "Saving…" : "Save changes"}
        </AppButton>
      }
    >
      {loading ? (
        <div className="grid place-items-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-5 pb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="tap relative grid h-20 w-20 place-items-center overflow-hidden rounded-3xl bg-coral-light"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Your photo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[24px] font-extrabold text-primary">
                  {(fullName || user?.email || "?").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute bottom-0 inset-x-0 grid place-items-center bg-black/45 py-1">
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-white" />
                )}
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-[14px] font-bold tracking-tight text-foreground">
                {user?.email}
              </p>
              {refId && (
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{refId}</p>
              )}
              <p className="mt-0.5 text-[12px] text-muted-foreground">JPG or PNG, under 2MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-bold text-foreground">Full name</p>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="h-12 rounded-2xl"
            />
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-bold text-foreground">Phone</p>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              inputMode="tel"
              className="h-12 rounded-2xl"
            />
          </div>
        </div>
      )}
    </AppSheet>
  );
}
