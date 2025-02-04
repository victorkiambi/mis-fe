const API_BASE_URL = "https://mis.fly.dev/api/v1";

interface ApiClientConfig {
  token?: string | null;
}

interface Location {
  sublocation: string;
  location: string;
  subcounty: string;
  county: string;
}

interface Program {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  phone: string;
  location: string;
  program_id: number;
}

interface Household {
  id: number;
  head_first_name: string;
  head_last_name: string;
  phone: string;
  program: Program;
  location: Location;
}

interface AdminLocation {
  id: number;
  name: string;
  code: string;
  type: string;
  parent: {
    id: number;
    name: string;
    type: string;
  } | null;
  households_count: number;
}

interface CreateProgramData {
  name: string;
  description: string;
}

interface CreateHouseholdData {
  head_first_name: string;
  head_last_name: string;
  head_id_number: string;
  phone: string;
  program_id: number;
  sublocation_id: number;
}

interface CreateMemberData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  relationship: string;
}

class ApiClient {
  private token: string | null;
  private baseUrl: string;

  constructor(config: ApiClientConfig = {}) {
    this.token = config.token || null;
    // Use relative URL for the API proxy
    this.baseUrl = '/api';
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token && endpoint !== '/auth/login') {
      throw new Error("No token provided");
    }

    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      "Accept": "application/json",
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.fetch<ApiResponse<{ token: string }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Programs endpoints
  async getPrograms() {
    return this.fetch<ApiResponse<Program[]>>("/programs");
  }

  async createProgram(data: CreateProgramData) {
    return this.fetch<ApiResponse<Program>>("/programs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Households endpoints
  async getHouseholds() {
    return this.fetch<ApiResponse<Household[]>>("/households", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async getHouseholdMembers(householdId: number) {
    return this.fetch<ApiResponse<Member[]>>(`/households/${householdId}/members`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async createHousehold(data: CreateHouseholdData) {
    console.log(data);
    return this.fetch<ApiResponse<Household>>("/households", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Locations endpoints
  async getCounties() {
    return this.fetch("/locations/counties");
  }

  async getSubcounties(countyId: number) {
    return this.fetch(`/locations/counties/${countyId}/subcounties`);
  }

  async getLocations() {
    return this.fetch<ApiResponse<AdminLocation[]>>("/locations", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async getSublocations(locationId: number) {
    return this.fetch(`/locations/locations/${locationId}/sublocations`);
  }

  // Program Members endpoints
  async getProgramMembers(programId: number) {
    return this.fetch<ApiResponse<Member[]>>(`/programs/${programId}/households`);
  }

  // Members endpoints
  async getMembers() {
    return this.fetch<ApiResponse<Member[]>>("/members/all", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async createHouseholdMember(householdId: number, data: CreateMemberData) {
    return this.fetch<ApiResponse<Member>>(`/households/${householdId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export function createApiClient(token?: string) {
  return new ApiClient({ token });
} 