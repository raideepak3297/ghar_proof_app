// Central TypeScript Data Contracts matching GharProof BE

export type UserRole = "landlord" | "tenant";

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt?: string;
}

export interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
  };
}

export interface AuthResponse {
  message?: string;
  user: User;
  accessToken: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  page: number;
  limit: number;
  total: number;
  size: number;
  hasMore: boolean;
}

export interface PropertyAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export type RentalStatus = "draft" | "invited" | "active" | "notice_period" | "completed" | "pending_move_in" | "pending_move_out" | "disputed";

export interface Rental {
  _id: string;
  id?: string;
  landlordId: string;
  tenantId?: string;
  propertyAddress: PropertyAddress;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate?: string;
  status: RentalStatus;
  tenantInviteEmail?: string;
  tenantInvitePhone?: string;
  moveInInspectionId?: string;
  moveOutInspectionId?: string;
  imageUrl?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  createdAt: string;
  updatedAt: string;
}

export type InspectionType = "move_in" | "move_out";
export type InspectionStatus = "draft" | "locked";
export type ItemCondition = "good" | "fair" | "poor" | "damaged" | "minor_scratch" | "not_working";

export interface InspectionPhoto {
  _id?: string;
  photoUrl: string;
  sha256Hash: string;
  uploadedAt: string;
}

export interface RoomItem {
  _id: string;
  inspectionId: string;
  roomName: string;
  itemName: string;
  condition: ItemCondition;
  notes?: string;
  photos: InspectionPhoto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Inspection {
  _id: string;
  rentalId: string;
  type: InspectionType;
  status: InspectionStatus;
  landlordSigned: boolean;
  tenantSigned: boolean;
  landlordSignedAt?: string;
  tenantSignedAt?: string;
  rootHash?: string;
  lockedAt?: string;
  notes?: string;
  items?: RoomItem[];
  createdAt: string;
  updatedAt: string;
}

export type DiffStatus = "unchanged" | "damaged_since_move_in" | "disputed" | "new_item";

export interface ComparisonItem {
  roomName: string;
  itemName: string;
  moveIn?: {
    _id?: string;
    condition: ItemCondition;
    photos?: any[];
    photoUrls?: string[];
    notes?: string;
  };
  moveOut?: {
    _id?: string;
    condition: ItemCondition;
    photos?: any[];
    photoUrls?: string[];
    notes?: string;
  };
  diffStatus: DiffStatus;
  disputeId?: string;
}

export interface ComparisonSummary {
  unchanged: number;
  damaged: number;
  disputed: number;
}

export interface ComparisonResult {
  rentalId: string;
  moveInLocked: boolean;
  moveOutLocked: boolean;
  summary: ComparisonSummary;
  comparisons: ComparisonItem[];
}

export type DisputeStatus = "proposed" | "accepted" | "disputed" | "settled";
export type DeductionCategory = "cleaning" | "damage" | "unpaid_utility" | "missing_item" | "other";

export interface Dispute {
  _id: string;
  rentalId: string;
  roomItemId?: string;
  category: DeductionCategory;
  proposedDeduction: number;
  description: string;
  evidencePhotoUrls?: string[];
  tenantStatus: "pending" | "accepted" | "disputed";
  tenantComment?: string;
  counterAmount?: number;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementSummary {
  depositAmount: number;
  totalAgreedDeductions: number;
  totalDisputedAmount: number;
  finalRefundAmount: number;
  disputes: Dispute[];
}
