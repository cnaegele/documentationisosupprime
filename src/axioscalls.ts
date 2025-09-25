import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
export interface ElementChoix {
    value: number
    title: string
}
interface document {
    value: number
    title: string
    nbrafflie: number
}
interface docisoref {
    value: number
    title: string
}
export interface DocISOInfo {
    docliste?: document[]
    docisorefliste?: docisoref[]
}
export interface ApiResponseEC {
    success: boolean
    message: string
    data?: ElementChoix[]
}
export interface ApiResponseDI {
    success: boolean
    message: string
    data?: DocISOInfo[]
}
// Interface générique pour les réponses API
export interface ApiResponse<T> {
    success: boolean
    message: string
    data?: T[]
}

export async function getDocISOInfo(server: string = '', page: string, jsonCriteres: string = '{}'): Promise<ApiResponseDI> {
    const urlol: string = `${server}${page}`
    const params = new URLSearchParams([['jsoncriteres', jsonCriteres]])
    try {
        const response: AxiosResponse<DocISOInfo[]> = await axios.get(urlol, { params })
        const respData: ApiResponseDI = {
            "success": true,
            "message": `ok`,
            "data": response.data
        }
        return respData
    } catch (error) {
        return traiteAxiosError(error as AxiosError)
    }
}

export async function getDocsISOListe(server: string = '', page: string, jsonCriteres: string = '{}'): Promise<ApiResponseEC> {
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

export async function supprimeDocumentationISO(server: string = '', page: string, jsonData: string = '{}'): Promise<ApiResponse<number[]>> {
    const urlsd: string = `${server}${page}`
    try {
        const response: AxiosResponse = await axios.post(urlsd, jsonData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log(response.data)
        return response.data
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