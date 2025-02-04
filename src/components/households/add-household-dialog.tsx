"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/use-api";

interface Program {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface County extends Location {
  subcounties: SubCounty[];
}

interface SubCounty extends Location {
  locations: Location[];
}

interface LocationWithSublocations extends Location {
  sublocations: Location[];
}

interface ValidationErrors {
  head_first_name?: string;
  head_last_name?: string;
  head_id_number?: string;
  phone?: string;
  program_id?: string;
  sublocation_id?: string;
  [key: string]: string | undefined;
}

interface AddHouseholdDialogProps {
  onSuccess: () => void;
}

export function AddHouseholdDialog({ onSuccess }: AddHouseholdDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [programs, setPrograms] = useState<Program[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedSublocation, setSelectedSublocation] = useState<string>("");
  const api = useApi();

  useEffect(() => {
    async function loadData() {
      try {
        const [programsResponse, countiesResponse] = await Promise.all([
          api.getPrograms(),
          api.getCounties(),
        ]);
        setPrograms(programsResponse.data);
        setCounties(countiesResponse.data);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }

    if (open) {
      loadData();
    }
  }, [api, open]);

  const subcounties = selectedCounty 
    ? counties.find(c => c.id.toString() === selectedCounty)?.subcounties || []
    : [];

  const locations = selectedSubCounty
    ? subcounties.find(sc => sc.id.toString() === selectedSubCounty)?.locations || []
    : [];

  const sublocations = selectedLocation
    ? locations.find(l => l.id.toString() === selectedLocation)?.sublocations || []
    : [];

  function validateForm(formData: FormData): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!formData.get("head_first_name")) {
      errors.head_first_name = "First name is required";
    }
    
    if (!formData.get("head_last_name")) {
      errors.head_last_name = "Last name is required";
    }

    if (!formData.get("head_id_number")) {
      errors.head_id_number = "ID number is required";
    }

    const phone = formData.get("phone") as string;
    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^254\d{9}$/.test(phone)) {
      errors.phone = "Phone number must be in format: 254XXXXXXXXX";
    }

    if (!formData.get("program_id")) {
      errors.program_id = "Program selection is required";
    }

    if (!selectedSublocation) {
      errors.sublocation_id = "Location selection is required";
    }

    return errors;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    const formData = new FormData(event.currentTarget);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const data = {
      head_first_name: formData.get("head_first_name") as string,
      head_last_name: formData.get("head_last_name") as string,
      head_id_number: formData.get("head_id_number") as string,
      phone: formData.get("phone") as string,
      program_id: parseInt(formData.get("program_id") as string),
      sublocation_id: parseInt(selectedSublocation),
    };

    try {
      await api.createHousehold(data);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create household:", error);
      if (error instanceof Error) {
        // Handle specific API error responses
        if (error.message.includes("already exists")) {
          setError("A household with this ID number already exists");
        } else if (error.message.includes("validation")) {
          setError("Please check all required fields");
        } else {
          setError("Failed to create household. Please try again.");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Household
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Household</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="head_first_name">First Name</Label>
              <Input
                id="head_first_name"
                name="head_first_name"
                placeholder="Enter first name"
                required
                disabled={isLoading}
                className={validationErrors.head_first_name ? "border-red-500" : ""}
              />
              {validationErrors.head_first_name && (
                <p className="text-sm text-red-500">
                  {validationErrors.head_first_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head_last_name">Last Name</Label>
              <Input
                id="head_last_name"
                name="head_last_name"
                placeholder="Enter last name"
                required
                disabled={isLoading}
                className={validationErrors.head_last_name ? "border-red-500" : ""}
              />
              {validationErrors.head_last_name && (
                <p className="text-sm text-red-500">
                  {validationErrors.head_last_name}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="head_id_number">ID Number</Label>
            <Input
              id="head_id_number"
              name="head_id_number"
              placeholder="Enter ID number"
              required
              disabled={isLoading}
              className={validationErrors.head_id_number ? "border-red-500" : ""}
            />
            {validationErrors.head_id_number && (
              <p className="text-sm text-red-500">
                {validationErrors.head_id_number}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="e.g., 254712345678"
              required
              disabled={isLoading}
              className={validationErrors.phone ? "border-red-500" : ""}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-500">
                {validationErrors.phone}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="program_id">Program</Label>
            <Select name="program_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id.toString()}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Select 
                value={selectedCounty} 
                onValueChange={(value) => {
                  setSelectedCounty(value);
                  setSelectedSubCounty("");
                  setSelectedLocation("");
                  setSelectedSublocation("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county.id} value={county.id.toString()}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcounty">Sub-County</Label>
              <Select 
                value={selectedSubCounty}
                onValueChange={(value) => {
                  setSelectedSubCounty(value);
                  setSelectedLocation("");
                  setSelectedSublocation("");
                }}
                disabled={!selectedCounty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-county" />
                </SelectTrigger>
                <SelectContent>
                  {subcounties.map((subcounty) => (
                    <SelectItem key={subcounty.id} value={subcounty.id.toString()}>
                      {subcounty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select 
                value={selectedLocation}
                onValueChange={(value) => {
                  setSelectedLocation(value);
                  setSelectedSublocation("");
                }}
                disabled={!selectedSubCounty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sublocation">Sub-Location</Label>
              <Select 
                value={selectedSublocation}
                onValueChange={setSelectedSublocation}
                disabled={!selectedLocation}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-location" />
                </SelectTrigger>
                <SelectContent>
                  {sublocations.map((sublocation) => (
                    <SelectItem key={sublocation.id} value={sublocation.id.toString()}>
                      {sublocation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError(null);
                setValidationErrors({});
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Household"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 