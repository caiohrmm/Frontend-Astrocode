/**
 * Properties Service
 * Handles all property-related API calls
 */

import { apiClient } from './api'

export type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'RURAL'
export type BusinessType = 'SALE' | 'RENT' | 'BOTH'
export type PropertyStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'RENTED' | 'UNAVAILABLE'

export interface Property {
  id: string
  code: string
  title: string
  description: string | null
  property_type: PropertyType
  business_type: BusinessType
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  latitude: string | null
  longitude: string | null
  area_total: string | null
  area_built: string | null
  bedrooms: number | null
  bathrooms: number | null
  parking_spaces: number | null
  floor: number | null
  has_elevator: boolean
  furnished: boolean
  price: string | null
  rent_price: string | null
  condo_fee: string | null
  iptu: string | null
  status: PropertyStatus
  assigned_agent_id: string | null
  owner_name: string | null
  owner_contact: string | null
  visibility_score: number | null
  ideal_client_profile: string | null
  main_image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PropertyCreate {
  code: string
  title: string
  description?: string | null
  property_type: PropertyType
  business_type: BusinessType
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  latitude?: string | null
  longitude?: string | null
  area_total?: string | null
  area_built?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking_spaces?: number | null
  floor?: number | null
  has_elevator?: boolean
  furnished?: boolean
  price?: string | null
  rent_price?: string | null
  condo_fee?: string | null
  iptu?: string | null
  status?: PropertyStatus
  assigned_agent_id?: string | null
  owner_name?: string | null
  owner_contact?: string | null
  visibility_score?: number | null
  ideal_client_profile?: string | null
  main_image_url?: string | null
}

export interface PropertyUpdate {
  code?: string
  title?: string
  description?: string | null
  property_type?: PropertyType
  business_type?: BusinessType
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string
  latitude?: string | null
  longitude?: string | null
  area_total?: string | null
  area_built?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking_spaces?: number | null
  floor?: number | null
  has_elevator?: boolean | null
  furnished?: boolean | null
  price?: string | null
  rent_price?: string | null
  condo_fee?: string | null
  iptu?: string | null
  status?: PropertyStatus
  assigned_agent_id?: string | null
  owner_name?: string | null
  owner_contact?: string | null
  visibility_score?: number | null
  ideal_client_profile?: string | null
  main_image_url?: string | null
}

export interface ListPropertiesParams {
  skip?: number
  limit?: number
  property_type?: PropertyType
  business_type?: BusinessType
  status?: PropertyStatus
  city?: string
  state?: string
}

export interface AddressData {
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  latitude: string | null
  longitude: string | null
}

class PropertiesService {
  /**
   * List properties with filters and pagination
   */
  async listProperties(params: ListPropertiesParams = {}): Promise<Property[]> {
    const queryParams = new URLSearchParams()
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.property_type) queryParams.append('property_type', params.property_type)
    if (params.business_type) queryParams.append('business_type', params.business_type)
    if (params.status) queryParams.append('status', params.status)
    if (params.city) queryParams.append('city', params.city)
    if (params.state) queryParams.append('state', params.state)
    
    const queryString = queryParams.toString()
    const url = queryString ? `/properties?${queryString}` : '/properties'
    
    return apiClient.get<Property[]>(url)
  }

  /**
   * Get property by ID
   */
  async getPropertyById(propertyId: string): Promise<Property> {
    return apiClient.get<Property>(`/properties/${propertyId}`)
  }

  /**
   * Create a new property
   */
  async createProperty(propertyData: PropertyCreate): Promise<Property> {
    return apiClient.post<Property>('/properties', propertyData)
  }

  /**
   * Update a property
   */
  async updateProperty(propertyId: string, propertyData: PropertyUpdate): Promise<Property> {
    return apiClient.put<Property>(`/properties/${propertyId}`, propertyData)
  }

  /**
   * Delete a property
   */
  async deleteProperty(propertyId: string): Promise<void> {
    return apiClient.delete<void>(`/properties/${propertyId}`)
  }

  /**
   * Geocode an address using Google Geocoding API
   */
  async geocodeAddress(address: string): Promise<AddressData> {
    return apiClient.get<AddressData>(`/properties/geocode/address?address=${encodeURIComponent(address)}`)
  }
}

export const propertiesService = new PropertiesService()

