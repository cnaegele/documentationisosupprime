import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
export interface ElementChoix {
    value: number
    title: string
}
export interface ApiResponseEC {
    success: boolean
    message: string
    data?: ElementChoix[]
}
// Interface générique pour les réponses API
interface ApiResponse<T> {
    success: boolean
    message: string
    data?: T[]
}

export async function getDocsISOListe(server: string = '', page: string, jsonCriteres: string = '{}'): Promise<ApiResponseEC> {
    console.log(jsonCriteres)
    const urlol: string = `${server}${page}`
    const params = new URLSearchParams([['jsoncriteres', jsonCriteres]])
    try {
        const response: AxiosResponse<ElementChoix[]> = await axios.get(urlol, { params })
        const respData: ApiResponseEC = {
            "success": true,
            "message": `ok`,
            "data": response.data
        }
        return respData
    } catch (error) {
        return traiteAxiosError(error as AxiosError)
    }
}

export async function getServicesListe(server: string = '', page: string): Promise<ApiResponseEC> {
    const urlsl: string = `${server}${page}`
    try {
        const response: AxiosResponse<ElementChoix[]> = await axios.get(urlsl)
        const respData: ApiResponseEC = {
            "success": true,
            "message": `ok`,
            "data": response.data
        }
        return respData
    } catch (error) {
        return traiteAxiosError(error as AxiosError)
    }
}

function traiteAxiosError<T>(error: AxiosError): ApiResponse<T> {
    let msgErr: string = ''
   if (error.response) {
        msgErr = `${error.response.data}\nstatus: ${error.response.status}\n${error.response.headers}`
    } else if (error.request.responseText) {
        msgErr = error.request.responseText
    } else {
        msgErr = error.message
    }
    const respData: ApiResponse<T> = {
        "success": false,
        "message": `ERREUR. ${msgErr}`,
    }
    console.log(respData)
    return respData
}