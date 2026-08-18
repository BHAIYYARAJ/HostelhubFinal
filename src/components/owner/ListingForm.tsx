import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { DbHostel } from "@/hooks/useHostels";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { facilityOptions } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ImageUploader from "./ImageUploader";
import { geocodeAddress } from "@/lib/geocode";

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: DbHostel | null;
}

const emptyForm = {
  name: "",
  location: "",
  city: "",
  price: "",
  type: "co-ed" as "boys" | "girls" | "co-ed",
  occupancy: "Double",
  description: "",
  distanceFromCollege: "",
  facilities: [] as string[],
  rules: "",
  images: [] as string[],
  upiId: "",
  address: "",
  latitude: "" as string,
  longitude: "" as string,
};

const ListingForm = ({ open, onClose, editData }: Props) => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const isEdit = !!editData;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          name: editData.name,
          location: editData.location,
          city: editData.city,
          price: editData.price.toString(),
          type: editData.type as "boys" | "girls" | "co-ed",
          occupancy: editData.occupancy,
          description: editData.description,
          distanceFromCollege: editData.distance_from_college,
          facilities: editData.facilities,
          rules: editData.rules.join(", "),
          images: editData.images || [],
          upiId: "",
          address: (editData as any).address || "",
          latitude: editData.latitude != null ? String(editData.latitude) : "",
          longitude: editData.longitude != null ? String(editData.longitude) : "",
        });
        // UPI IDs live in a separate authenticated-only table
        supabase
          .from("hostel_upi")
          .select("upi_id")
          .eq("hostel_id", editData.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.upi_id) setForm((prev) => ({ ...prev, upiId: data.upi_id }));
          });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, editData]);

  const toggleFacility = (f: string) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.city.trim() || !form.price) {
      toast.error("Please fill in all required fields");
      return;
    }
    const price = parseInt(form.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setSaving(true);

    // Resolve coordinates: use provided lat/lng, otherwise geocode address/location/city.
    let latitude: number | null = form.latitude ? parseFloat(form.latitude) : null;
    let longitude: number | null = form.longitude ? parseFloat(form.longitude) : null;
    let resolvedAddress = form.address.trim();

    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
      const queryStr = [form.address, form.location, form.city].filter(Boolean).join(", ");
      const geo = await geocodeAddress(queryStr);
      if (!geo) {
        setSaving(false);
        toast.error("Could not locate that address. Please refine it or add coordinates.");
        return;
      }
      latitude = geo.lat;
      longitude = geo.lng;
      if (!resolvedAddress) resolvedAddress = geo.displayName;
    }
    const {
  data: { user: authUser },
} = await supabase.auth.getUser();

console.log("Auth UID:", authUser?.id);
console.log("Store UID:", user.id);

    const payload: any = {
      name: form.name.trim(),
      location: form.location.trim(),
      city: form.city.trim(),
      price,
      type: form.type,
      occupancy: form.occupancy,
      description: form.description.trim(),
      distance_from_college: form.distanceFromCollege.trim() || "N/A",
      facilities: form.facilities,
      rules: form.rules.split(",").map((r) => r.trim()).filter(Boolean),
      owner_name: user.name,
      owner_id: user.id,
      images: form.images.length > 0 ? form.images : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"],
      address: resolvedAddress || null,
      latitude,
      longitude,
    };

    const upiValue = form.upiId.trim();
    const upsertUpi = async (hostelId: string) => {
      if (upiValue) {
        await supabase.from("hostel_upi").upsert(
          { hostel_id: hostelId, owner_id: user.id, upi_id: upiValue, updated_at: new Date().toISOString() },
          { onConflict: "hostel_id" }
        );
      } else {
        await supabase.from("hostel_upi").delete().eq("hostel_id", hostelId);
      }
    };

    if (isEdit && editData) {
      const { error } = await supabase
        .from("hostels")
        .update(payload)
        .eq("id", editData.id);
      if (error) {
        setSaving(false);
        toast.error("Failed to update listing");
        return;
      }
      await upsertUpi(editData.id);
      setSaving(false);
      toast.success("Listing updated successfully!");
    } else {
      const { data: inserted, error } = await supabase.from("hostels").insert(payload).select("id").single();
      if (error) {
        setSaving(false);
        console.error(error);
toast.error(error.message);
        return;
      }
      if (inserted?.id) await upsertUpi(inserted.id);
      setSaving(false);
      toast.success("Listing created! It's now visible to students.");
    }

    queryClient.invalidateQueries({ queryKey: ["hostels"] });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-background shadow-elevated"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {isEdit ? "Edit Listing" : "Add New Listing"}
              </h2>
              <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="space-y-1.5">
                <Label>Photos</Label>
                {user && <ImageUploader images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} ownerId={user.id} />}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Property Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sunrise Student Haven" maxLength={100} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Bangalore" maxLength={50} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (₹/month) *</Label>
                  <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="8500" min={1} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Koramangala, Near Christ University" maxLength={200} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Full Address (for map)</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, area, landmark, city, pincode"
                  rows={2}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">
                  We'll auto-detect latitude/longitude from this address to place your listing on the map.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lat">Latitude (optional)</Label>
                  <Input id="lat" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Auto-filled" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lng">Longitude (optional)</Label>
                  <Input id="lng" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Auto-filled" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="co-ed">Co-ed</SelectItem>
                      <SelectItem value="boys">Boys</SelectItem>
                      <SelectItem value="girls">Girls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="distance">Distance from college</Label>
                  <Input id="distance" value={form.distanceFromCollege} onChange={(e) => setForm({ ...form, distanceFromCollege: e.target.value })} placeholder="0.5 km" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="occupancy">Occupancy</Label>
                <Input id="occupancy" value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })} placeholder="Single / Double / Triple" />
              </div>

              <div className="space-y-1.5">
                <Label>Facilities</Label>
                <div className="flex flex-wrap gap-2">
                  {facilityOptions.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.facilities.includes(f)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your property..." rows={3} maxLength={500} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upiId">UPI ID (for payments)</Label>
                <Input id="upiId" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} placeholder="e.g. yourname@upi" maxLength={100} />
                <p className="text-xs text-muted-foreground">Students will see a QR code to pay you directly</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rules">Rules (comma-separated)</Label>
                <Input id="rules" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="No smoking, Gate closes at 10 PM" maxLength={300} />
              </div>
              <div className="sticky bottom-0 flex gap-3 border-t border-border bg-background pt-4 pb-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? "Save Changes" : "Create Listing"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ListingForm;
