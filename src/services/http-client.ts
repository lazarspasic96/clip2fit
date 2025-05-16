import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export class HttpClient {
  http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: 'https://api.clip2fit.app/api/transcript',
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_API_KEY,
      },
    })
    this.http.interceptors.response.use(
      response => response,
      error => {
        throw error
      }
    )
  }
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.get<T>(path, config)
  }

  async post<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.post<T>(path, data, config)
  }

  async put<T>(
    path: string,
    payload: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.http.put<T>(path, payload, config)
  }

  async patch<T>(
    path: string,
    payload: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.http.patch<T>(path, payload, config)
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.delete<T>(path, config)
  }
}
