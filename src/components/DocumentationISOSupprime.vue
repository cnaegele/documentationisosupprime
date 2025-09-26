<template>
    <CallerInfo :ssServer="ssServer" @callerinfo="receptionCallerInfo"></CallerInfo>
    <CallerIsInGroup :ssServer="ssServer" nomgroupe="GoelandManager"
        @calleringroup="receptionCallerInGroupGoelandManager"></CallerIsInGroup>
    <CallerIsInGroup :ssServer="ssServer" nomgroupe="ISOProcessusSupprime"
        @calleringroup="receptionCallerInGroupISOProcessusSupprime"></CallerIsInGroup>
    <v-app>
        <v-main>
            <v-app-bar color="primary" prominent density="compact" app>
                <v-toolbar-title>Documentation ISO, suppression</v-toolbar-title>

                <v-spacer></v-spacer>
                <div style="position: absolute; right: 16px;">
                    Utilisateur: {{ callerInformation?.prenom }} {{ callerInformation?.nom }} ({{
                        callerInformation?.login }}) - {{ callerInformation?.unite }}
                </div>
            </v-app-bar>
            <div v-if="messageErreur != ''" id="divErreur">{{ messageErreur }}</div>
            <v-container>
                <div v-if="bISOProcessusSupprime">
                    <div v-if="bGoelandManager" class="d-flex align-items-baseline">
                        <v-autocomplete v-model="serviceChoisi" label="Service" :items="servicesListeSelect"
                            return-object class="flex-0-0" style="width: 400px; min-width: 400px;" no-virtual
                            clearable></v-autocomplete>
                    </div>
                    <div class="d-flex align-items-baseline">
                        <v-autocomplete v-model="documentationISOChoisie" :label="docISOLabel"
                            :items="docsISOListeSelect" return-object class="flex-0-0"
                            style="width: 1200px; min-width: 400px;" no-virtual clearable></v-autocomplete>
                    </div>
                </div>
            </v-container>

            <v-container v-if="idDocumentationISOChoisie > 0">
                <v-btn color="error" variant="flat" @click="supprime(idDocumentationISOChoisie)">
                    <v-icon start>mdi-delete-forever</v-icon>
                    Confirmer la suppression
                </v-btn>
                <v-card class="mb-4" elevation="2">
                    <v-card-title class="text-h6 font-weight-bold">
                        Documentation ISO à supprimer : {{ nomDocumentationISOChoisie }}
                    </v-card-title>
                    <v-card-text>
                        <div class="text-h6 font-weight-medium px-0">
                            {{ labelDocumentLie }}
                        </div>
                        <v-list density="compact" class="py-0">
                            <v-list-item v-for="element in docISOInfo[0]?.docliste" :key="element.value" class="px-4">
                                <v-list-item-title>
                                    <span v-if="element.nbrafflie === 0">{{ element.title }} <span
                                            class="text-warning">(sera supprimé)</span></span>
                                    <span v-else class="text-warning">
                                        {{ element.title }} (ne sera pas supprimé,
                                        <span v-if="element.nbrafflie === 1"> 1 affaire liée)</span>
                                        <span v-else> {{ element.nbrafflie }} affaires liées)</span>
                                    </span>
                                </v-list-item-title>
                                <template v-slot:prepend>
                                    <v-icon size="small">mdi-circle-small</v-icon>
                                </template>
                            </v-list-item>
                        </v-list>
                        <div v-if="nbrDocISORef > 0">
                            <div class="text-h6 text-warning font-weight-medium px-0">
                                {{ labelDocISORef }}
                            </div>
                            <v-list density="compact" class="py-0">
                                <v-list-item v-for="element in docISOInfo[0]?.docisorefliste" :key="element.value"
                                    class="px-4">
                                    <v-list-item-title>
                                        {{ element.title }}
                                    </v-list-item-title>
                                    <template v-slot:prepend>
                                        <v-icon size="small">mdi-circle-small</v-icon>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-card-text>
                </v-card>
            </v-container>
            <div v-if="messageLog != ''" id="divLog">{{ messageLog }}</div>

        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import type { ElementChoix, ApiResponseEC, ApiResponseDI, DocISOInfo, ApiResponse } from '@/axioscalls.ts'
