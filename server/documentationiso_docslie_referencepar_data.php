<?php
require_once 'gdt/cldbgoeland.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$idProcessus = '0';
if (isset($_GET['jsoncriteres'])) {
    $jsonCriteres = $_GET['jsoncriteres'];
    $oCriteres = json_decode($jsonCriteres, false);
    if (isset($oCriteres->id)) {
        $idProcessus = $oCriteres->id;
    }
}
$sjsonDocListe = '';
$sjsonDocISORefListe = '';
$dbgo = new DBGoeland();
$bret = $dbgo->queryRetJson2("cn_isoprocessus_document_liste $idProcessus");
if ($bret === true) {
    $sjsonDocListe = $dbgo->resString;
} else {
    http_response_code(400);
    echo 'cn_isoprocessus_document_liste:' . $dbgo->resErreur;
    unset($dbgo);
    die;
}
$bret = $dbgo->queryRetJson2("cn_isoprocessus_referencepar_liste $idProcessus");
if ($bret === true) {
    $sjsonDocISORefListe = $dbgo->resString;
} else {
    http_response_code(400);
    echo 'cn_isoprocessus_referencepar_liste:' . $dbgo->resErreur;
    unset($dbgo);
    die;
}
unset($dbgo);
echo '[{"docliste":' . $sjsonDocListe . ',"docisorefliste":' . $sjsonDocISORefListe . '}]';

