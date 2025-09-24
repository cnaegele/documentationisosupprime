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
            <div v-if="bISOProcessusSupprime">
                <div v-if="bGoelandManager" class="d-flex align-items-baseline">
                    <v-autocomplete v-model="serviceChoisi" label="Service" :items="servicesListeSelect" return-object
                        class="flex-0-0" style="width: 400px; min-width: 400px;" no-virtual clearable></v-autocomplete>
                </div>
                <div class="d-flex align-items-baseline">
                    <v-autocomplete v-model="documentationISOChoisie" :label="docISOLabel" :items="docsISOListeSelect"
                        return-object class="flex-0-0" style="width: 1200px; min-width: 400px;" no-virtual
                        clearable></v-autocomplete>
                </div>
            </div>
            <div v-if="idDocumentationISOChoisie > 0">
                Documentation ISO à supprimer : {{ nomDocumentationISOChoisie }}
            </div>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import type { ElementChoix, ApiResponseEC } from '@/axioscalls.ts'
import type { ApiResponseUI, UserInfo } from './CallerInfo.vue'
import type { ApiResponseIG } from './CallerIsInGroup.vue'
import { ref, computed, watch } from 'vue'
import CallerInfo from './CallerInfo.vue';
import CallerIsInGroup from './CallerIsInGroup.vue';
import { getDocsISOListe, getServicesListe } from '@/axioscalls.ts'

interface CritereRecherche {
    idservice: number
}

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
        docISOLabel.value = `documentation ISO: ${sChoix.title}`
        listeDocsISO(sChoix.value)
    }
})

watch(documentationISOChoisie, (docChoix) => {
    if (docChoix !== undefined && docChoix !== null) {
        idDocumentationISOChoisie.value = docChoix.value
        nomDocumentationISOChoisie.value = docChoix.title
    } else {
        idDocumentationISOChoisie.value = 0
        nomDocumentationISOChoisie.value = ''
    }
})

const listeDocsISO = async (idService: number): Promise<void> => {
    const oCritere: CritereRecherche = {
        idservice: idService
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
    console.log(servicesListeSelect.value)
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
</style>