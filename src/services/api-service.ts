import { HttpClient } from './http-client'

class ApiService {
  _httpClient = new HttpClient()
}

export const apiService = new ApiService()