import type { ApiResponseUI, UserInfo } from './CallerInfo.vue'
import type { ApiResponseIG } from './CallerIsInGroup.vue'
import { ref, computed, watch } from 'vue'
import CallerInfo from './CallerInfo.vue';
import CallerIsInGroup from './CallerIsInGroup.vue';
import { getDocISOInfo, getDocsISOListe, getServicesListe, supprimeDocumentationISO } from '@/axioscalls.ts'

interface Critere {
    id: number
}

const messageLog = ref<string>('')
const messageErreur = ref<string>('')
const ssServer = ref<string>('')
if (import.meta.env.DEV) {
    ssServer.value = 'https://mygolux.lausanne.ch'
}

//Data caller et droits caller
const callerInformation = ref<UserInfo | null | undefined>(null)
const bGoelandManager = ref<boolean>(false)
const bISOProcessusSupprime = ref<boolean>(false)

//Variables de suivi du chargement data caller
const callerInfoLoaded = ref<boolean>(false)
const goelandManagerLoaded = ref<boolean>(false)
const isoProcessusSupprimeLoaded = ref<boolean>(false)

const allDataCallerLoaded = computed(() =>
    callerInfoLoaded.value &&
    goelandManagerLoaded.value &&
    isoProcessusSupprimeLoaded.value
)

const docISOLabel = ref<string>('documentation iso: ')
const docsISOListeSelect = ref<ElementChoix[]>([])
const servicesListeSelect = ref<ElementChoix[]>([])
const documentationISOChoisie = ref<ElementChoix | null>(null)
const idDocumentationISOChoisie = ref<number>(0)
const nomDocumentationISOChoisie = ref<string>('')
const serviceChoisi = ref<ElementChoix | null>(null)
const docISOInfo = ref<DocISOInfo[]>([])

const labelDocumentLie = computed(() => {
    const docCount = docISOInfo.value[0]?.docliste?.length ?? 0
    if (docCount === 0) return 'Aucun document lié'
    if (docCount === 1) return 'Document lié'
    return 'Documents liés' //plus que 1
})

const nbrDocISORef = computed(() => {
    return docISOInfo.value[0]?.docisorefliste?.length ?? 0
})

const labelDocISORef = computed(() => {
    const docISORefCount = docISOInfo.value[0]?.docisorefliste?.length ?? 0
    if (docISORefCount === 0) return ''
    if (docISORefCount === 1) return 'Attention 1 documentation ISO fait référence à la documentation ISO à supprimer'
    return `Attention ${docISORefCount} documentations ISO font référence a la documentation ISO à supprimer` //plus que 1
})

watch(allDataCallerLoaded, (isLoaded) => {
    if (isLoaded) {
        if (!bISOProcessusSupprime.value) {
            messageErreur.value += "Vous n'avez pas le droit de supprimer des documentations ISO (groupe de sécurité ISOProcessusSupprime).\n"
        } else {
            //Liste des documentations ISO du service
            if (callerInformation.value !== undefined && callerInformation.value !== null) {
                docISOLabel.value = `documentation ISO: ${callerInformation.value.service}`
                listeDocsISO(callerInformation.value.idservice)
            }
        }

        if (bGoelandManager.value) {
            //Liste des services avec documentation ISO
            listeServices()
        }
    }
})

watch(serviceChoisi, (sChoix) => {
    if (sChoix !== undefined && sChoix !== null) {
        documentationISOChoisie.value = null
        docISOLabel.value = `documentation ISO: ${sChoix.title}`
        listeDocsISO(sChoix.value)
    }
})

watch(documentationISOChoisie, (docChoix) => {
    if (docChoix !== undefined && docChoix !== null) {
        idDocumentationISOChoisie.value = docChoix.value
        nomDocumentationISOChoisie.value = docChoix.title
        infoDocumentationISO(docChoix.value)
    } else {
        idDocumentationISOChoisie.value = 0
        nomDocumentationISOChoisie.value = ''
    }
})

