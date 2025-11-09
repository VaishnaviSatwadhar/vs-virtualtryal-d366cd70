import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler, Save } from 'lucide-react';

interface UserMeasurementsFormProps {
  onSuccess?: () => void;
}

export const UserMeasurementsForm = ({ onSuccess }: UserMeasurementsFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({
    height_cm: '',
    weight_kg: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    shoulder_width_cm: '',
    sleeve_length_cm: '',
    inseam_cm: '',
    shoe_size: '',
    body_type: '',
    preferred_fit: '',
  });

  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_measurements')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMeasurements({
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || '',
          chest_cm: data.chest_cm?.toString() || '',
          waist_cm: data.waist_cm?.toString() || '',
          hips_cm: data.hips_cm?.toString() || '',
          shoulder_width_cm: data.shoulder_width_cm?.toString() || '',
          sleeve_length_cm: data.sleeve_length_cm?.toString() || '',
          inseam_cm: data.inseam_cm?.toString() || '',
          shoe_size: data.shoe_size || '',
          body_type: data.body_type || '',
          preferred_fit: data.preferred_fit || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading measurements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        user_id: user?.id,
        height_cm: measurements.height_cm ? parseFloat(measurements.height_cm) : null,
        weight_kg: measurements.weight_kg ? parseFloat(measurements.weight_kg) : null,
        chest_cm: measurements.chest_cm ? parseFloat(measurements.chest_cm) : null,
        waist_cm: measurements.waist_cm ? parseFloat(measurements.waist_cm) : null,
        hips_cm: measurements.hips_cm ? parseFloat(measurements.hips_cm) : null,
        shoulder_width_cm: measurements.shoulder_width_cm ? parseFloat(measurements.shoulder_width_cm) : null,
        sleeve_length_cm: measurements.sleeve_length_cm ? parseFloat(measurements.sleeve_length_cm) : null,
        inseam_cm: measurements.inseam_cm ? parseFloat(measurements.inseam_cm) : null,
        shoe_size: measurements.shoe_size || null,
        body_type: measurements.body_type || null,
        preferred_fit: measurements.preferred_fit || null,
      };

      const { error } = await supabase
        .from('user_measurements')
        .upsert(data, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your measurements have been saved.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save measurements.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          My Measurements
        </CardTitle>
        <CardDescription>
          Enter your measurements for a personalized virtual try-on experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                placeholder="170"
                value={measurements.height_cm}
                onChange={(e) => setMeasurements({ ...measurements, height_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                placeholder="65"
                value={measurements.weight_kg}
                onChange={(e) => setMeasurements({ ...measurements, weight_kg: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chest">Chest (cm)</Label>
              <Input
                id="chest"
                type="number"
                step="0.01"
                placeholder="90"
                value={measurements.chest_cm}
                onChange={(e) => setMeasurements({ ...measurements, chest_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.01"
                placeholder="75"
                value={measurements.waist_cm}
                onChange={(e) => setMeasurements({ ...measurements, waist_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hips">Hips (cm)</Label>
              <Input
                id="hips"
                type="number"
                step="0.01"
                placeholder="95"
                value={measurements.hips_cm}
                onChange={(e) => setMeasurements({ ...measurements, hips_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoulder">Shoulder Width (cm)</Label>
              <Input
                id="shoulder"
                type="number"
                step="0.01"
                placeholder="42"
                value={measurements.shoulder_width_cm}
                onChange={(e) => setMeasurements({ ...measurements, shoulder_width_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleeve">Sleeve Length (cm)</Label>
              <Input
                id="sleeve"
                type="number"
                step="0.01"
                placeholder="60"
                value={measurements.sleeve_length_cm}
                onChange={(e) => setMeasurements({ ...measurements, sleeve_length_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inseam">Inseam (cm)</Label>
              <Input
                id="inseam"
                type="number"
                step="0.01"
                placeholder="78"
                value={measurements.inseam_cm}
                onChange={(e) => setMeasurements({ ...measurements, inseam_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoe">Shoe Size</Label>
              <Input
                id="shoe"
                type="text"
                placeholder="US 9 / EU 42"
                value={measurements.shoe_size}
                onChange={(e) => setMeasurements({ ...measurements, shoe_size: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyType">Body Type</Label>
              <Select
                value={measurements.body_type}
                onValueChange={(value) => setMeasurements({ ...measurements, body_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="slim">Slim</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="curvy">Curvy</SelectItem>
                  <SelectItem value="plus">Plus Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fit">Preferred Fit</Label>
              <Select
                value={measurements.preferred_fit}
                onValueChange={(value) => setMeasurements({ ...measurements, preferred_fit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">Tight Fit</SelectItem>
                  <SelectItem value="slim">Slim Fit</SelectItem>
                  <SelectItem value="regular">Regular Fit</SelectItem>
                  <SelectItem value="relaxed">Relaxed Fit</SelectItem>
                  <SelectItem value="oversized">Oversized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Measurements'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