const listeDocsISO = async (idService: number): Promise<void> => {
    const oCritere: Critere = {
        id: idService
    }
    const response: ApiResponseEC = await getDocsISOListe(ssServer.value, '/goeland/documentationiso/axios/documentationiso_liste.php', JSON.stringify(oCritere))
    if (response.success === false) {
        messageErreur.value += `${response.message}\n`
    }
    const returnListe: ElementChoix[] = response.success && response.data ? response.data : []
    docsISOListeSelect.value = returnListe
}

const listeServices = async (): Promise<void> => {
    const response: ApiResponseEC = await getServicesListe(ssServer.value, '/goeland/documentationiso/axios/documentationiso_services_liste.php')
    if (response.success === false) {
        messageErreur.value += `${response.message}\n`
    }
    const returnListe: ElementChoix[] = response.success && response.data ? response.data : []
    servicesListeSelect.value = returnListe
}

const infoDocumentationISO = async (idDocumentationIso: number): Promise<void> => {
    const oCritere: Critere = {
        id: idDocumentationIso
    }
    const response: ApiResponseDI = await getDocISOInfo(ssServer.value, '/goeland/documentationiso/axios/documentationiso_docslie_referencepar_data.php', JSON.stringify(oCritere))
    if (response.success === false) {
        messageErreur.value += `${response.message}\n`
    }
    const returnListe: DocISOInfo[] = response.success && response.data ? response.data : []
    docISOInfo.value = returnListe
}

const supprime = async (idISOProcessus: number) => {
    const oData: Critere = {
        id: idISOProcessus
    }
    const response: ApiResponse<number[]> = await supprimeDocumentationISO(ssServer.value, '/goeland/documentationiso/axios/documentationiso_supprime.php', JSON.stringify(oData))
    if (response.success === false) {
        messageErreur.value = `${response.message}\n`
    } else {
        if (messageLog.value !== "") {
            messageLog.value += `\n`    
        }
        messageLog.value += `Supression effectuée de ${nomDocumentationISOChoisie.value}`
        idDocumentationISOChoisie.value = 0
        nomDocumentationISOChoisie.value = ''
        documentationISOChoisie.value = null
        if (serviceChoisi.value !== undefined && serviceChoisi.value !== null) {
            listeDocsISO(serviceChoisi.value.value)
        }
    }
}

const receptionCallerInfo = (jsonData: string) => {
    const retCallerInformation = ref<ApiResponseUI>(JSON.parse(jsonData))
    if (retCallerInformation.value.success) {
        callerInformation.value = retCallerInformation.value.data
    }
    callerInfoLoaded.value = true
}

const receptionCallerInGroupISOProcessusSupprime = (jsonData: string) => {
    const retCallerInGroup = ref<ApiResponseIG>(JSON.parse(jsonData))
    if (retCallerInGroup.value.success && retCallerInGroup.value.data !== undefined) {
        bISOProcessusSupprime.value = retCallerInGroup.value.data.isingroup
    }
    isoProcessusSupprimeLoaded.value = true
}

const receptionCallerInGroupGoelandManager = (jsonData: string) => {
    const retCallerInGroup = ref<ApiResponseIG>(JSON.parse(jsonData))
    if (retCallerInGroup.value.success && retCallerInGroup.value.data !== undefined) {
        bGoelandManager.value = retCallerInGroup.value.data.isingroup
        goelandManagerLoaded.value = true
    }
}
</script>

<style scoped>
#divErreur {
    background-color: lightsalmon;
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 0px;
    padding: 5px;
    border-style: solid;
    border-width: thin;
    border-color: black;
    border-radius: 20px;
    white-space: pre-line;
    /* Convertit les \n en sauts de ligne */
}
#divLog {
    font-size: small;
    background-color: rgb(234, 238, 238);
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 0px;
    padding: 5px;
    border-style: solid;
    border-width: thin;
    border-color: black;
    border-radius: 20px;
    white-space: pre-line;
    /* Convertit les \n en sauts de ligne */
}
</style>